import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChangePasswordScreen from './ChangePasswordScreen';

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

describe('ChangePasswordScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('헤더 타이틀로 "비밀번호 변경"이 렌더링되고 뒤로가기 버튼 클릭 시 router.back()이 호출된다', () => {
    render(<ChangePasswordScreen />);

    expect(screen.getByText('비밀번호 변경')).toBeInTheDocument();
    const backButton = screen.getByRole('button', {
      name: '이전 화면으로 이동',
    });
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('비밀번호 변경 폼 내부 요소들이 정상적으로 렌더링된다', () => {
    render(<ChangePasswordScreen />);

    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^새 비밀번호 \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^새 비밀번호 확인 \*/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /변경하기/i }),
    ).toBeDisabled();
  });
});
