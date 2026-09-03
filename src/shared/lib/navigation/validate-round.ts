import { notFound } from "next/navigation";

export type AssignmentRound = 1 | 2;

export function toAssignmentRound(roundParam: string): AssignmentRound {
  if (roundParam === "1") {
    return 1;
  }

  if (roundParam === "2") {
    return 2;
  }

  notFound();
}
