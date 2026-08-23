'use client';

import MobileFrame from '@/shared/ui/MobileFrame';
import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginScreen() {
  return (
    <MobileFrame data-testid="login-screen">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', // 세로 정중앙 정렬
          flex: 1, // 프레임의 남은 세로 공간을 100% 채움
          minHeight: '100%', // 전체 높이 확보
          padding: '20.55px 25.68px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <LoginForm />
      </div>
    </MobileFrame>
  );
}