import Link from "next/link";
import type { AdminParticipant } from "../types/participant.types";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "@/screens/admin/AdminParticipantManagementScreen.module.css";

interface AdminParticipantItemProps {
  groupId: string;
  participant: AdminParticipant;
  round: 1 | 2;
}

export default function AdminParticipantItem({
  groupId,
  participant,
  round,
}: AdminParticipantItemProps) {
  const roleLabel = participant.role === "staff" ? "운영진" : "일반";

  return (
    <li>
      <Link
        href={`/groups/${groupId}/participants/${participant.id}?round=${round}&role=admin`}
        className={styles.participantItem}
      >
        <GenderAvatar
          gender={participant.gender}
          name={participant.name}
          toneKey={participant.id}
          size={68}
        />

        <div className={styles.participantInfo}>
          <div className={styles.nameRow}>
            <strong>{participant.name}</strong>
            {participant.role === "staff" && (
              <span className={styles.staffBadge}>운영진</span>
            )}
          </div>
          <span>
            {participant.grade} · {roleLabel}
          </span>
        </div>
      </Link>
    </li>
  );
}
