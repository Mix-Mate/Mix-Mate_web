import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SignupForm } from './SignupForm';
import * as authApi from '../api/auth.api';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
  });

  it('초기 렌더링 시 이름, 이메일, 인증번호, 비밀번호, 비밀번호 확인 필드가 렌더링되고 가입하기 버튼은 비활성화된다', () => {
    render(<SignupForm />);

    expect(screen.getByLabelText(/^이름 \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^이메일 \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^비밀번호 \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^비밀번호 확인 \*/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /가입하기/i }),
    ).toBeDisabled();
  });

  it('비밀번호와 비밀번호 확인이 불일치할 경우 에러 메시지가 표시되고 가입하기 버튼이 비활성화된다', async () => {
    vi.spyOn(authApi, 'sendVerificationCodeApi').mockResolvedValue('OK');
    vi.spyOn(authApi, 'verifyCodeApi').mockResolvedValue('OK');

    const { container } = render(<SignupForm />);

    // 이름 입력
    fireEvent.change(screen.getByLabelText(/^이름 \*/i), {
      target: { value: '홍길동' },
    });

    // 이메일 인증
    fireEvent.change(screen.getByLabelText(/^이메일 \*/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /인증번호 발송/i }));

    await waitFor(() => {
      expect(container.querySelector('#authCode')).toBeEnabled();
    });
    fireEvent.change(container.querySelector('#authCode')!, {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /인증번호 확인/i }));

    await waitFor(() => {
      expect(screen.getByText('인증이 완료되었습니다.')).toBeInTheDocument();
    });

    // 비밀번호 불일치 입력
    fireEvent.change(screen.getByLabelText(/^비밀번호 \*/i), {
      target: { value: 'password123!' },
    });
    fireEvent.change(screen.getByLabelText(/^비밀번호 확인 \*/i), {
      target: { value: 'different123!' },
    });

    expect(
      screen.getByText('비밀번호가 일치하지 않습니다.'),
    ).toBeInTheDocument();

    const submitButton = screen.getByRole('button', {
      name: /가입하기/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('모든 필드가 유효하고 비밀번호가 일치하면 가입하기 버튼이 활성화되고 제출된다', async () => {
    vi.spyOn(authApi, 'sendVerificationCodeApi').mockResolvedValue('OK');
    vi.spyOn(authApi, 'verifyCodeApi').mockResolvedValue('OK');
    vi.spyOn(authApi, 'signupApi').mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      userName: '홍길동',
    });

    const { container } = render(<SignupForm />);

    // 이름 입력
    fireEvent.change(screen.getByLabelText(/^이름 \*/i), {
      target: { value: '홍길동' },
    });

    // 이메일 인증
    fireEvent.change(screen.getByLabelText(/^이메일 \*/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /인증번호 발송/i }));

    await waitFor(() => {
      expect(container.querySelector('#authCode')).toBeEnabled();
    });
    fireEvent.change(container.querySelector('#authCode')!, {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /인증번호 확인/i }));

    await waitFor(() => {
      expect(screen.getByText('인증이 완료되었습니다.')).toBeInTheDocument();
    });

    // 비밀번호 일치 입력
    fireEvent.change(screen.getByLabelText(/^비밀번호 \*/i), {
      target: { value: 'password123!' },
    });
    fireEvent.change(screen.getByLabelText(/^비밀번호 확인 \*/i), {
      target: { value: 'password123!' },
    });

    expect(screen.getByText('비밀번호가 일치합니다.')).toBeInTheDocument();

    const submitButton = screen.getByRole('button', {
      name: /가입하기/i,
    });
    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authApi.signupApi).toHaveBeenCalledWith({
        userName: '홍길동',
        email: 'user@example.com',
        password: 'password123!',
      });
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });
});
