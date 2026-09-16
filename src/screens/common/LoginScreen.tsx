'use client';

import MobileFrame from '@/shared/ui/MobileFrame';
import { LoginForm } from '@/features/auth/components/LoginForm';
import styles from './LoginScreen.module.css';

export default function LoginScreen() {
  return (
    <MobileFrame
      data-testid="login-screen"
      viewportClassName={styles.viewport}
      className={styles.phone}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', // 세로 정중앙 정렬
          flex: 1, // 프레임의 남은 세로 공간을 100% 채움
          minHeight: 'var(--mobile-frame-height)', // 짧은 화면에서도 중앙 정렬 기준 확보
          padding: '24px 20px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <LoginForm />
      </div>
    </MobileFrame>
  );
}