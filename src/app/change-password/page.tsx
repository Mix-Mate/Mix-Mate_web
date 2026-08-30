import type { Metadata } from 'next';
import ChangePasswordScreen from '@/screens/common/ChangePasswordScreen';

export const metadata: Metadata = {
  title: 'MixMate - 비밀번호 변경',
  description: 'MixMate 비밀번호 변경 화면입니다.',
};

export default function ChangePasswordPage() {
  return <ChangePasswordScreen />;
}
