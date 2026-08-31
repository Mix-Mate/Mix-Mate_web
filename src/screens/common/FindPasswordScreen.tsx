'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/shared/ui/MobileFrame';
import Header from '@/shared/ui/Header';
import { FindPasswordForm } from '@/features/auth/components/FindPasswordForm';
import styles from './FindPasswordScreen.module.css';

export default function FindPasswordScreen() {
  const router = useRouter();

  return (
    <MobileFrame data-testid="find-password-screen">
      <div className={styles.container}>
        <Header
          title="비밀번호 찾기"
          onBack={() => router.push('/login')}
          backLabel="로그인 화면으로 이동"
        />

        <main className={styles.main}>
          <FindPasswordForm />
        </main>
      </div>
    </MobileFrame>
  );
}
