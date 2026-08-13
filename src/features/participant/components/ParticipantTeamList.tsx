import { Search } from "lucide-react";
import type { ParticipantTeam } from "../types/participant.types";
import ParticipantCard from "./ParticipantCard";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantTeamListProps {
  teams: ParticipantTeam[];
}

export default function ParticipantTeamList({
  teams,
}: ParticipantTeamListProps) {
  if (teams.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Search aria-hidden="true" size={54} strokeWidth={1.8} />
        <p>검색 결과가 없습니다</p>
      </div>
    );
  }

  return (
    <div className={styles.teamList}>
      {teams.map((team) => (
        <section key={team.teamNumber} className={styles.teamBox}>
          <header className={styles.teamHeader}>
            <span className={styles.teamBadge}>{team.teamNumber}</span>
            <strong>{team.teamNumber}조</strong>
            <span>{team.members.length}명</span>
          </header>

          <ul className={styles.participantList}>
            {team.members.map((participant) => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}