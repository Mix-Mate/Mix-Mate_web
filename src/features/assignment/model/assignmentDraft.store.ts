import type {
  AssignmentSetupInput,
  AssignmentTeam,
} from "../types/assignment.types";

interface AssignmentDraft {
  setup: AssignmentSetupInput | null;
  result: AssignmentTeam[] | null;
}

const drafts = new Map<string, AssignmentDraft>();

function getDraftKey(groupId: string, round: number) {
  return `${groupId}:${round}`;
}

function getOrCreateDraft(groupId: string, round: number): AssignmentDraft {
  const key = getDraftKey(groupId, round);
  const existing = drafts.get(key);
  if (existing) return existing;

  const created: AssignmentDraft = { setup: null, result: null };
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

export function getAssignmentSetupDraft(groupId: string, round: number) {
  return getOrCreateDraft(groupId, round).setup;
}

export function saveAssignmentResultDraft(
  groupId: string,
  round: number,
  result: AssignmentTeam[],
) {
  getOrCreateDraft(groupId, round).result = result;
}

export function getAssignmentResultDraft(groupId: string, round: number) {
  return getOrCreateDraft(groupId, round).result;
}
