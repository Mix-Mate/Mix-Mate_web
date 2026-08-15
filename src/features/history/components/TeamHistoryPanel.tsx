import { UsersRound } from "lucide-react";
import TeamMemberList from "@/features/team/components/TeamMemberList";
import type {
  MyTeamData,
  TeamMemberSummary,
} from "@/features/team/types/team.types";
import InfoBanner from "@/shared/ui/InfoBanner";
import styles from "./team-history.module.css";

interface TeamHistoryPanelProps {
  team: MyTeamData;
  onMemberSelect: (member: TeamMemberSummary) => void;
}

export default function TeamHistoryPanel({
  team,
  onMemberSelect,
}: TeamHistoryPanelProps) {
  return (
    <div className={styles.content}>
      <InfoBanner className={styles.notice}>
        이전 회차의 조와 조원 목록을 확인할 수 있습니다.
      </InfoBanner>

      <section
        className={styles.record}
        aria-labelledby="round-one-record-title"
      >
        <h2 id="round-one-record-title">1차 술자리 기록</h2>

        <div className={styles.teamCard}>
          <div className={styles.teamSummary}>
            <span className={styles.teamIcon}>
              <UsersRound aria-hidden="true" size={18} strokeWidth={1.7} />
            </span>
            <p>
              <span>1차 · 내 조:</span>
              <strong>{team.teamNumber}조</strong>
            </p>
          </div>

          <TeamMemberList
            className={styles.memberList}
            members={team.members}
            onSelect={onMemberSelect}
          />
        </div>
      </section>
    </div>
  );
}
