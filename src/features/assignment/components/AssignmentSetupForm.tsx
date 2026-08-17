"use client";

import { useEffect, useRef, useState } from "react";
import { getVoteProgressContext } from "@/features/vote/api/vote.api";
import Button from "@/shared/ui/Button";
import InfoBanner from "@/shared/ui/InfoBanner";
import { useParticipantCandidatesQuery } from "../hooks/useParticipantCandidatesQuery";
import AssignmentConditionList, {
  assignmentConditionOptions,
} from "./AssignmentConditionList";
import AssignmentParticipantStatusCard from "./AssignmentParticipantStatusCard";
import GroupCountStepper from "./GroupCountStepper";
import type {
  AssignmentConditionKey,
  AssignmentSetupInput,
} from "../types/assignment.types";
import styles from "./assignment.module.css";

const MIN_MEMBERS_PER_GROUP = 2;
const MIN_GROUP_COUNT = 2;

function getPerGroupRangeLabel(participantCount: number, groupCount: number) {
  if (groupCount <= 0) return "-명";

  const base = Math.floor(participantCount / groupCount);
  const remainder = participantCount % groupCount;

  return remainder === 0 ? `${base}명` : `${base}~${base + 1}명`;
}

function getMaxGroupCount(participantCount: number) {
  return Math.max(
    MIN_GROUP_COUNT,
    Math.floor(participantCount / MIN_MEMBERS_PER_GROUP),
  );
}

interface AssignmentSetupFormProps {
  groupId: string;
  round: AssignmentSetupInput["round"];
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmit: (input: AssignmentSetupInput) => void;
}

export default function AssignmentSetupForm({
  groupId,
  round,
  isSubmitting = false,
  errorMessage = null,
  onSubmit,
}: AssignmentSetupFormProps) {
  const voteProgress = round === 2 ? getVoteProgressContext(groupId) : null;
  const { data: candidates } = useParticipantCandidatesQuery(groupId, round);
  const participantCount = voteProgress
    ? voteProgress.attendanceCount
    : candidates.length;
  const maxGroupCount = getMaxGroupCount(participantCount);
  const [groupCount, setGroupCount] = useState(() =>
    Math.min(3, maxGroupCount),
  );
  const hasManualGroupCount = useRef(false);

  useEffect(() => {
    if (hasManualGroupCount.current) return;
    setGroupCount(Math.min(3, maxGroupCount));
  }, [maxGroupCount]);
  const [conditionKeys, setConditionKeys] = useState<AssignmentConditionKey[]>(
    () => {
      const defaultKeys = assignmentConditionOptions
        .filter((option) => option.defaultEnabled)
        .map((option) => option.key);

      if (round === 2) {
        return [...new Set([...defaultKeys, "KEEP_FIXED_MEMBERS" as const])];
      }

      return defaultKeys;
    },
  );

  const toggleCondition = (key: AssignmentConditionKey) => {
    setConditionKeys((current) =>
      current.includes(key)
        ? current.filter((existingKey) => existingKey !== key)
        : [...current, key],
    );
  };

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ round, groupCount, conditionKeys });
      }}
    >
      <div className={styles.scrollArea}>
        <h2 className={styles.setupHeading}>조 편성 설정</h2>

        {voteProgress && (
          <AssignmentParticipantStatusCard
            round={2}
            targetCount={voteProgress.attendanceCount}
            absenceCount={voteProgress.absenceCount}
            pendingCount={voteProgress.pendingCount}
          />
        )}

        <div className={styles.setupCard}>
          <GroupCountStepper
            value={groupCount}
            max={maxGroupCount}
            onChange={(value) => {
              hasManualGroupCount.current = true;
              setGroupCount(value);
            }}
          />
          <div className={styles.divider} />
          <p className={styles.perGroupText}>
            <span>조당</span>
            <strong>
              {getPerGroupRangeLabel(participantCount, groupCount)}
            </strong>
          </p>
        </div>

        <div className={styles.conditionsHeadingRow}>
          <h2 className={styles.conditionsHeading}>
            배치 조건 선택
            <span className={styles.conditionsCount}>
              총 {assignmentConditionOptions.length}개 조건
            </span>
          </h2>
        </div>

        {round !== 2 && (
          <InfoBanner>이전 회차의 조와 조원 목록을 확인할 수 있습니다.</InfoBanner>
        )}

        <AssignmentConditionList
          round={round}
          selectedKeys={conditionKeys}
          onToggle={toggleCondition}
        />
      </div>

      <div className={styles.footer}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "설정 중..."
            : round === 2
              ? "2차 자동 배치"
              : "다음 — 고정 멤버"}
        </Button>
        {errorMessage && (
          <p className={styles.errorText}>{errorMessage}</p>
        )}
      </div>
    </form>
  );
}
