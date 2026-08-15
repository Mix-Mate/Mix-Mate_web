import { participantGroupMock } from "@/features/participant/api/participant.mock";
import type { FixedMemberCandidate } from "../types/assignment.types";

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
