import type {
  ParticipantProfileRequest,
  ParticipantSummaryResponse,
} from "../types/participant.types";

const adminParticipantDraftStoragePrefix = "mixmate:admin-participant-drafts:";

export type AdminParticipantDraft = ParticipantProfileRequest & {
  savedAt: number;
};

function getAdminParticipantDraftStorageKey(groupId: string) {
  return `${adminParticipantDraftStoragePrefix}${groupId}`;
}

export function readAdminParticipantDrafts(
  groupId: string,
): AdminParticipantDraft[] {
  if (typeof window === "undefined") return [];

  try {
    const storedValue = window.localStorage.getItem(
      getAdminParticipantDraftStorageKey(groupId),
    );

    if (!storedValue) return [];

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) return [];

    return parsedValue as AdminParticipantDraft[];
  } catch {
    return [];
  }
}

function writeAdminParticipantDrafts(
  groupId: string,
  drafts: AdminParticipantDraft[],
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    getAdminParticipantDraftStorageKey(groupId),
    JSON.stringify(drafts.slice(-50)),
  );
}

export function rememberAdminParticipantDraft(
  groupId: string,
  input: ParticipantProfileRequest,
) {
  const drafts = readAdminParticipantDrafts(groupId);
  const nextDrafts = drafts.filter(
    (draft) =>
      !(
        draft.displayName === input.displayName &&
        draft.major === input.major &&
        draft.gender === input.gender
      ),
  );

  nextDrafts.push({ ...input, savedAt: Date.now() });
  writeAdminParticipantDrafts(groupId, nextDrafts);
}

function getDraftMatchScore(
  draft: AdminParticipantDraft,
  summary: ParticipantSummaryResponse,
) {
  if (draft.displayName !== summary.displayName) return -1;
  if (draft.gender !== summary.gender) return -1;
  if (summary.visibility && draft.visibility !== summary.visibility) return -1;

  return draft.major === summary.major ? 2 : 1;
}

export function findAdminParticipantDraft(
  groupId: string,
  summary: ParticipantSummaryResponse,
) {
  return readAdminParticipantDrafts(groupId)
    .map((draft) => ({
      draft,
      matchScore: getDraftMatchScore(draft, summary),
    }))
    .filter(({ matchScore }) => matchScore > 0)
    .sort((first, second) => {
      if (first.matchScore !== second.matchScore) {
        return second.matchScore - first.matchScore;
      }

      return second.draft.savedAt - first.draft.savedAt;
    })[0]?.draft;
}
