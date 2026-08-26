'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/shared/ui/Button';
import { login } from '@/features/auth/api/auth.api';
import { setAccessToken } from '@/shared/api/authToken';
// AS-IS (에러)
// import logoIcon from '@/public/icons/logo.svg';

// TO-BE (수정: 프로젝트 루트의 public 경로 참조)
import logoIcon from '../../../../public/icons/logo.svg';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const data = await login({ email, password });
      setAccessToken(data.accessToken);
      router.push('/groups/1/home?role=user');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '로그인에 실패했습니다.',
      );
    } finally {
      setIsSubmitting(false);
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
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* 이메일 인풋 */}
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            required
            className={styles.inputEmail}
          />
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
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
            required
            className={styles.inputPassword}
          />
        </div>

        {/* 로그인 버튼 */}
        <Button
          type="submit"
          variant="primary"
          className={styles.loginButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </Button>

        {errorMessage && (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        )}

        {/* 구분선 */}
        <div className={styles.divider} />

        {/* 회원가입 영역 */}
        <div className={styles.signupWrapper}>
          <span className={styles.signupText}>계정이 없나요?</span>
          <Link href="/signup" className={styles.signupLink}>
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
}
