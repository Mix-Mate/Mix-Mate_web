"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useMyGroupProfileQuery } from "@/features/profile/hooks/useMyGroupProfileQuery";
import type { MyGroupProfile } from "@/features/profile/types/profile.types";
import type {
  Participant,
  ParticipantTeam,
  ParticipantViewMode,
} from "@/features/participant/types/participant.types";
import { groupRoutes } from "@/shared/lib/navigation/routes";
import { toAssignmentRound } from "@/shared/lib/navigation/validate-round";
import useToast from "@/shared/hooks/useToast";
import MobileFrame from "@/shared/ui/MobileFrame";
import Toast from "@/shared/ui/Toast";
import styles from "./ParticipantListScreen.module.css";
import VoteResultListScreen from "./VoteResultListScreen";

const gradeLabelMap = {
  FIRST: "1학년",
  SECOND: "2학년",
  THIRD: "3학년",
  FOURTH: "4학년",
  OTHER: "기타",
} as const;

function enrichParticipantWithMyProfile(
  participant: Participant,
  myProfile: MyGroupProfile | null,
  myParticipantId: string | null,
) {
  if (!myProfile) {
    return participant;
  }

  const isSameParticipant = myParticipantId
    ? participant.id === myParticipantId
    : participant.name === myProfile.displayName &&
      participant.department === myProfile.major;

  if (!isSameParticipant) {
    return participant;
  }

  return {
    ...participant,
    name: myProfile.displayName,
    department: myProfile.major,
    visibility: myProfile.visibility === "PUBLIC" ? "public" : "private",
    role: myProfile.position === "STAFF" ? "staff" : "general",
    gender: myProfile.gender === "FEMALE" ? "female" : "male",
    grade: gradeLabelMap[myProfile.grade],
    isNew: myProfile.isNew,
    mbti: myProfile.mbti,
    age: myProfile.age ?? undefined,
    instagramId: myProfile.instaId ?? undefined,
    bio: myProfile.bio ?? undefined,
  } satisfies Participant;
}

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
  const [shouldLoadTeams, setShouldLoadTeams] = useState(false);
  const [privateParticipant, setPrivateParticipant] =
    useState<Participant | null>(null);
  const { message: toastMessage, showToast } = useToast();
  const { data: group } = useAdminGroupQuery(params.groupId);
  const roundParam = searchParams.get("round");
  const round =
    roundParam
      ? toAssignmentRound(roundParam)
      : group
        ? getCurrentGroupRound(group.status)
        : 1;
  const { data } = useParticipantListQuery(params.groupId, {
    includeTeams: shouldLoadTeams,
    round,
  });
  const { data: myProfile } = useMyGroupProfileQuery(params.groupId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("adminToast");
      if (stored) {
        showToast(stored);
        sessionStorage.removeItem("adminToast");
      }
    }
  }, [showToast]);
  const isRecruiting = group?.status === "RECRUITING";
  const canViewPrivateProfiles = group?.myRole === "HOST";
  const canAddParticipant = group?.myRole === "HOST" && isRecruiting;
  const myParticipantId =
    myProfile?.id && myProfile.id !== "me"
      ? myProfile.id
      : group?.myParticipantId
        ? String(group.myParticipantId)
        : null;
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

  const filteredParticipants = useMemo(() => {
    const trimmedKeyword = keyword.trim();

    const participants = enrichedParticipants.filter((participant) => {
      const matchesKeyword =
        !trimmedKeyword || participant.name.includes(trimmedKeyword);
      const matchesFilter = filter === "all" || participant.role === filter;

      return matchesKeyword && matchesFilter;
    });

    return participants.sort((first, second) => {
      const firstIsMe = isMyParticipant(first);
      const secondIsMe = isMyParticipant(second);

      if (firstIsMe !== secondIsMe) return firstIsMe ? -1 : 1;

      const firstIsStaff = first.role === "staff";
      const secondIsStaff = second.role === "staff";

      if (firstIsStaff !== secondIsStaff) return firstIsStaff ? -1 : 1;

      return 0;
    });
  }, [enrichedParticipants, filter, isMyParticipant, keyword]);

  const filteredTeams = useMemo(() => {
    const trimmedKeyword = keyword.trim();

    return enrichedTeams
      .map((team) => ({
        ...team,
        members: team.members.filter((participant) => {
          const matchesKeyword =
            !trimmedKeyword || participant.name.includes(trimmedKeyword);
          const matchesFilter = filter === "all" || participant.role === filter;

          return matchesKeyword && matchesFilter;
        }),
      }))
      .filter((team) => team.members.length > 0);
  }, [enrichedTeams, filter, keyword]);

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
    >
      <ParticipantPageHeader
        groupName={group?.groupName}
        participantCount={data.participants.length}
        backHref={backHref}
      />

      <div className={styles.content}>
        <ParticipantHelpBox />
        <ParticipantSearch value={keyword} onChange={setKeyword} />
        <ParticipantStats count={data.participants.length} />
        {!isRecruiting && (
          <ParticipantViewToggle
            value={viewMode}
            onChange={(nextViewMode) => {
              setViewMode(nextViewMode);
              if (nextViewMode === "team") setShouldLoadTeams(true);
            }}
          />
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
              onPrivateSelect={setPrivateParticipant}
              canViewPrivateProfiles={canViewPrivateProfiles}
            />
          ) : (
            <ParticipantTeamList
              teams={filteredTeams}
              round={round}
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

      {toastMessage && (
        <Toast className={styles.toast} role="status">
          {toastMessage}
        </Toast>
      )}
    </MobileFrame>
  );
}
