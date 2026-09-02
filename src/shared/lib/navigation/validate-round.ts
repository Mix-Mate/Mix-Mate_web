import { notFound } from "next/navigation";

export type AssignmentRound = 1 | 2;

export function toAssignmentRound(roundParam: string): AssignmentRound {
  if (roundParam === "1" || roundParam === "FIRST_ROUND") {
    return 1;
  }

  if (roundParam === "2" || roundParam === "SECOND_ROUND") {
    return 2;
  }

  notFound();
}
