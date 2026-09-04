"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ParticipantFilter from "@/features/participant/components/ParticipantFilter";
import type { ParticipantFilterValue } from "@/features/participant/components/ParticipantFilter";
import ParticipantHelpBox from "@/features/participant/components/ParticipantHelpBox";
import ParticipantList from "@/features/participant/components/ParticipantList";
import ParticipantPageHeader from "@/features/participant/components/ParticipantPageHeader";
import PrivateParticipantDialog from "@/features/participant/components/PrivateParticipantDialog";
import ParticipantSearch from "@/features/participant/components/ParticipantSearch";
import ParticipantStats from "@/features/participant/components/ParticipantStats";
import ParticipantTeamList from "@/features/participant/components/ParticipantTeamList";
import ParticipantViewToggle from "@/features/participant/components/ParticipantViewToggle";
import { useAdminGroupQuery } from "@/features/group/hooks/useAdminGroupQuery";
import { getCurrentGroupRound } from "@/features/group/model/group-status";
import { useParticipantListQuery } from "@/features/participant/hooks/useParticipantListQuery";
import {
  enrichParticipantWithMyProfile,
  resolveMyParticipantId,
} from "@/features/participant/model/enrich-participant-with-my-profile";
import { useMyGroupProfileQuery } from "@/features/profile/hooks/useMyGroupProfileQuery";
import type {
  Participant,
  ParticipantTeam,
  ParticipantViewMode,
} from "@/features/participant/types/participant.types";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./ParticipantListScreen.module.css";
import VoteResultListScreen from "./VoteResultListScreen";

export default function ParticipantListScreen() {
  const searchParams = useSearchParams();
  const resultListMode = searchParams.get("list");

  if (resultListMode === "mvp" || resultListMode === "second-round") {
    return <VoteResultListScreen mode={resultListMode} />;
  }

  return <DefaultParticipantListScreen />;
}

function DefaultParticipantListScreen() {
  const params = useParams<{ groupId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<ParticipantFilterValue>("all");
  const [viewMode, setViewMode] = useState<ParticipantViewMode>("all");
  const [privateParticipant, setPrivateParticipant] =
    useState<Participant | null>(null);
  const { data: group } = useAdminGroupQuery(params.groupId);
  const roundParam = searchParams.get("round");
  const round =
    roundParam
      ? toAssignmentRound(roundParam)
      : group
        ? getCurrentGroupRound(group.status)
        : 1;
  const { data: myProfile } = useMyGroupProfileQuery(params.groupId);
  const isRecruiting = group?.status === "RECRUITING";
  const canViewPrivateProfiles = group?.myRole === "HOST";
  const { data } = useParticipantListQuery(params.groupId, {
    detailRole: canViewPrivateProfiles ? "admin" : undefined,
    round,
  });
  const canAddParticipant = group?.myRole === "HOST" && isRecruiting;
  const myParticipantId = resolveMyParticipantId(
    myProfile,
    group?.myParticipantId,
  );
  const enrichedParticipants = useMemo(
    () =>
      data.participants.map((participant) =>
        enrichParticipantWithMyProfile(participant, myProfile, myParticipantId),
      ),
    [data.participants, myParticipantId, myProfile],
  );
  const enrichedTeams = useMemo<ParticipantTeam[]>(
    () =>
      data.teams.map((team) => ({
        ...team,
        members: team.members.map((participant) =>
          enrichParticipantWithMyProfile(participant, myProfile, myParticipantId),
        ),
      })),
    [data.teams, myParticipantId, myProfile],
  );
  const backHref =
    group?.myRole === "HOST" && group.status === "RECRUITING"
      ? groupRoutes.adminRecruitment(params.groupId)
      : groupRoutes.home(params.groupId);

  const isMyParticipant = useCallback((participant: Participant) => {
    return Boolean(myParticipantId && participant.id === myParticipantId);
  }, [myParticipantId]);

  const sortParticipantsByPriority = useCallback(
    (participants: Participant[]) =>
      [...participants].sort((first, second) => {
        const firstIsMe = isMyParticipant(first);
        const secondIsMe = isMyParticipant(second);

        if (firstIsMe !== secondIsMe) return firstIsMe ? -1 : 1;

        const firstIsStaff = first.role === "staff";
        const secondIsStaff = second.role === "staff";

        if (firstIsStaff !== secondIsStaff) return firstIsStaff ? -1 : 1;

        return 0;
      }),
    [isMyParticipant],
  );

  const filteredParticipants = useMemo(() => {
    const trimmedKeyword = keyword.trim();

    const participants = enrichedParticipants.filter((participant) => {
      const matchesKeyword =
        !trimmedKeyword || participant.name.includes(trimmedKeyword);
      const matchesFilter = filter === "all" || participant.role === filter;

      return matchesKeyword && matchesFilter;
    });

    return sortParticipantsByPriority(participants);
  }, [enrichedParticipants, filter, keyword, sortParticipantsByPriority]);

  const filteredTeams = useMemo(() => {
    const trimmedKeyword = keyword.trim();

    return enrichedTeams
      .map((team) => ({
        ...team,
        members: sortParticipantsByPriority(
          team.members.filter((participant) => {
            const matchesKeyword =
              !trimmedKeyword || participant.name.includes(trimmedKeyword);
            const matchesFilter = filter === "all" || participant.role === filter;

            return matchesKeyword && matchesFilter;
          }),
        ),
      }))
      .filter((team) => team.members.length > 0);
  }, [enrichedTeams, filter, keyword, sortParticipantsByPriority]);

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
    >
      <ParticipantPageHeader
        groupName={data.groupName}
        participantCount={data.participants.length}
        backHref={backHref}
      />

      <div className={styles.content}>
        <ParticipantHelpBox />
        <ParticipantSearch value={keyword} onChange={setKeyword} />
        <ParticipantStats count={data.participants.length} />
        {!isRecruiting && (
          <ParticipantViewToggle value={viewMode} onChange={setViewMode} />
        )}
        <div className={styles.filterRow}>
          <ParticipantFilter value={filter} onChange={setFilter} />
          {canAddParticipant && (
            <button
              type="button"
              className={styles.addParticipantButton}
              onClick={() =>
                router.push(
                  groupRoutes.adminParticipantNew(
                    params.groupId,
                    round,
                    "participant-list",
                  ),
                )
              }
            >
              사용자 추가
            </button>
          )}
        </div>

        <section className={styles.listBox}>
          {viewMode === "all" ? (
            <ParticipantList
              participants={filteredParticipants}
              round={round}
              currentParticipantId={myParticipantId}
              onPrivateSelect={setPrivateParticipant}
              canViewPrivateProfiles={canViewPrivateProfiles}
            />
          ) : (
            <ParticipantTeamList
              teams={filteredTeams}
              round={round}
              currentParticipantId={myParticipantId}
              onPrivateSelect={setPrivateParticipant}
              canViewPrivateProfiles={canViewPrivateProfiles}
            />
          )}
        </section>
      </div>

      <PrivateParticipantDialog
        participant={privateParticipant}
        onClose={() => setPrivateParticipant(null)}
      />
    </MobileFrame>
  );
}
