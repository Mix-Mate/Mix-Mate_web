"use client";

import clsx from "clsx";
import type { AssignmentConditionOption } from "../types/assignment.types";
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
];

interface AssignmentConditionListProps {
  selectedKeys: AssignmentConditionOption["key"][];
  onToggle: (key: AssignmentConditionOption["key"]) => void;
}

export default function AssignmentConditionList({
  selectedKeys,
  onToggle,
}: AssignmentConditionListProps) {
  return (
    <div className={styles.conditionCard} aria-label="배치 조건 목록">
      {assignmentConditionOptions.map((option) => {
        const isOn = selectedKeys.includes(option.key);

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
              className={clsx(styles.toggle, isOn && styles.toggleOn)}
              onClick={() => onToggle(option.key)}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
