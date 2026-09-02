"use client";

import { Check, CircleCheck, CircleX } from "lucide-react";
import { useState } from "react";
import {
  correctSecondRoundVoteByHost,
  voteSecondRoundByHost,
} from "../../api/adminSecondRoundVote.api";
import type { SecondRoundVoteChoice } from "../../types/secondRoundVote.types";
import type { SecondRoundVoteParticipant } from "../../types/secondRoundVoteStatus.types";
import styles from "./AdminManualVoteControl.module.css";

interface AdminManualVoteControlProps {
  groupId: string;
  member: SecondRoundVoteParticipant;
  onVoteChange: () => void;
}

export default function AdminManualVoteControl({
  groupId,
  member,
  onVoteChange,
}: AdminManualVoteControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (choice: SecondRoundVoteChoice) => {
    setIsOpen(false);
    setIsSubmitting(true);
    setError(null);

    try {
      if (member.choice === null) {
        await voteSecondRoundByHost(groupId, member.participantId, choice);
      } else {
        await correctSecondRoundVoteByHost(
          groupId,
          member.participantId,
          choice,
        );
      }
      onVoteChange();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "처리에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.voteDropdown}>
      <button
        type="button"
        className={`${styles.voteDropdownTrigger} ${
          isOpen ? styles.voteDropdownTriggerActive : ""
        }`}
        disabled={isSubmitting}
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={`${member.displayName} 수동 투표`}
      >
        {member.choice === "PARTICIPATE" && (
          <CircleCheck
            className={styles.attendanceIcon}
            size={18}
            strokeWidth={2}
          />
        )}
        {member.choice === "NOT_PARTICIPATE" && (
          <CircleX className={styles.absenceIcon} size={18} strokeWidth={2} />
        )}
        {member.choice === null && (
          <>
            <span>수동 투표</span>
            <span
              className={`${styles.voteDropdownArrow} ${
                isOpen ? styles.voteDropdownArrowOpen : ""
              }`}
            >
              ▾
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className={styles.voteDropdownBackdrop}
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
          />
          <div className={styles.voteDropdownMenu} role="menu">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={member.choice === "PARTICIPATE"}
              className={`${styles.voteDropdownItem} ${
                member.choice === "PARTICIPATE"
                  ? styles.voteDropdownItemActive
                  : ""
              }`}
              onClick={() => {
                void handleSelect("PARTICIPATE");
              }}
            >
              <CircleCheck
                className={styles.attendanceIcon}
                size={16}
                strokeWidth={2}
              />
              참가
              {member.choice === "PARTICIPATE" && (
                <Check
                  className={styles.voteDropdownCheck}
                  size={14}
                  strokeWidth={2.5}
                />
              )}
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={member.choice === "NOT_PARTICIPATE"}
              className={`${styles.voteDropdownItem} ${
                member.choice === "NOT_PARTICIPATE"
                  ? styles.voteDropdownItemActive
                  : ""
              }`}
              onClick={() => {
                void handleSelect("NOT_PARTICIPATE");
              }}
            >
              <CircleX
                className={styles.absenceIcon}
                size={16}
                strokeWidth={2}
              />
              불참
              {member.choice === "NOT_PARTICIPATE" && (
                <Check
                  className={styles.voteDropdownCheck}
                  size={14}
                  strokeWidth={2.5}
                />
              )}
            </button>
          </div>
        </>
      )}

      {error && (
        <span className={styles.rowError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
