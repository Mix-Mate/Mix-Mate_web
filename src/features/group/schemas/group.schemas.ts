import { z } from "zod";
import { validatedStringSchema } from "@/shared/lib/input-validation";

export const updateGroupSchema = z.object({
  name: validatedStringSchema("groupName")
    .trim()
    .min(1, "그룹명을 입력해주세요."),
  description: validatedStringSchema("description").trim(),
});
