import { Suspense } from 'react';
import FindPasswordScreen from '@/screens/common/FindPasswordScreen';

export default function FindPasswordPage() {
  return (
    <Suspense fallback={null}>
      <FindPasswordScreen />
    </Suspense>
  );
}
