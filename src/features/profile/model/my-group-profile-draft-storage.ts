import type { ParticipantProfileRequest } from "../types/profile.types";

const myGroupProfileDraftStoragePrefix = "mixmate:my-group-profile-draft:";

type StoredMyGroupProfileDraft = ParticipantProfileRequest & {
  savedAt: number;
};

function getMyGroupProfileDraftStorageKey(groupId: string) {
  return `${myGroupProfileDraftStoragePrefix}${groupId}`;
}

export function readMyGroupProfileDraft(
  groupId: string,
): ParticipantProfileRequest | null {
  if (typeof window === "undefined") return null;

  try {
    const storedValue = window.localStorage.getItem(
      getMyGroupProfileDraftStorageKey(groupId),
    );

    if (!storedValue) return null;

    const parsedValue = JSON.parse(storedValue) as StoredMyGroupProfileDraft;

    if (!parsedValue || typeof parsedValue !== "object") return null;

    return parsedValue;
  } catch {
    return null;
  }
}

export function rememberMyGroupProfileDraft(
  groupId: string,
  profile: ParticipantProfileRequest,
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    getMyGroupProfileDraftStorageKey(groupId),
    JSON.stringify({ ...profile, savedAt: Date.now() }),
  );
}
