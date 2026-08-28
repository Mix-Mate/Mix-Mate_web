import { z } from "zod";

export const profileMbtiValues = [
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
] as const;

export const profileGradeValues = [
  "FIRST",
  "SECOND",
  "THIRD",
  "FOURTH",
  "OTHER",
] as const;

export const profileGenderValues = ["MALE", "FEMALE"] as const;
export const profilePositionValues = ["MEMBER", "STAFF"] as const;
export const profileVisibilityValues = ["PUBLIC", "PRIVATE"] as const;

export const groupProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "이름을 입력해주세요.")
    .max(10, "이름은 10자까지 입력할 수 있습니다."),
  position: z.enum(profilePositionValues, "직급을 선택해주세요."),
  major: z
    .string()
    .trim()
    .min(1, "소속을 입력해주세요.")
    .max(15, "소속은 15자까지 입력할 수 있습니다."),
  isNew: z.boolean("신입 여부를 선택해주세요."),
  grade: z.enum(profileGradeValues, "학년을 선택해주세요."),
  gender: z.enum(profileGenderValues, "성별을 선택해주세요."),
  mbti: z.enum(profileMbtiValues, "MBTI를 선택해주세요."),
  age: z
    .number()
    .int("나이는 숫자로 입력해주세요.")
    .min(0, "나이는 0 이상이어야 합니다.")
    .max(9999999999, "나이는 10자리까지 입력할 수 있습니다.")
    .nullable(),
  instaId: z
    .string()
    .trim()
    .max(15, "인스타 ID는 15자까지 입력할 수 있습니다.")
    .nullable(),
  bio: z
    .string()
    .trim()
    .max(50, "자기소개는 50자까지 입력할 수 있습니다.")
    .nullable(),
  visibility: z.enum(profileVisibilityValues, "프로필 공개 여부를 선택해주세요."),
});

export type GroupProfileFormValues = z.infer<typeof groupProfileSchema>;

export function getValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "입력값을 확인해주세요.";
}
