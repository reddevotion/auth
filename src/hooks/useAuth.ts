import { useMutation } from '@tanstack/react-query';
import { message } from 'antd';
import { useNavigate } from '@tanstack/react-router';
import { login, resendTwoFA, verifyTwoFA } from '../api/authApi';
import type { AuthError, LoginPayload, LoginSuccess, LoginTwoFARequired } from '../api/authApi';

export function useAuth() {
    const navigate = useNavigate();
  const loginMutation = useMutation<
    LoginSuccess | LoginTwoFARequired, // Success type
    AuthError,                         // Error type
    LoginPayload                       // Variables type
  >({
    mutationFn: login,
    onError: (error) => {
      switch (error.code) {
        case 'INVALID_CREDENTIALS':
          message.error('Invalid email or password.');
          break;
        case 'ACCOUNT_LOCKED':
          message.error('Your account is locked.');
          break;
        case 'RATE_LIMIT':
          message.warning(`Too many attempts. Try again in ${error.retryAfterSec}s`);
          break;
        case 'SERVER_ERROR':
          message.error('Server error. Try again later.');
          break;
        case 'NETWORK_ERROR':
          message.warning('Network issue. Please check your connection.');
          break;
        case 'INVALID_2FA_CODE':
          message.error('Invalid 2FA code.');
          break;
        case 'CODE_EXPIRED':
          message.error('2FA code expired. Please request a new one.');
          break;
        default:
          message.error('Unexpected error.');
      }
    },
    onSuccess: (data) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if ('status' in data && data.status === '2FA_REQUIRED') {
        message.info('2FA required. Redirecting...');
        navigate({
          to: '/2fa',
          search: (old:any) => ({ ...old, tempToken: data.tempToken }),
        });
      } else {
        message.success('Login successful!');
      }
    },
  });

    const twoFactorMutation = useMutation<LoginSuccess, AuthError, { tempToken: string; code: string }>({
    mutationFn: verifyTwoFA,
    onError: (error) => {
      switch (error.code) {
        case "INVALID_2FA_CODE":
          message.error("Invalid 2FA code.");
          break;
        case "CODE_EXPIRED":
          message.warning("Your 2FA code has expired. Please request a new one.");
          break;
        case "NETWORK_ERROR":
          message.warning("Network issue. Try again later.");
          break;
        default:
          message.error("Unexpected error during 2FA verification.");
      }
    }
  });

  const resendMutation = useMutation<{ ok: boolean }, AuthError, { tempToken: string }>({
    mutationFn: resendTwoFA,
    onError: (error) => {
      message.error(error.message || "Failed to resend code.");
    },
    onSuccess: () => {
      message.success("A new 2FA code has been sent to your email!");
    },
  });

  return {
    loginMutation,
    twoFactorMutation,
    resendMutation
  }
}

