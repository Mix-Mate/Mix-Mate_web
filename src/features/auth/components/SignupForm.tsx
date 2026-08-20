'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/shared/ui/Button';
import InfoBanner from '@/shared/ui/InfoBanner';
import styles from './SignupForm.module.css';

type VerificationStatus = 'IDLE' | 'SENT' | 'VERIFIED' | 'FAILED';

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [password, setPassword] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('IDLE');

  const handleSendCode = () => {
    if (!email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    // TODO: 인증번호 발송 API 연동
    setVerificationStatus('SENT');
  };

  const handleVerifyCode = () => {
    if (!authCode) {
      alert('인증번호를 입력해주세요.');
      return;
    }

    // TODO: 실제 API 연동 시 백엔드 검증 결과에 따라 분기
    // 임시 테스트 로직: '123456'일 때 성공, 그 외 실패
    if (authCode === '123456') {
      setVerificationStatus('VERIFIED');
    } else {
      setVerificationStatus('FAILED');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationStatus !== 'VERIFIED') {
      alert('이메일 인증을 완료해주세요.');
      return;
    }

    // TODO: 백엔드 회원가입 API 연동 완료 후
    console.log('회원가입 요청:', { name, email, password });
    alert('회원가입이 완료되었습니다! 로그인 화면으로 이동합니다.');
    router.push('/login');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
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
          onChange={(e) => setName(e.target.value)}
          required
          className={styles.inputBase}
        />
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
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.inputBase}
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
            disabled={verificationStatus === 'IDLE' || verificationStatus === 'VERIFIED'}
            className={`${styles.inputBase} ${
              verificationStatus === 'IDLE' ? styles.inputDisabled : ''
            }`}
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleVerifyCode}
            disabled={verificationStatus === 'IDLE' || verificationStatus === 'VERIFIED'}
            className={`${styles.sideButton} ${
              verificationStatus === 'IDLE' || verificationStatus === 'VERIFIED'
                ? styles.sideButtonDisabled
                : ''
            }`}
          >
            인증번호 확인
          </Button>
        </div>

        {/* 상태 1: 발송 성공 메시지 */}
        {verificationStatus === 'SENT' && (
          <div className={styles.messageSent}>
            인증번호를 {email}로 발송했습니다.
          </div>
        )}

        {/* 상태 2: 인증 완료 메시지 */}
        {verificationStatus === 'VERIFIED' && (
          <div className={styles.messageVerified}>인증이 완료되었습니다.</div>
        )}

        {/* 상태 3: 인증 실패 메시지 */}
        {verificationStatus === 'FAILED' && (
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
          onChange={(e) => setPassword(e.target.value)}
          required
          className={`${styles.inputBase} ${styles.inputPassword}`}
        />
      </div>

      {/* 4. 가입하기 버튼 */}
      <div className={styles.submitWrapper}>
        <Button type="submit" variant="primary" className={styles.submitButton}>
          가입하기
        </Button>
      </div>
    </form>
  );
}