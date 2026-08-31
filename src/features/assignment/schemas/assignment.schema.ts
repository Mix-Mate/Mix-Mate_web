import { z } from "zod";

export const assignmentSetupSchema = z.object({
  groupCount: z
    .number()
    .int()
    .min(2, "조는 최소 2개 이상이어야 해요.")
    .max(20, "조는 최대 20개까지 설정할 수 있어요."),
  conditionKeys: z.array(
    z.enum([
      "GENDER_BALANCE",
      "MBTI_BALANCE",
      "GRADE_DISTRIBUTION",
      "NEWCOMER_DISTRIBUTION",
      "ADMIN_DISTRIBUTION",
      "MEMBER_COUNT_BALANCE",
      "KEEP_FIXED_MEMBERS",
    ]),
  ),
});
