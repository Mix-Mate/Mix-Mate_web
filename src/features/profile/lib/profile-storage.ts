import { getMyGroupProfileMock } from "../api/profile.mock";
import type {
  EditableGroupProfile,
  MyGroupProfile,
  ProfileVisibility,
} from "../types/profile.types";

export const PROFILE_STORAGE_KEY = "mixmate-my-group-profile";
export const MY_PARTICIPANT_ID = "1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeVisibility(value: unknown): ProfileVisibility | undefined {
  if (value === "PUBLIC" || value === "public") return "PUBLIC";
  if (value === "PRIVATE" || value === "private") return "PRIVATE";
  return undefined;
}

function normalizeNullableString(value: unknown) {
  return typeof value === "string" ? value : value === null ? null : undefined;
}

function normalizeAge(value: unknown) {
  if (value === null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return undefined;
}

function normalizeSavedProfile(
  savedProfile: unknown,
  mockProfile: MyGroupProfile,
): MyGroupProfile {
  if (!isRecord(savedProfile)) {
    return mockProfile;
  }

  return {
    ...mockProfile,
    displayName: mockProfile.displayName,
    position: mockProfile.position,
    major: mockProfile.major,
    isNew: mockProfile.isNew,
    grade: mockProfile.grade,
    gender: mockProfile.gender,
    mbti: mockProfile.mbti,
    age: normalizeAge(savedProfile.age) ?? mockProfile.age,
    instaId: normalizeNullableString(savedProfile.instaId) ?? mockProfile.instaId,
    bio: normalizeNullableString(savedProfile.bio) ?? mockProfile.bio,
    visibility:
      normalizeVisibility(savedProfile.visibility) ?? mockProfile.visibility,
  };
}

export function getSavedMyGroupProfile(): MyGroupProfile {
  const mockProfile = getMyGroupProfileMock();

  if (typeof window === "undefined") {
    return mockProfile;
  }

  const savedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!savedProfile) {
    return mockProfile;
  }

  try {
    return normalizeSavedProfile(JSON.parse(savedProfile), mockProfile);
  } catch {
    return mockProfile;
  }
}

export function saveMyGroupProfile(profile: EditableGroupProfile) {
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}
