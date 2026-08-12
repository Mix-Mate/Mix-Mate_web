import type { AssignmentStatus } from "../types/assignment.types";

const statusLabels: Record<AssignmentStatus, string> = {
  DRAFT: "설정 대기 중",
  PROCESSING: "자동 배치 진행 중...",
  COMPLETED: "배치 완료",
};

interface AssignmentProgressProps {
  status: AssignmentStatus;
}

export default function AssignmentProgress({
  status,
}: AssignmentProgressProps) {
  return (
    <div role="status" aria-live="polite">
      <p>{statusLabels[status]}</p>
    </div>
  );
}
