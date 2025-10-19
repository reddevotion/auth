import { generate2FACode, randomString } from "@/utils/generation";

export type LoginPayload = {
  email: string;
  password: string;
  remember?: boolean;
};

export type MockAPISession = {
  tempToken: string;
  code: string;
  expiresAt: number;
};

export let mock2FASession: MockAPISession | null = null;

export type LoginSuccess = {
  token: string;
  user: { email: string };
};

export type LoginTwoFARequired = {
  status: "2FA_REQUIRED";
  tempToken: string;
};

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_LOCKED"
  | "RATE_LIMIT"
  | "SERVER_ERROR"
  | "NETWORK_ERROR"
  | "INVALID_2FA_CODE"
  | "CODE_EXPIRED";

export type AuthError = {
  code: AuthErrorCode;
  message: string;
  retryAfterSec?: number;
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const randomJitter = () => 200 + Math.random() * 400;

export async function login(payload: LoginPayload): Promise<LoginSuccess | LoginTwoFARequired> {
  await delay(600 + randomJitter());

  const email = payload.email.trim().toLowerCase();
  const isValid = payload.password === "Password123!";

  if (email === "network@demo.dev" && isValid) {
    const err: AuthError = {
      code: "NETWORK_ERROR",
      message: "Network issue. Check your connection and try again.",
    };
    throw err;
  }

  if (email === "server@demo.dev" && isValid) {
    const err: AuthError = {
      code: "SERVER_ERROR",
      message: "Server error. Please try again later.",
    };
    throw err;
  }

  if (email === "rate@demo.dev" && isValid) {
    const err: AuthError = {
      code: "RATE_LIMIT",
      message: "Too many attempts. Please wait before retrying.",
      retryAfterSec: 30,
    };
    throw err;
  }

  if (email === "locked@demo.dev" && isValid) {
    const err: AuthError = {
      code: "ACCOUNT_LOCKED",
      message: "Account locked. Contact support.",
    };
    throw err;
  }


  if (email === "2fa@demo.dev" && isValid) {
    const tempToken = randomString(16);
    const code = generate2FACode();
    const expiresAt = Date.now() + 60_000; 

    mock2FASession = { tempToken, code, expiresAt };
    console.log("🔹 2FA code (for demo):", code);

    const res: LoginTwoFARequired = { status: "2FA_REQUIRED", tempToken };
    return res;
  }

  if (!isValid) {
    const err: AuthError = {
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
    throw err;
  }

  const success: LoginSuccess = {
    token: randomString(32),
    user: { email },
  };
  return success;
}




export async function verifyTwoFA({ tempToken, code }: { tempToken: string; code: string }): Promise<LoginSuccess> {
  if (!mock2FASession || mock2FASession.tempToken !== tempToken) {
    throw { code: "CODE_EXPIRED", message: "Session expired" };
  }

  if (Date.now() > mock2FASession.expiresAt) {
    mock2FASession = null;
    throw { code: "CODE_EXPIRED", message: "Code expired" };
  }

  if (mock2FASession.code !== code) {
    throw { code: "INVALID_2FA_CODE", message: "Invalid 2FA code" };
  }

  // Success
  const token = randomString(32);
  mock2FASession = null;
  return { token, user: { email: "2fa@demo.dev" } };
}

export async function resendTwoFA({ tempToken }: { tempToken: string }) {
  if (!mock2FASession || mock2FASession.tempToken !== tempToken) {
    throw { code: "CODE_EXPIRED", message: "Session expired" };
  }

  mock2FASession.code = generate2FACode();
  mock2FASession.expiresAt = Date.now() + 60_000; 
  console.log("🔹 New 2FA code (for demo):", mock2FASession.code);

  return { ok: true };
}