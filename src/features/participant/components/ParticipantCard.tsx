import type { Participant } from "../types/participant.types";
import styles from "@/screens/common/ParticipantListScreen.module.css";

interface ParticipantCardProps {
  participant: Participant;
}

export default function ParticipantCard({ participant }: ParticipantCardProps) {
  const isPublic = participant.visibility === "public";

  return (
    <li className={styles.participantItem}>
      <div
        className={styles.avatar}
        style={{ backgroundColor: participant.color }}
      >
        {participant.initials}
      </div>

      <div className={styles.participantInfo}>
        <strong>{participant.name}</strong>
        <span>{participant.department}</span>
      </div>

      <span className={isPublic ? styles.publicBadge : styles.privateBadge}>
        {isPublic ? "공개" : "비공개"}
      </span>
    </li>
  );
}
