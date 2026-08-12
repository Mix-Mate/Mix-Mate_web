import type {
  AssignmentSetupInput,
  FixedMemberEntry,
} from "../types/assignment.types";

interface AssignmentDraft {
  setup: AssignmentSetupInput | null;
  fixedMembers: FixedMemberEntry[];
}

const drafts = new Map<string, AssignmentDraft>();

function getDraftKey(groupId: string, round: number) {
  return `${groupId}:${round}`;
}

function getOrCreateDraft(groupId: string, round: number): AssignmentDraft {
  const key = getDraftKey(groupId, round);
  const existing = drafts.get(key);
  if (existing) return existing;

  const created: AssignmentDraft = { setup: null, fixedMembers: [] };
  drafts.set(key, created);
  return created;
}

export function getAssignmentDraft(groupId: string, round: number) {
  return getOrCreateDraft(groupId, round);
}

export function saveAssignmentSetupDraft(
  groupId: string,
  round: number,
  setup: AssignmentSetupInput,
) {
  getOrCreateDraft(groupId, round).setup = setup;
}

export function saveFixedMembersDraft(
  groupId: string,
  round: number,
  fixedMembers: FixedMemberEntry[],
) {
  getOrCreateDraft(groupId, round).fixedMembers = fixedMembers;
}
