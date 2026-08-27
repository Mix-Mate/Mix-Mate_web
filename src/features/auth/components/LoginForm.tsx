'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/shared/ui/Button';
import { setAuthTokens } from '@/shared/api/authToken';
import { loginApi, AuthApiError } from '../api/auth.api';
import logoIcon from '../../../../public/icons/logo.svg';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setFieldErrors({});
    setGeneralError(null);
    setIsLoading(true);

    try {
      const response = await loginApi({
        email: email.trim(),
        password,
      });

      setAuthTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      if (typeof window !== 'undefined') {
        if (response.userName) {
          window.localStorage.setItem('userName', response.userName);
        }
        if (response.userId) {
          window.localStorage.setItem('userId', String(response.userId));
        }
        if (response.email) {
          window.localStorage.setItem('email', response.email);
        }
      }

      router.push('/home');
    } catch (error: unknown) {
      if (error instanceof AuthApiError) {
        if (
          error.status === 400 &&
          error.fieldErrors &&
          Object.keys(error.fieldErrors).length > 0
        ) {
          setFieldErrors(error.fieldErrors);
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError(
          error instanceof Error
            ? error.message
            : '로그인 중 오류가 발생했습니다.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. 상단 로고 & 타이틀 영역 */}
      <div className={styles.header}>
        <div className={styles.logoWrapper}>
          <Image
            src={logoIcon}
            alt="MixMate 로고"
            width={80}
            height={80}
            className={styles.logoImage}
            priority
          />
        </div>

        <h1 className={styles.title}>MixMate</h1>
        <p className={styles.subtitle}>술자리 조 편성 서비스</p>
      </div>

      {/* 2. 입력 폼 영역 */}
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* 이메일 인풋 */}
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder=" "
            required
            className={`${styles.inputEmail} ${
              fieldErrors.email ? styles.inputError : ''
            }`}
          />
          {fieldErrors.email && (
            <span className={styles.fieldError} role="alert">
              {fieldErrors.email}
            </span>
          )}
        </div>

        {/* 비밀번호 인풋 */}
        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder=""
            required
            className={`${styles.inputPassword} ${
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

        {/* 로그인 버튼 */}
        <Button
          type="submit"
          variant="primary"
          className={styles.loginButton}
          disabled={isLoading || !email.trim() || !password}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>

        {/* 구분선 */}
        <div className={styles.divider} />

        {/* 3. 회원가입 유도 영역 */}
        <div className={styles.signupWrapper}>
          <span className={styles.signupText}>아직 계정이 없으신가요?</span>
          <Link href="/signup" className={styles.signupLink}>
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
}