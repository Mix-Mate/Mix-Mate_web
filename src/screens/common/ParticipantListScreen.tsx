"use client";

import { useMemo, useState } from "react";
import { LockKeyhole } from "lucide-react";
import ParticipantFilter from "@/features/participant/components/ParticipantFilter";
import type { ParticipantFilterValue } from "@/features/participant/components/ParticipantFilter";
import ParticipantHelpBox from "@/features/participant/components/ParticipantHelpBox";
import ParticipantList from "@/features/participant/components/ParticipantList";
import ParticipantPageHeader from "@/features/participant/components/ParticipantPageHeader";
import ParticipantSearch from "@/features/participant/components/ParticipantSearch";
import ParticipantStats from "@/features/participant/components/ParticipantStats";
import ParticipantTeamList from "@/features/participant/components/ParticipantTeamList";
import ParticipantViewToggle from "@/features/participant/components/ParticipantViewToggle";
import { useParticipantListQuery } from "@/features/participant/hooks/useParticipantListQuery";
import type {
  Participant,
  ParticipantViewMode,
} from "@/features/participant/types/participant.types";
import BottomSheetDialog from "@/shared/ui/BottomSheetDialog";
import Button from "@/shared/ui/Button";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import MobileFrame from "@/shared/ui/MobileFrame";
import styles from "./ParticipantListScreen.module.css";

export default function ParticipantListScreen() {
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

      <BottomSheetDialog
        open={privateParticipant !== null}
        titleId="private-profile-title"
        sheetClassName={styles.privateProfileSheet}
        onClose={() => setPrivateParticipant(null)}
      >
        {privateParticipant && (
          <div className={styles.privateProfileContent}>
            <GenderAvatar
              gender={privateParticipant.gender}
              name={privateParticipant.name}
              size={72}
            />
            <h2>{privateParticipant.name}</h2>
            <p>{privateParticipant.department}</p>

            <div className={styles.privateProfileDivider} />

            <section className={styles.privateProfileNotice}>
              <LockKeyhole aria-hidden="true" size={34} />
              <strong id="private-profile-title">비공개 프로필입니다</strong>
              <span>
                해당 참가자의 상세 프로필
                <br />
                정보는 확인할 수 없습니다.
              </span>
            </section>

            <Button onClick={() => setPrivateParticipant(null)}>닫기</Button>
          </div>
        )}
      </BottomSheetDialog>
    </MobileFrame>
  );
}
