'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/shared/ui/Button';
import InfoBanner from '@/shared/ui/InfoBanner';
import {
  sendVerificationCodeApi,
  verifyCodeApi,
  resetPasswordApi,
  AuthApiError,
} from '../api/auth.api';
import { resetPasswordSchema } from '../schemas/auth.schema';
import styles from './FindPasswordForm.module.css';

type VerificationStatus =
  | 'IDLE'
  | 'SENDING'
  | 'SENT'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'FAILED';

const VERIFICATION_TIME_LIMIT_SEC = 300; // 5분 유효시간

export function FindPasswordForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>('IDLE');
  const [timeLeft, setTimeLeft] = useState(0);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 5분 타이머 관리
  useEffect(() => {
    if (verificationStatus === 'SENT' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && verificationStatus === 'SENT') {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [verificationStatus, timeLeft]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
    // 이메일 변경 시 인증 상태 초기화
    if (verificationStatus !== 'IDLE') {
      setVerificationStatus('IDLE');
      setTimeLeft(0);
      setAuthCode('');
    }
  };

  const handleAuthCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 6);
    setAuthCode(value);
    if (fieldErrors.authCode || fieldErrors.code) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.authCode;
        delete next.code;
        return next;
      });
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewPassword(val);
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.newPassword;
      if (val && val.length < 8) {
        next.newPassword = '비밀번호는 8자 이상이어야 합니다.';
      }
      if (confirmPassword && val !== confirmPassword) {
        next.confirmPassword = '비밀번호가 일치하지 않습니다.';
      } else if (confirmPassword && val === confirmPassword) {
        delete next.confirmPassword;
      }
      return next;
    });
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const val = e.target.value;
    setConfirmPassword(val);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (newPassword && val !== newPassword) {
        next.confirmPassword = '비밀번호가 일치하지 않습니다.';
      } else {
        delete next.confirmPassword;
      }
      return next;
    });
  };

  // 1. [인증번호 발송] / [재발송] 클릭
  const handleSendCode = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!email.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        email: '이메일을 입력해주세요.',
      }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFieldErrors((prev) => ({
        ...prev,
        email: '올바른 이메일 형식을 입력해주세요.',
      }));
      return;
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.email;
      delete next.authCode;
      return next;
    });
    setVerificationStatus('SENDING');

    try {
      await sendVerificationCodeApi({ email: email.trim() });
      setVerificationStatus('SENT');
      setTimeLeft(VERIFICATION_TIME_LIMIT_SEC);
      setAuthCode('');
    } catch (error: unknown) {
      setVerificationStatus('IDLE');
      if (error instanceof AuthApiError) {
        setFieldErrors((prev) => ({
          ...prev,
          email: error.message,
        }));
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          email: '인증번호 발송에 실패했습니다. 다시 시도해 주세요.',
        }));
      }
    }
  };

  // 2. [인증번호 확인] 클릭
  const handleVerifyCode = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!authCode.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        authCode: '인증번호를 입력해주세요.',
      }));
      return;
    }

    if (timeLeft === 0 && verificationStatus === 'SENT') {
      setFieldErrors((prev) => ({
        ...prev,
        authCode: '인증 유효시간이 만료되었습니다. 다시 발송해 주세요.',
      }));
      return;
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.authCode;
      delete next.email;
      return next;
    });
    setVerificationStatus('VERIFYING');

    try {
      await verifyCodeApi({
        email: email.trim(),
        code: authCode.trim(),
      });

      // 인증 성공
      setVerificationStatus('VERIFIED');
      setTimeLeft(0);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (error: unknown) {
      setVerificationStatus('FAILED');
      if (error instanceof AuthApiError) {
        setFieldErrors((prev) => ({
          ...prev,
          authCode: error.message,
        }));
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          authCode: '인증번호가 일치하지 않거나 만료되었습니다.',
        }));
      }
    }
  };

  // 3. [변경하기] 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (verificationStatus !== 'VERIFIED') {
      setFieldErrors((prev) => ({
        ...prev,
        email: '이메일 인증을 완료해주세요.',
      }));
      return;
    }

    const validationResult = resetPasswordSchema.safeParse({
      email: email.trim(),
      newPassword,
      confirmPassword,
    });

    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field && !newErrors[field]) {
          newErrors[field] = issue.message;
        }
      });
      setFieldErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      await resetPasswordApi({
        email: email.trim(),
        newPassword,
        confirmPassword,
      });

      // 성공 시: "비밀번호가 성공적으로 변경되었습니다." 토스트 알림 트리거 및 로그인 화면(/login)으로 즉시 이동
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'authToast',
          '비밀번호가 성공적으로 변경되었습니다.',
        );
      }
      router.replace(
        `/login?toast=${encodeURIComponent('비밀번호가 성공적으로 변경되었습니다.')}`,
      );
    } catch (error: unknown) {
      if (error instanceof AuthApiError) {
        if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
          setFieldErrors(error.fieldErrors);
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError(
          error instanceof Error
            ? error.message
            : '비밀번호 변경 중 오류가 발생했습니다.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSendDisabled =
    verificationStatus === 'SENDING' ||
    verificationStatus === 'VERIFIED' ||
    !email.trim();

  const isVerifyDisabled =
    verificationStatus !== 'SENT' && verificationStatus !== 'FAILED';

  const isSubmitDisabled =
    isSubmitting ||
    verificationStatus !== 'VERIFIED' ||
    !newPassword ||
    newPassword.length < 8 ||
    !confirmPassword ||
    newPassword !== confirmPassword;

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {/* 안내 배너 */}
      <InfoBanner>
        <p>가입 시 등록한 이메일로 본인 인증 후</p>
        <p>새로운 비밀번호를 설정할 수 있습니다.</p>
      </InfoBanner>

      {/* 1. 이메일 & 인증번호 필드 */}
      <div className={styles.fieldGroup}>
        <label htmlFor="email" className={styles.label}>
          이메일 <span className={styles.required}>*</span>
        </label>

        {/* 이메일 입력 + 발송/재발송 버튼 */}
        <div className={styles.inputRow}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            disabled={verificationStatus === 'VERIFIED'}
            required
            className={`${styles.inputBase} ${
              verificationStatus === 'VERIFIED' ? styles.inputDisabled : ''
            } ${fieldErrors.email ? styles.inputError : ''}`}
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleSendCode}
            disabled={isSendDisabled}
            className={`${styles.sideButton} ${
              verificationStatus === 'VERIFIED' ? styles.sideButtonSuccess : ''
            }`}
          >
            {verificationStatus === 'SENDING'
              ? '발송 중...'
              : verificationStatus === 'IDLE'
                ? '인증번호 발송'
                : verificationStatus === 'VERIFIED'
                  ? '인증완료'
                  : '재발송'}
          </Button>
        </div>

        {/* 이메일 에러 문구 */}
        {fieldErrors.email && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.email}
          </span>
        )}

        {/* 인증번호 입력 + 확인 버튼 */}
        <div className={styles.inputRow}>
          <input
            id="authCode"
            type="text"
            value={authCode}
            onChange={handleAuthCodeChange}
            disabled={
              verificationStatus === 'IDLE' ||
              verificationStatus === 'SENDING' ||
              verificationStatus === 'VERIFIED'
            }
            className={`${styles.inputBase} ${
              verificationStatus === 'IDLE' ||
              verificationStatus === 'SENDING' ||
              verificationStatus === 'VERIFIED'
                ? styles.inputDisabled
                : ''
            } ${fieldErrors.authCode ? styles.inputError : ''}`}
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleVerifyCode}
            disabled={isVerifyDisabled || !authCode.trim()}
            className={`${styles.sideButton} ${
              isVerifyDisabled ? styles.sideButtonDisabled : ''
            }`}
          >
            {verificationStatus === 'VERIFYING' ? '확인 중...' : '인증번호 확인'}
          </Button>
        </div>

        {/* 인증번호 에러 문구 */}
        {fieldErrors.authCode && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.authCode}
          </span>
        )}

        {/* 발송 성공 & 타이머 노출 */}
        {!fieldErrors.email &&
          !fieldErrors.authCode &&
          verificationStatus === 'SENT' && (
            <div className={styles.messageSent}>
              <span>인증번호를 발송했습니다.</span>
              {timeLeft > 0 ? (
                <span className={styles.timerBadge}>
                  (유효시간 {formatTime(timeLeft)})
                </span>
              ) : (
                <span className={styles.messageError}>
                  유효시간이 만료되었습니다.
                </span>
              )}
            </div>
          )}

        {/* 인증 완료 메시지 */}
        {!fieldErrors.email &&
          !fieldErrors.authCode &&
          verificationStatus === 'VERIFIED' && (
            <div className={styles.messageVerified}>인증이 완료되었습니다.</div>
          )}

        {/* 인증 실패 메시지 */}
        {!fieldErrors.authCode && verificationStatus === 'FAILED' && (
          <div className={styles.messageError}>
            인증번호가 일치하지 않습니다.
          </div>
        )}
      </div>

      {/* 2. 새 비밀번호 필드 */}
      <div className={styles.fieldGroup}>
        <label htmlFor="newPassword" className={styles.label}>
          새 비밀번호 <span className={styles.required}>*</span>
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={handleNewPasswordChange}
          required
          className={`${styles.inputBase} ${styles.inputPassword} ${
            fieldErrors.newPassword ? styles.inputError : ''
          }`}
        />
        {fieldErrors.newPassword && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.newPassword}
          </span>
        )}
      </div>

      {/* 3. 새 비밀번호 확인 필드 */}
      <div className={styles.fieldGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          새 비밀번호 확인 <span className={styles.required}>*</span>
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          required
          className={`${styles.inputBase} ${styles.inputPassword} ${
            fieldErrors.confirmPassword ? styles.inputError : ''
          }`}
        />
        {fieldErrors.confirmPassword ? (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.confirmPassword}
          </span>
        ) : newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 ? (
          <span className={styles.messageMatch}>
            비밀번호가 일치합니다.
          </span>
        ) : null}
      </div>

      {/* 공통 에러 메시지 */}
      {generalError && (
        <div className={styles.generalError} role="alert">
          {generalError}
        </div>
      )}

      {/* 4. 하단 변경하기 버튼 */}
      <div className={styles.submitWrapper}>
        <Button
          type="submit"
          variant="primary"
          className={styles.submitButton}
          disabled={isSubmitDisabled}
        >
          {isSubmitting ? '변경 처리 중...' : '변경하기'}
        </Button>
      </div>
    </form>
  );
}
