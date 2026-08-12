"use client";

import { useState } from "react";
import Button from "@/shared/ui/Button";
import InfoBanner from "@/shared/ui/InfoBanner";
import { getParticipantPool } from "../api/assignment.api";
import AssignmentConditionList, {
  assignmentConditionOptions,
} from "./AssignmentConditionList";
import GroupCountStepper from "./GroupCountStepper";
import type {
  AssignmentConditionKey,
  AssignmentSetupInput,
} from "../types/assignment.types";
import styles from "./assignment.module.css";

function getPerGroupRangeLabel(participantCount: number, groupCount: number) {
  if (groupCount <= 0) return "-명";

  const base = Math.floor(participantCount / groupCount);
  const remainder = participantCount % groupCount;

  return remainder === 0 ? `${base}명` : `${base}~${base + 1}명`;
}

interface AssignmentSetupFormProps {
  round: AssignmentSetupInput["round"];
  isSubmitting?: boolean;
  onSubmit: (input: AssignmentSetupInput) => void;
}

export default function AssignmentSetupForm({
  round,
  isSubmitting = false,
  onSubmit,
}: AssignmentSetupFormProps) {
  const participantCount = getParticipantPool().length;
  const [groupCount, setGroupCount] = useState(3);
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

        <div className={styles.setupCard}>
          <GroupCountStepper value={groupCount} onChange={setGroupCount} />
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

        <InfoBanner>이전 회차의 조와 조원 목록을 확인할 수 있습니다.</InfoBanner>

        <AssignmentConditionList
          selectedKeys={conditionKeys}
          onToggle={toggleCondition}
        />
      </div>

      <div className={styles.footer}>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "설정 중..." : "다음 — 고정 멤버"}
        </Button>
      </div>
    </form>
  );
}
