import { participantGroupMock } from "@/features/participant/api/participant.mock";
import type {
  AssignmentProgressStatus,
  FixedMemberCandidate,
} from "../types/assignment.types";

const PROCESSING_DURATION_MS = 6000;

const gradeByParticipantId: Record<string, string> = {
  "1": "1학년",
  "2": "2학년",
  "3": "4학년",
  "4": "3학년",
  "5": "2학년",
  "6": "3학년",
  "7": "1학년",
  "8": "4학년",
  "9": "2학년",
  "10": "1학년",
  "11": "3학년",
  "12": "4학년",
};

export function getParticipantPool(): FixedMemberCandidate[] {
  return participantGroupMock.participants.map((participant) => ({
    ...participant,
    grade: gradeByParticipantId[participant.id] ?? "1학년",
    fixedTeamNumber: null,
  }));
}

export function getAssignmentStatus(
  startedAt: number,
): AssignmentProgressStatus {
  const elapsedMs = Date.now() - startedAt;
  const progress = Math.min(
    100,
    Math.round((elapsedMs / PROCESSING_DURATION_MS) * 100),
  );

  return { progress, isComplete: progress >= 100 };
}
