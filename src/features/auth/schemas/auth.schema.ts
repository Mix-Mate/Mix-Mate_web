import { z } from 'zod';

export const signupSchema = z
  .object({
    userName: z.string().min(1, '이름을 입력해주세요.'),
    email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
    authCode: z.string().min(1, '인증번호를 입력해주세요.'),
    password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

export const resetPasswordSchema = z
  .object({
    email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
    newPassword: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
    confirmPassword: z.string().min(1, '새 비밀번호 확인을 입력해주세요.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
