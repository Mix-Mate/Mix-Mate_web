export type ProfileGrade = "FIRST" | "SECOND" | "THIRD" | "FOURTH" | "OTHER";

export const profileGradeLabels: Record<ProfileGrade, string> = {
  FIRST: "1학년",
  SECOND: "2학년",
  THIRD: "3학년",
  FOURTH: "4학년",
  OTHER: "기타",
};

export function getProfileGradeLabel(grade?: ProfileGrade | null) {
  return grade ? profileGradeLabels[grade] : undefined;
}

export function normalizeProfileMbti(mbti?: string | null) {
  const normalizedMbti = mbti?.trim().toUpperCase();

  return normalizedMbti && /^[IE][NS][FT][JP]$/.test(normalizedMbti)
    ? normalizedMbti
    : undefined;
}
