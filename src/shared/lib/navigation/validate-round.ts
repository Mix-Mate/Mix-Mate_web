import { notFound } from "next/navigation";

export type AssignmentRound = 1 | 2;

export function toAssignmentRound(roundParam: string): AssignmentRound {
  if (roundParam === "1" || roundParam === "2") {
    return Number(roundParam) as AssignmentRound;
  }

  notFound();
}
