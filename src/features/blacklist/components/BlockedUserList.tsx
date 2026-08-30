"use client";

import { Ban } from "lucide-react";
import type { BlockedParticipant } from "../types/blacklist.types";
import GenderAvatar from "@/shared/ui/GenderAvatar";
import styles from "@/screens/admin/BlacklistScreen.module.css";

interface BlockedUserListProps {
  participants: BlockedParticipant[];
  onSelect: (participant: BlockedParticipant) => void;
}

export default function BlockedUserList({
  participants,
  onSelect,
}: BlockedUserListProps) {
  if (participants.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Ban aria-hidden="true" size={54} strokeWidth={1.5} />
        <p>차단된 사용자가 없습니다</p>
      </div>
    );
  }

  return (
    <ul className={styles.participantList}>
      {participants.map((participant) => {
        const displayName =
          participant.displayName || participant.name || "사용자";
        const subInfo =
          participant.department || participant.email || "";

        return (
          <li key={participant.userId || participant.id}>
            <button
              type="button"
              className={styles.participantItem}
              onClick={() => onSelect(participant)}
            >
              <GenderAvatar
                gender={participant.gender || "male"}
                name={displayName}
                size={48}
              />

              <div className={styles.participantInfo}>
                <div className={styles.nameRow}>
                  <strong>{displayName}</strong>
                  {subInfo && (
                    <span className={styles.department}>{subInfo}</span>
                  )}
                </div>
                {participant.reason && (
                  <span className={styles.reasonText}>
                    사유: {participant.reason}
                  </span>
                )}
              </div>

              <div className={styles.badgeWrapper}>
                <span className={styles.blockedBadge}>차단됨</span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
