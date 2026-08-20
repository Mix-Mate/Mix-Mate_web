import { getMyGroupProfileMock } from "../api/profile.mock";
import type {
  EditableGroupProfile,
  MyGroupProfile,
  ProfileGender,
  ProfileGrade,
  ProfileMbti,
  ProfilePosition,
  ProfileVisibility,
} from "../types/profile.types";
import { normalizeMajor } from "./normalize-major";

export const PROFILE_STORAGE_KEY = "mixmate-my-group-profile";
export const MY_PARTICIPANT_ID = "1";

const gradeValues: ProfileGrade[] = ["FIRST", "SECOND", "THIRD", "FOURTH"];
const mbtiValues: ProfileMbti[] = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeVisibility(value: unknown): ProfileVisibility | undefined {
  if (value === "PUBLIC" || value === "public") return "PUBLIC";
  if (value === "PRIVATE" || value === "private") return "PRIVATE";
  return undefined;
}

function normalizeGender(value: unknown): ProfileGender | undefined {
  if (value === "MALE" || value === "male") return "MALE";
  if (value === "FEMALE" || value === "female") return "FEMALE";
  return undefined;
}

function normalizeGrade(value: unknown): ProfileGrade | undefined {
  return gradeValues.includes(value as ProfileGrade)
    ? (value as ProfileGrade)
    : undefined;
}

function normalizeMbti(value: unknown): ProfileMbti | undefined {
  return mbtiValues.includes(value as ProfileMbti)
    ? (value as ProfileMbti)
    : undefined;
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : undefined;
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
    displayName:
      normalizeString(savedProfile.displayName) ??
      normalizeString(savedProfile.name) ??
      mockProfile.displayName,
    position:
      savedProfile.position === "STAFF" || savedProfile.position === "MEMBER"
        ? (savedProfile.position as ProfilePosition)
        : mockProfile.position,
    major: normalizeMajor(
      normalizeString(savedProfile.major) ??
        normalizeString(savedProfile.department) ??
        mockProfile.major,
    ),
    isNew:
      typeof savedProfile.isNew === "boolean"
        ? savedProfile.isNew
        : mockProfile.isNew,
    grade: normalizeGrade(savedProfile.grade) ?? mockProfile.grade,
    gender: normalizeGender(savedProfile.gender) ?? mockProfile.gender,
    mbti: normalizeMbti(savedProfile.mbti) ?? mockProfile.mbti,
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
  window.localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({
      ...profile,
      major: normalizeMajor(profile.major),
    }),
  );
}
