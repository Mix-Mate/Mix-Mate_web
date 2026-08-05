import { z } from "zod";

export const updateGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "그룹명을 입력해주세요.")
    .max(30, "그룹명은 30자 이내로 입력해주세요."),
  description: z.string().trim().max(120, "설명은 120자 이내로 입력해주세요."),
});
