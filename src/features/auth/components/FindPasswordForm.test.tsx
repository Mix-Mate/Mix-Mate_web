import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FindPasswordForm } from './FindPasswordForm';
import * as authApi from '../api/auth.api';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

describe('FindPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('초기 렌더링 시 이메일 입력창, 인증번호 발송 버튼, 새 비밀번호 입력란이 존재하고 변경하기 버튼은 비활성화된다', () => {
    render(<FindPasswordForm />);

    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /인증번호 발송/i }),
    ).toBeDisabled();
    expect(screen.getByLabelText(/^새 비밀번호 \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^새 비밀번호 확인 \*/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /변경하기/i }),
    ).toBeDisabled();
  });

  it('유효한 이메일 입력 후 인증번호 발송 및 인증 완료 시 인증완료 메시지가 표시된다', async () => {
    vi.spyOn(authApi, 'sendPasswordResetCodeApi').mockResolvedValue('OK');
    vi.spyOn(authApi, 'verifyPasswordResetCodeApi').mockResolvedValue('OK');

    const { container } = render(<FindPasswordForm />);

    const emailInput = screen.getByLabelText(/이메일/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

    const sendButton = screen.getByRole('button', { name: /인증번호 발송/i });
    expect(sendButton).toBeEnabled();

    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(authApi.sendPasswordResetCodeApi).toHaveBeenCalledWith({
        email: 'user@example.com',
      });
      expect(screen.getByText('인증번호가 발송되었습니다')).toBeInTheDocument();
    });

    const authCodeInput = container.querySelector('#authCode')!;
    fireEvent.change(authCodeInput, { target: { value: '123456' } });

    const verifyButton = screen.getByRole('button', { name: /인증번호 확인/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(authApi.verifyPasswordResetCodeApi).toHaveBeenCalledWith({
        email: 'user@example.com',
        code: '123456',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('인증이 완료되었습니다.')).toBeInTheDocument();
    });
  });

  it('비밀번호 변경 성공 시 sessionStorage에 토스트 메시지를 저장하고 /login으로 replace 이동한다', async () => {
    vi.spyOn(authApi, 'sendPasswordResetCodeApi').mockResolvedValue('OK');
    vi.spyOn(authApi, 'verifyPasswordResetCodeApi').mockResolvedValue('OK');
    vi.spyOn(authApi, 'resetPasswordApi').mockResolvedValue({
      message: '비밀번호가 성공적으로 변경되었습니다.',
    });

    const { container } = render(<FindPasswordForm />);

    // 1. 이메일 입력 & 발송
    fireEvent.change(screen.getByLabelText(/이메일/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /인증번호 발송/i }));

    // 2. 인증코드 입력 & 검증
    await waitFor(() => {
      expect(container.querySelector('#authCode')).toBeEnabled();
    });
    fireEvent.change(container.querySelector('#authCode')!, {
      target: { value: '654321' },
    });
    fireEvent.click(screen.getByRole('button', { name: /인증번호 확인/i }));

    // 3. 비밀번호 입력
    await waitFor(() => {
      expect(screen.getByText('인증이 완료되었습니다.')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/^새 비밀번호 \*/i), {
      target: { value: 'newPassword123!' },
    });
    fireEvent.change(screen.getByLabelText(/^새 비밀번호 확인 \*/i), {
      target: { value: 'newPassword123!' },
    });

    const submitButton = screen.getByRole('button', {
      name: /변경하기/i,
    });
    expect(submitButton).toBeEnabled();
    expect(screen.getByText('비밀번호가 일치합니다.')).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authApi.resetPasswordApi).toHaveBeenCalledWith({
        email: 'test@example.com',
        newPassword: 'newPassword123!',
      });
      expect(sessionStorage.getItem('authToast')).toBe(
        '비밀번호가 성공적으로 변경되었습니다.',
      );
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('/login?toast='),
      );
    });
  });

  it('새 비밀번호와 확인 입력값이 불일치할 경우 에러 메시지가 표시되고 버튼이 비활성화된다', async () => {
    vi.spyOn(authApi, 'sendPasswordResetCodeApi').mockResolvedValue('OK');
    vi.spyOn(authApi, 'verifyPasswordResetCodeApi').mockResolvedValue('OK');

    const { container } = render(<FindPasswordForm />);

    // 이메일 인증 완료
    fireEvent.change(screen.getByLabelText(/이메일/i), {
      target: { value: 'test@example.com' },
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
    fireEvent.change(screen.getByLabelText(/^새 비밀번호 \*/i), {
      target: { value: 'password123!' },
    });
    fireEvent.change(screen.getByLabelText(/^새 비밀번호 확인 \*/i), {
      target: { value: 'different123!' },
    });

    expect(
      screen.getByText('비밀번호가 일치하지 않습니다.'),
    ).toBeInTheDocument();

    const submitButton = screen.getByRole('button', {
      name: /변경하기/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('인증번호 발송 실패(404 가입되지 않은 이메일) 시 에러 메시지가 표시된다', async () => {
    vi.spyOn(authApi, 'sendPasswordResetCodeApi').mockRejectedValue(
      new authApi.AuthApiError('가입되지 않은 이메일입니다.', 404),
    );

    render(<FindPasswordForm />);

    fireEvent.change(screen.getByLabelText(/이메일/i), {
      target: { value: 'notfound@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /인증번호 발송/i }));

    await waitFor(() => {
      expect(
        screen.getByText('가입되지 않은 이메일입니다.'),
      ).toBeInTheDocument();
    });
  });

  it('인증번호 검증 실패(400) 시 에러 메시지가 표시된다', async () => {
    vi.spyOn(authApi, 'sendPasswordResetCodeApi').mockResolvedValue('OK');
    vi.spyOn(authApi, 'verifyPasswordResetCodeApi').mockRejectedValue(
      new authApi.AuthApiError(
        '인증번호가 올바르지 않거나 만료되었습니다.',
        400,
      ),
    );

    const { container } = render(<FindPasswordForm />);

    fireEvent.change(screen.getByLabelText(/이메일/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /인증번호 발송/i }));

    await waitFor(() => {
      expect(container.querySelector('#authCode')).toBeEnabled();
    });

    fireEvent.change(container.querySelector('#authCode')!, {
      target: { value: '999999' },
    });
    fireEvent.click(screen.getByRole('button', { name: /인증번호 확인/i }));

    await waitFor(() => {
      expect(
        screen.getByText('인증번호가 올바르지 않거나 만료되었습니다.'),
      ).toBeInTheDocument();
    });
  });
});
