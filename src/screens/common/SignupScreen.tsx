'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/shared/ui/MobileFrame';
import Header from '@/shared/ui/Header';
import { SignupForm } from '@/features/auth/components/SignupForm';
import styles from './SignupScreen.module.css';

export default function SignupScreen() {
  const router = useRouter();

  return (
    <MobileFrame data-testid="signup-screen">
      <div className={styles.container}>
        <Header
          title="회원가입"
          onBack={() => router.push('/login')}
          backLabel="로그인 화면으로 이동"
        />

        <main className={styles.main}>
          <SignupForm />
        </main>
      </div>
    </MobileFrame>
  );
}