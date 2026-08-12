import type { AssignmentSetupInput } from "../types/assignment.types";

interface AssignmentDraft {
  setup: AssignmentSetupInput | null;
}

const drafts = new Map<string, AssignmentDraft>();

function getDraftKey(groupId: string, round: number) {
  return `${groupId}:${round}`;
}

function getOrCreateDraft(groupId: string, round: number): AssignmentDraft {
  const key = getDraftKey(groupId, round);
  const existing = drafts.get(key);
  if (existing) return existing;

  const created: AssignmentDraft = { setup: null };
  drafts.set(key, created);
  return created;
}

export function saveAssignmentSetupDraft(
  groupId: string,
  round: number,
  setup: AssignmentSetupInput,
) {
  getOrCreateDraft(groupId, round).setup = setup;
}
