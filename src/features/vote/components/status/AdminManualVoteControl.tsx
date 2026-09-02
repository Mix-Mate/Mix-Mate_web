"use client";

import { Check, CircleCheck, CircleX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  correctSecondRoundVoteByHost,
  voteSecondRoundByHost,
} from "../../api/adminSecondRoundVote.api";
import type { SecondRoundVoteChoice } from "../../types/secondRoundVote.types";
import type { SecondRoundVoteParticipant } from "../../types/secondRoundVoteStatus.types";
import styles from "./AdminManualVoteControl.module.css";

/** 메뉴는 목록의 overflow에 잘리지 않도록 body로 포털한다. 아래 값들은 위치 계산용. */
const MENU_WIDTH = 128;
const MENU_HEIGHT = 100;
const MENU_GAP = 6;
const VIEWPORT_MARGIN = 8;

interface AdminManualVoteControlProps {
  groupId: string;
  member: SecondRoundVoteParticipant;
  onVoteChange: () => void;
  onSubmittingChange?: (participantId: number, isSubmitting: boolean) => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

export default function AdminManualVoteControl({
  groupId,
  member,
  onVoteChange,
  onSubmittingChange,
}: AdminManualVoteControlProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOpen = menuPosition !== null;

  const closeMenu = useCallback(() => setMenuPosition(null), []);

  const openMenu = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward =
      spaceBelow < MENU_HEIGHT + MENU_GAP + VIEWPORT_MARGIN &&
      rect.top > MENU_HEIGHT + MENU_GAP + VIEWPORT_MARGIN;

    setMenuPosition({
      top: openUpward
        ? rect.top - MENU_HEIGHT - MENU_GAP
        : rect.bottom + MENU_GAP,
      left: Math.max(VIEWPORT_MARGIN, rect.right - MENU_WIDTH),
    });
  };

  // 스크롤/리사이즈로 트리거가 움직이면 메뉴 위치가 어긋나므로 닫는다.
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);

    return () => {
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, [closeMenu, isOpen]);

  const handleSelect = async (choice: SecondRoundVoteChoice) => {
    closeMenu();
    setIsSubmitting(true);
    setError(null);
    onSubmittingChange?.(member.participantId, true);

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
      onSubmittingChange?.(member.participantId, false);
    }
  };

  const renderChoiceItem = (
    choice: SecondRoundVoteChoice,
    label: string,
    icon: React.ReactNode,
  ) => (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={member.choice === choice}
      className={`${styles.voteDropdownItem} ${
        member.choice === choice ? styles.voteDropdownItemActive : ""
      }`}
      onClick={() => {
        void handleSelect(choice);
      }}
    >
      {icon}
      {label}
      {member.choice === choice && (
        <Check
          className={styles.voteDropdownCheck}
          size={14}
          strokeWidth={2.5}
        />
      )}
    </button>
  );

  return (
    <div className={styles.voteDropdown}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.voteDropdownTrigger} ${
          isOpen ? styles.voteDropdownTriggerActive : ""
        }`}
        disabled={isSubmitting}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        aria-expanded={isOpen}
        aria-label={`${member.displayName} 수동 투표`}
      >
        {member.choice === "PARTICIPATE" && (
          <CircleCheck
            className={styles.attendanceIcon}
            size={16}
            strokeWidth={2}
          />
        )}
        {member.choice === "NOT_PARTICIPATE" && (
          <CircleX className={styles.absenceIcon} size={16} strokeWidth={2} />
        )}
        {member.choice === null && <span>수동 투표</span>}
        <span
          className={`${styles.voteDropdownArrow} ${
            isOpen ? styles.voteDropdownArrowOpen : ""
          }`}
        >
          ▾
        </span>
      </button>

      {menuPosition &&
        createPortal(
          <>
            <button
              type="button"
              className={styles.voteDropdownBackdrop}
              aria-hidden="true"
              tabIndex={-1}
              onClick={closeMenu}
            />
            <div
              className={styles.voteDropdownMenu}
              role="menu"
              style={{ top: menuPosition.top, left: menuPosition.left }}
            >
              {renderChoiceItem(
                "PARTICIPATE",
                "참가",
                <CircleCheck
                  className={styles.attendanceIcon}
                  size={16}
                  strokeWidth={2}
                />,
              )}
              {renderChoiceItem(
                "NOT_PARTICIPATE",
                "불참",
                <CircleX
                  className={styles.absenceIcon}
                  size={16}
                  strokeWidth={2}
                />,
              )}
            </div>
          </>,
          document.body,
        )}

      {error && (
        <span className={styles.rowError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
