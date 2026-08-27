'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/shared/ui/Button';
import InfoBanner from '@/shared/ui/InfoBanner';
import {
  sendVerificationCodeApi,
  verifyCodeApi,
  signupApi,
  AuthApiError,
} from '../api/auth.api';
import styles from './SignupForm.module.css';

type VerificationStatus =
  | 'IDLE'
  | 'SENDING'
  | 'SENT'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'FAILED';

const VERIFICATION_TIME_LIMIT_SEC = 300; // 5분 유효시간

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [password, setPassword] = useState('');
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (fieldErrors.userName || fieldErrors.name) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.userName;
        delete next.name;
        return next;
      });
    }
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
    }
  };

  // 1. [인증번호 발송] / [재발송] 클릭
  const handleSendCode = async () => {
    if (!email.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        email: '이메일을 입력해주세요.',
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
  const handleVerifyCode = async () => {
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

  // 3. [가입하기] 제출
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

    setFieldErrors({});
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      await signupApi({
        email: email.trim(),
        password,
        userName: name.trim(),
      });

      // 200 성공 시: "회원가입이 완료되었습니다." 알림 후 로그인 화면(/login)으로 라우팅
      alert('회원가입이 완료되었습니다.');
      router.push('/login');
    } catch (error: unknown) {
      if (error instanceof AuthApiError) {
        if (
          error.status === 400 &&
          error.fieldErrors &&
          Object.keys(error.fieldErrors).length > 0
        ) {
          const mappedErrors: Record<string, string> = { ...error.fieldErrors };
          if (error.fieldErrors.name && !mappedErrors.userName) {
            mappedErrors.userName = error.fieldErrors.name;
          }
          setFieldErrors(mappedErrors);
        } else if (
          error.code === 'EMAIL_NOT_VERIFIED' ||
          error.message.includes('인증')
        ) {
          setFieldErrors((prev) => ({
            ...prev,
            email: error.message || '이메일 인증이 완료되지 않았습니다.',
          }));
        } else if (
          error.status === 409 ||
          error.code === 'EMAIL_CONFLICTED' ||
          error.message.includes('이미 가입된')
        ) {
          setFieldErrors((prev) => ({
            ...prev,
            email: error.message || '이미 가입된 이메일입니다.',
          }));
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError(
          error instanceof Error
            ? error.message
            : '회원가입 중 오류가 발생했습니다.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nameError = fieldErrors.userName || fieldErrors.name;
  const isSendDisabled =
    verificationStatus === 'SENDING' ||
    verificationStatus === 'VERIFIED' ||
    !email.trim();
  const isVerifyDisabled =
    verificationStatus !== 'SENT' && verificationStatus !== 'FAILED';

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {/* 팀 공통 InfoBanner 적용 */}
      <InfoBanner>
        <p>이름과 이메일만으로 간단하게 가입합니다.</p>
        <p>그룹별 상세 정보는 그룹 입장 후 입력합니다.</p>
      </InfoBanner>

      {/* 1. 이름 필드 */}
      <div className={styles.fieldGroup}>
        <label htmlFor="name" className={styles.label}>
          이름 <span className={styles.required}>*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={handleNameChange}
          required
          className={`${styles.inputBase} ${
            nameError ? styles.inputError : ''
          }`}
        />
        {nameError && (
          <span className={styles.fieldError} role="alert">
            {nameError}
          </span>
        )}
      </div>

      {/* 2. 이메일 & 인증번호 필드 */}
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
              fieldErrors.email ? styles.inputError : ''
            }`}
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
            placeholder="인증번호 6자리 입력"
            value={authCode}
            onChange={handleAuthCodeChange}
            disabled={
              verificationStatus === 'IDLE' ||
              verificationStatus === 'SENDING' ||
              verificationStatus === 'VERIFIED'
            }
            className={`${styles.inputBase} ${
              verificationStatus === 'IDLE' || verificationStatus === 'SENDING'
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

        {/* 상태 1: 발송 성공 & 타이머 노출 */}
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

        {/* 상태 2: 인증 완료 메시지 */}
        {!fieldErrors.email &&
          !fieldErrors.authCode &&
          verificationStatus === 'VERIFIED' && (
            <div className={styles.messageVerified}>인증이 완료되었습니다.</div>
          )}

        {/* 상태 3: 인증 실패 메시지 */}
        {!fieldErrors.authCode && verificationStatus === 'FAILED' && (
          <div className={styles.messageError}>
            인증번호가 일치하지 않습니다.
          </div>
        )}
      </div>

      {/* 3. 비밀번호 필드 */}
      <div className={styles.fieldGroup}>
        <label htmlFor="password" className={styles.label}>
          비밀번호 <span className={styles.required}>*</span>
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          required
          className={`${styles.inputBase} ${styles.inputPassword} ${
            fieldErrors.password ? styles.inputError : ''
          }`}
        />
        {fieldErrors.password && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.password}
          </span>
        )}
      </div>

      {/* 공통 에러 메시지 */}
      {generalError && (
        <div className={styles.generalError} role="alert">
          {generalError}
        </div>
      )}

      {/* 4. 가입하기 버튼 */}
      <div className={styles.submitWrapper}>
        <Button
          type="submit"
          variant="primary"
          className={styles.submitButton}
          disabled={
            isSubmitting ||
            verificationStatus !== 'VERIFIED' ||
            !name.trim() ||
            !email.trim() ||
            !password
          }
        >
          {isSubmitting ? '가입 처리 중...' : '가입하기'}
        </Button>
      </div>
    </form>
  );
}