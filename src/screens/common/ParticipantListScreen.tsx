"use client";

import { useMemo, useState } from "react";
import ParticipantFilter from "@/features/participant/components/ParticipantFilter";
import type { ParticipantFilterValue } from "@/features/participant/components/ParticipantFilter";
import ParticipantHelpBox from "@/features/participant/components/ParticipantHelpBox";
import ParticipantList from "@/features/participant/components/ParticipantList";
import ParticipantPageHeader from "@/features/participant/components/ParticipantPageHeader";
import ParticipantSearch from "@/features/participant/components/ParticipantSearch";
import ParticipantStats from "@/features/participant/components/ParticipantStats";
import { useParticipantListQuery } from "@/features/participant/hooks/useParticipantListQuery";
import styles from "./ParticipantListScreen.module.css";

export default function ParticipantListScreen() {
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<ParticipantFilterValue>("all");
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

  return (
    <main className={styles.viewport}>
      <section className={styles.phone}>
        <ParticipantPageHeader
          groupName={data.groupName}
          participantCount={data.participants.length}
        />

        <div className={styles.content}>
          <ParticipantHelpBox />
          <ParticipantSearch value={keyword} onChange={setKeyword} />
          <ParticipantStats count={data.participants.length} />
          <ParticipantFilter value={filter} onChange={setFilter} />

          <section className={styles.listBox}>
            <ParticipantList participants={filteredParticipants} />
          </section>
        </div>
      </section>
    </main>
  );
}
