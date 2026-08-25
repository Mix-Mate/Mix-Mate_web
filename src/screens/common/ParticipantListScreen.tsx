"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { useParticipantListQuery } from "@/features/participant/hooks/useParticipantListQuery";
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
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<ParticipantFilterValue>("all");
  const [viewMode, setViewMode] = useState<ParticipantViewMode>("all");
  const [privateParticipant, setPrivateParticipant] =
    useState<Participant | null>(null);
  const { data } = useParticipantListQuery();

  const filteredParticipants = useMemo(() => {
    const trimmedKeyword = keyword.trim();

    return data.participants.filter((participant) => {
      const matchesKeyword =
        !trimmedKeyword || participant.name.includes(trimmedKeyword);
      const matchesFilter = filter === "all" || participant.role === filter;

      return matchesKeyword && matchesFilter;
    });
  }, [data.participants, filter, keyword]);

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
      fillHeight
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
