"use client";

import type { AssignmentConditionOption } from "../types/assignment.types";

const conditionOptions: AssignmentConditionOption[] = [
  { key: "GENDER_BALANCE", label: "성비 균등 배치" },
  { key: "GRADE_BALANCE", label: "학년 균등 배치" },
  { key: "ADMIN_DISTRIBUTION", label: "운영진 균등 배치" },
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
    <ul aria-label="배치 조건 선택">
      {conditionOptions.map((option) => (
        <li key={option.key}>
          <label>
            <input
              type="checkbox"
              checked={selectedKeys.includes(option.key)}
              onChange={() => onToggle(option.key)}
            />
            {option.label}
          </label>
        </li>
      ))}
    </ul>
  );
}
