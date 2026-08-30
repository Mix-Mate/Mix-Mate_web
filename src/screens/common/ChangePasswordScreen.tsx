'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/shared/ui/MobileFrame';
import Header from '@/shared/ui/Header';
import { FindPasswordForm } from '@/features/auth/components/FindPasswordForm';
import styles from './ChangePasswordScreen.module.css';

export default function ChangePasswordScreen() {
  const router = useRouter();

  return (
    <MobileFrame data-testid="change-password-screen">
      <div className={styles.container}>
        <Header
          title="비밀번호 변경"
          onBack={() => router.back()}
          backLabel="이전 화면으로 이동"
        />

        <main className={styles.main}>
          <FindPasswordForm />
        </main>
      </div>
    </MobileFrame>
  );
}
