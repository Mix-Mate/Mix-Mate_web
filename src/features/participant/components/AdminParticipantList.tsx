import type { AdminParticipant } from "../types/participant.types";
import AdminParticipantItem from "./AdminParticipantItem";
import styles from "@/screens/admin/AdminParticipantManagementScreen.module.css";

interface AdminParticipantListProps {
  groupId: string;
  participants: AdminParticipant[];
  round: 1 | 2;
}

export default function AdminParticipantList({
  groupId,
  participants,
  round,
}: AdminParticipantListProps) {
  if (participants.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>검색 결과가 없습니다</p>
      </div>
    );
  }

  return (
    <ul className={styles.participantList}>
      {participants.map((participant) => (
        <AdminParticipantItem
          key={participant.id}
          groupId={groupId}
          participant={participant}
          round={round}
        />
      ))}
    </ul>
  );
}
