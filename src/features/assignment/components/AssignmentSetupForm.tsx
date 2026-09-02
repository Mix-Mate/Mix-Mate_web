"use client";

import { useEffect, useRef, useState } from "react";
import { useVoteStatusQuery } from "@/features/vote/hooks/useVoteStatusQuery";
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

// 백엔드가 teamCount 최소 2를 강제하므로(1개조 편성 자체를 지원하지 않음),
// 1차/2차 모두 항상 최소 2개조 기준으로 계산한다.
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
  const {
    data: voteStatus,
    isLoading: isVoteStatusLoading,
    error: voteStatusError,
  } = useVoteStatusQuery(groupId, {
    enabled: round === 2,
    pollingEnabled: false,
  });
  const { data: candidates } = useParticipantCandidatesQuery(groupId, round);
  const participantCount =
    round === 2 ? (voteStatus?.participateCount ?? 0) : candidates.length;
  const isParticipantCountLoading = round === 2 && isVoteStatusLoading;
  const maxGroupCount = getMaxGroupCount(participantCount);
  // 2개조 x 조당 최소 2명 미만이면 1인 조 없이는 조 편성이 불가능하다.
  const minParticipantsToAssign = MIN_GROUP_COUNT * MIN_MEMBERS_PER_GROUP;
  const canAssign =
    !isParticipantCountLoading && participantCount >= minParticipantsToAssign;
  const [groupCount, setGroupCount] = useState(() =>
    Math.min(3, maxGroupCount),
  );
  const hasManualGroupCount = useRef(false);

  useEffect(() => {
    if (hasManualGroupCount.current) return;
    setGroupCount(Math.min(3, maxGroupCount));
  }, [maxGroupCount]);
  const [conditionKeys, setConditionKeys] = useState<AssignmentConditionKey[]>(
    () =>
      assignmentConditionOptions
        .filter((option) => option.defaultEnabled)
        .map((option) => option.key),
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

        {round === 2 &&
          (isVoteStatusLoading ? (
            <p role="status" className={styles.perGroupText}>
              참여자 현황을 불러오는 중입니다...
            </p>
          ) : voteStatusError ? (
            <InfoBanner>{voteStatusError}</InfoBanner>
          ) : voteStatus ? (
            <AssignmentParticipantStatusCard
              round={2}
              targetCount={voteStatus.participateCount}
              absenceCount={voteStatus.notParticipateCount}
              pendingCount={
                voteStatus.totalParticipantCount - voteStatus.votedCount
              }
            />
          ) : null)}

        {isParticipantCountLoading ? null : canAssign ? (
          <div className={styles.setupCard}>
            <GroupCountStepper
              value={groupCount}
              min={MIN_GROUP_COUNT}
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
        ) : (
          <InfoBanner>
            참가자가 {minParticipantsToAssign}명 미만이라 조 편성을 진행할 수
            없습니다. 참가자를 더 모은 뒤 다시 시도해주세요.
          </InfoBanner>
        )}

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
          selectedKeys={conditionKeys}
          onToggle={toggleCondition}
        />
      </div>

      <div className={styles.footer}>
        <Button type="submit" disabled={isSubmitting || !canAssign}>
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
