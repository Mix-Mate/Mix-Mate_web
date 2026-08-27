'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/shared/ui/Button';
import InfoBanner from '@/shared/ui/InfoBanner';
import { signupApi, AuthApiError } from '../api/auth.api';
import styles from './SignupForm.module.css';

type VerificationStatus = 'IDLE' | 'SENT' | 'VERIFIED' | 'FAILED';

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [password, setPassword] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('IDLE');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSendCode = () => {
    if (!email.trim()) {
      setFieldErrors((prev) => ({
        ...prev,
        email: '이메일을 입력해주세요.',
      }));
      return;
    }
    // 이메일 에러 초기화 및 인증번호 발송 상태 전환
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.email;
      return next;
    });
    setVerificationStatus('SENT');
  };

  const handleVerifyCode = () => {
    if (!authCode.trim()) {
      setVerificationStatus('FAILED');
      return;
    }

    // 임시 테스트 로직: '123456' 또는 인증번호 입력 시 성공
    if (authCode.trim() === '123456' || authCode.trim().length >= 4) {
      setVerificationStatus('VERIFIED');
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    } else {
      setVerificationStatus('FAILED');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 이메일 인증 완료 여부 확인
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
          // 400 에러 시: errors 객체 내의 필드별 에러를 각 인풋 하단에 바인딩
          const mappedErrors: Record<string, string> = { ...error.fieldErrors };
          if (error.fieldErrors.name && !mappedErrors.userName) {
            mappedErrors.userName = error.fieldErrors.name;
          }
          setFieldErrors(mappedErrors);
        } else if (
          error.code === 'EMAIL_NOT_VERIFIED' ||
          error.message.includes('인증')
        ) {
          // "EMAIL_NOT_VERIFIED"인 경우 이메일 입력창 하단 에러로 message 노출
          setFieldErrors((prev) => ({
            ...prev,
            email: error.message || '이메일 인증이 완료되지 않았습니다.',
          }));
        } else if (
          error.status === 409 ||
          error.code === 'EMAIL_CONFLICTED' ||
          error.message.includes('이미 가입된')
        ) {
          // 409 에러 시: "이미 가입된 이메일입니다." 문구를 이메일 입력창 하단 에러로 표시
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
          className={`${styles.inputBase} ${nameError ? styles.inputError : ''}`}
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
            required
            className={`${styles.inputBase} ${
              fieldErrors.email ? styles.inputError : ''
            }`}
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleSendCode}
            className={styles.sideButton}
          >
            {verificationStatus === 'IDLE' ? '인증번호 발송' : '재발송'}
          </Button>
        </div>

        {/* 인증번호 입력 + 확인 버튼 */}
        <div className={styles.inputRow}>
          <input
            id="authCode"
            type="text"
            placeholder="인증번호 입력"
            value={authCode}
            onChange={(e) => setAuthCode(e.target.value)}
            disabled={
              verificationStatus === 'IDLE' || verificationStatus === 'VERIFIED'
            }
            className={`${styles.inputBase} ${
              verificationStatus === 'IDLE' ? styles.inputDisabled : ''
            }`}
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleVerifyCode}
            disabled={
              verificationStatus === 'IDLE' || verificationStatus === 'VERIFIED'
            }
            className={`${styles.sideButton} ${
              verificationStatus === 'IDLE' || verificationStatus === 'VERIFIED'
                ? styles.sideButtonDisabled
                : ''
            }`}
          >
            인증번호 확인
          </Button>
        </div>

        {/* 필드 에러 메시지 */}
        {fieldErrors.email && (
          <span className={styles.fieldError} role="alert">
            {fieldErrors.email}
          </span>
        )}

        {/* 상태 1: 발송 성공 메시지 (에러가 없을 때) */}
        {!fieldErrors.email && verificationStatus === 'SENT' && (
          <div className={styles.messageSent}>
            인증번호를 {email}로 발송했습니다.
          </div>
        )}

        {/* 상태 2: 인증 완료 메시지 (에러가 없을 때) */}
        {!fieldErrors.email && verificationStatus === 'VERIFIED' && (
          <div className={styles.messageVerified}>인증이 완료되었습니다.</div>
        )}

        {/* 상태 3: 인증 실패 메시지 (에러가 없을 때) */}
        {!fieldErrors.email && verificationStatus === 'FAILED' && (
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