import { z } from "zod";

export const INPUT_VALIDATION_RULES = {
  groupName: {
    maxLength: 30,
    pattern: /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9 .,!?~()/&+#@:_-]*$/,
    lengthMessage: "그룹 이름은 30자를 넘을 수 없습니다.",
    characterMessage:
      "그룹 이름에는 한글, 영문, 숫자와 일부 기호만 사용할 수 있습니다.",
  },
  description: {
    maxLength: 120,
    pattern: /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9 \n\r.,!?~()/&+#@:%*=;'_-]*$/,
    lengthMessage: "그룹 설명은 120자를 넘을 수 없습니다.",
    characterMessage:
      "그룹 설명에는 한글, 영문, 숫자와 일부 기호만 사용할 수 있습니다.",
  },
  displayName: {
    maxLength: 10,
    pattern: /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9 ._-]*$/,
    lengthMessage: "이름은 10자를 넘을 수 없습니다.",
    characterMessage:
      "이름에는 한글, 영문, 숫자와 일부 기호만 사용할 수 있습니다.",
  },
  studentId: {
    maxLength: 20,
    pattern: /^[0-9]*$/,
    lengthMessage: "학번은 20자를 넘을 수 없습니다.",
    characterMessage: "학번은 숫자만 사용할 수 있습니다.",
  },
  major: {
    maxLength: 20,
    pattern: /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9 ._-]*$/,
    lengthMessage: "전공은 20자를 넘을 수 없습니다.",
    characterMessage:
      "전공에는 한글, 영문, 숫자와 일부 기호만 사용할 수 있습니다.",
  },
  bio: {
    maxLength: 120,
    pattern: /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9 \n\r.,!?~()/&+#@:%*=;'_-]*$/,
    lengthMessage: "자기소개는 120자를 넘을 수 없습니다.",
    characterMessage:
      "자기소개에는 한글, 영문, 숫자와 일부 기호만 사용할 수 있습니다.",
  },
  instaId: {
    maxLength: 30,
    pattern: /^[a-zA-Z0-9._]*$/,
    lengthMessage: "인스타 아이디는 30자를 넘을 수 없습니다.",
    characterMessage:
      "인스타 아이디는 영문, 숫자, 마침표, 밑줄만 사용할 수 있습니다.",
  },
  userName: {
    maxLength: 10,
    pattern: /^[가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9 ._-]*$/,
    lengthMessage: "이름은 10자를 넘을 수 없습니다.",
    characterMessage:
      "이름에는 한글, 영문, 숫자와 일부 기호만 사용할 수 있습니다.",
  },
} as const;

export type ValidatedInputField = keyof typeof INPUT_VALIDATION_RULES;
export type InputFieldErrors = Partial<Record<ValidatedInputField, string>>;

export function validateInputField(
  field: ValidatedInputField,
  value: string | null | undefined,
): string | null {
  const normalizedValue = value ?? "";
  const rule = INPUT_VALIDATION_RULES[field];

  if (normalizedValue.length > rule.maxLength) return rule.lengthMessage;
  if (!rule.pattern.test(normalizedValue)) return rule.characterMessage;
  return null;
}

export function validatedStringSchema(field: ValidatedInputField) {
  const rule = INPUT_VALIDATION_RULES[field];

  return z
    .string()
    .max(rule.maxLength, rule.lengthMessage)
    .regex(rule.pattern, rule.characterMessage);
}

export function getZodFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }

  return fieldErrors;
}

export function mapServerFieldErrors(
  errors?: Record<string, string>,
  aliases: Record<string, string> = {},
): Record<string, string> {
  if (!errors) return {};

  return Object.entries(errors).reduce<Record<string, string>>(
    (mappedErrors, [serverField, message]) => {
      const leafField = serverField.split(".").at(-1) ?? serverField;
      const field = aliases[serverField] ?? aliases[leafField] ?? leafField;
      if (!mappedErrors[field]) mappedErrors[field] = message;
      return mappedErrors;
    },
    {},
  );
}
