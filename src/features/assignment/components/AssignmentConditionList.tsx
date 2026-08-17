"use client";

import clsx from "clsx";
import type {
  AssignmentConditionOption,
  AssignmentSetupInput,
} from "../types/assignment.types";
import styles from "./assignment.module.css";

export const assignmentConditionOptions: AssignmentConditionOption[] = [
  {
    key: "GENDER_BALANCE",
    label: "성별 균형",
    description: "조마다 성비를 고르게",
    defaultEnabled: true,
  },
  {
    key: "MBTI_BALANCE",
    label: "MBTI 균형",
    description: "E/I 성향이 섞이도록",
    defaultEnabled: true,
  },
  {
    key: "GRADE_DISTRIBUTION",
    label: "학년 분산",
    description: "학년이 한 조에 몰리지 않게",
    defaultEnabled: true,
  },
  {
    key: "AFFILIATION_DISTRIBUTION",
    label: "소속 분산",
    description: "같은 학과·팀 분산",
    defaultEnabled: true,
  },
  {
    key: "NEWCOMER_DISTRIBUTION",
    label: "신입 여부 분산",
    description: "신입이 고루 섞이도록",
    defaultEnabled: true,
  },
  {
    key: "ADMIN_DISTRIBUTION",
    label: "직급 분산",
    description: "운영진을 각 조에 배치",
    defaultEnabled: true,
  },
  {
    key: "MEMBER_COUNT_BALANCE",
    label: "인원 수 균등",
    description: "조별 인원 차이 최소화",
    defaultEnabled: true,
  },
  {
    key: "KEEP_FIXED_MEMBERS",
    label: "고정 멤버 유지",
    description: "지정한 멤버는 그대로 유지",
    defaultEnabled: false,
    locked: true,
  },
];

interface AssignmentConditionListProps {
  round: AssignmentSetupInput["round"];
  selectedKeys: AssignmentConditionOption["key"][];
  onToggle: (key: AssignmentConditionOption["key"]) => void;
}

export default function AssignmentConditionList({
  round,
  selectedKeys,
  onToggle,
}: AssignmentConditionListProps) {
  return (
    <div className={styles.conditionCard} aria-label="배치 조건 목록">
      {assignmentConditionOptions.map((option) => {
        const isOn = selectedKeys.includes(option.key);
        // 2차부터는 직전 회차 조 배정이 있으므로 관리자가 직접 켜고 끌 수 있다.
        const isLocked = option.locked && round !== 2;

        return (
          <div key={option.key} className={styles.conditionRow}>
            <div className={styles.conditionText}>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isOn}
              aria-label={option.label}
              disabled={isLocked}
              className={clsx(styles.toggle, isOn && styles.toggleOn)}
              onClick={() => {
                if (isLocked) return;
                onToggle(option.key);
              }}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
