import { Suspense } from 'react';
import LoginScreen from '@/screens/common/LoginScreen';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginScreen />
    </Suspense>
  );
}