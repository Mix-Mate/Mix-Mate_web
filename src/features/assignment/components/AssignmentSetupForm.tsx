"use client";

import { useState } from "react";
import Button from "@/shared/ui/Button";
import AssignmentConditionList from "./AssignmentConditionList";
import GroupCountStepper from "./GroupCountStepper";
import type {
  AssignmentConditionOption,
  AssignmentSetupInput,
} from "../types/assignment.types";

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
  const [groupCount, setGroupCount] = useState(4);
  const [conditionKeys, setConditionKeys] = useState<
    AssignmentConditionOption["key"][]
  >([]);

  const toggleCondition = (key: AssignmentConditionOption["key"]) => {
    setConditionKeys((current) =>
      current.includes(key)
        ? current.filter((existingKey) => existingKey !== key)
        : [...current, key],
    );
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ round, groupCount, conditionKeys });
      }}
    >
      <GroupCountStepper value={groupCount} onChange={setGroupCount} />
      <AssignmentConditionList
        selectedKeys={conditionKeys}
        onToggle={toggleCondition}
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "설정 중..." : "다음"}
      </Button>
    </form>
  );
}
