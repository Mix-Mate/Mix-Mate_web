'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MobileFrame from '@/shared/ui/MobileFrame';
import Header from '@/shared/ui/Header';
import { useMyPageUserProfileQuery } from '@/features/user/hooks/useMyPageUserProfileQuery';
import { FindPasswordForm } from '@/features/auth/components/FindPasswordForm';
import { authRoutes } from '@/shared/lib/navigation/routes';
import styles from './ChangePasswordScreen.module.css';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useMyPageUserProfileQuery();

  useEffect(() => {
    if (
      !isLoading &&
      profile &&
      profile.provider.trim().toUpperCase() !== 'LOCAL'
    ) {
      router.replace(authRoutes.myPage());
    }
  }, [isLoading, profile, router]);

  const isSocialAccount =
    profile && profile.provider.trim().toUpperCase() !== 'LOCAL';

  return (
    <MobileFrame data-testid="change-password-screen">
      <div className={styles.container}>
        <Header
          title="비밀번호 변경"
          onBack={() => router.back()}
          backLabel="이전 화면으로 이동"
        />

        <main className={styles.main}>
          {!isLoading && !isError && !isSocialAccount && <FindPasswordForm />}
        </main>
      </div>
    </MobileFrame>
  );
}
