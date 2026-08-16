import Link from "next/link";
import type { AdminParticipant } from "../types/participant.types";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "@/screens/admin/AdminParticipantManagementScreen.module.css";

interface AdminParticipantItemProps {
  groupId: string;
  participant: AdminParticipant;
}

export default function AdminParticipantItem({
  groupId,
  participant,
}: AdminParticipantItemProps) {
  const roleLabel = participant.role === "staff" ? "운영진" : "일반";
  const badgeLabel =
    participant.role === "staff" ? "운영진" : participant.isNew ? "신입" : "기존";
  const badgeClassName =
    participant.role === "staff"
      ? styles.staffBadge
      : participant.isNew
        ? styles.newBadge
        : styles.existingBadge;

  return (
    <li>
      <Link
        href={`/groups/${groupId}/participants/${participant.id}?role=admin`}
        className={styles.participantItem}
      >
        <GenderAvatar
          gender={participant.gender}
          name={participant.name}
          size={42}
        />

        <div className={styles.participantInfo}>
          <strong>{participant.name}</strong>
          <span>
            {participant.grade} · {roleLabel}
          </span>
        </div>

        <span className={badgeClassName}>{badgeLabel}</span>
      </Link>
    </li>
  );
}
