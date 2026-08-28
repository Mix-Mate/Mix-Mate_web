"use client";

import { useCallback, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
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
import { useParticipantListQuery } from "@/features/participant/hooks/useParticipantListQuery";
import { useMyGroupProfileQuery } from "@/features/profile/hooks/useMyGroupProfileQuery";
import type {
  Participant,
  ParticipantViewMode,
} from "@/features/participant/types/participant.types";
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
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<ParticipantFilterValue>("all");
  const [viewMode, setViewMode] = useState<ParticipantViewMode>("all");
  const [privateParticipant, setPrivateParticipant] =
    useState<Participant | null>(null);
  const { data: group } = useAdminGroupQuery(params.groupId);
  const { data } = useParticipantListQuery(params.groupId, {
    polling: group?.myRole === "HOST" && group.status === "RECRUITING",
  });
  const { data: myProfile } = useMyGroupProfileQuery(params.groupId);

  const isMyParticipant = useCallback((participant: Participant) => {
    if (!myProfile) return false;

    const myGender = myProfile.gender === "FEMALE" ? "female" : "male";

    return (
      participant.id === String(myProfile.id) ||
      (participant.name === myProfile.displayName &&
        participant.department === myProfile.major &&
        participant.gender === myGender)
    );
  }, [myProfile]);

  const filteredParticipants = useMemo(() => {
    const trimmedKeyword = keyword.trim();

    const participants = data.participants.filter((participant) => {
      const matchesKeyword =
        !trimmedKeyword || participant.name.includes(trimmedKeyword);
      const matchesFilter = filter === "all" || participant.role === filter;

      return matchesKeyword && matchesFilter;
    });

    return participants.sort((first, second) => {
      const firstIsMe = isMyParticipant(first);
      const secondIsMe = isMyParticipant(second);

      if (firstIsMe === secondIsMe) return 0;
      return firstIsMe ? -1 : 1;
    });
  }, [data.participants, filter, isMyParticipant, keyword]);

  const filteredTeams = useMemo(() => {
    const trimmedKeyword = keyword.trim();

    return data.teams
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
  }, [data.teams, filter, keyword]);

  return (
    <MobileFrame
      className={styles.screenFrame}
      viewportClassName={styles.pageViewport}
    >
      <ParticipantPageHeader
        groupName={data.groupName}
        participantCount={data.participants.length}
      />

      <div className={styles.content}>
        <ParticipantHelpBox />
        <ParticipantSearch value={keyword} onChange={setKeyword} />
        <ParticipantStats count={data.participants.length} />
        <ParticipantViewToggle value={viewMode} onChange={setViewMode} />
        <ParticipantFilter value={filter} onChange={setFilter} />

        <section className={styles.listBox}>
          {viewMode === "all" ? (
            <ParticipantList
              participants={filteredParticipants}
              onPrivateSelect={setPrivateParticipant}
            />
          ) : (
            <ParticipantTeamList
              teams={filteredTeams}
              onPrivateSelect={setPrivateParticipant}
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
