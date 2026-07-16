import type { GraphqlApiError } from "@/lib/api";

export function getErrorCode(error: unknown) {
  const apiError = error as GraphqlApiError & {
    data?: GraphqlApiError;
    error?: GraphqlApiError;
  };

  return apiError.code ?? apiError.data?.code ?? apiError.error?.code;
}

const messages: Record<string, string> = {
  ACCOUNT_SUSPENDED: "This account is suspended. Contact support for help.",
  EMAIL_NOT_VERIFIED: "Verify your email before signing in.",
  INVALID_CREDENTIALS: "The identifier or password is incorrect.",
  INVALID_RESET_TOKEN: "This reset link is invalid or has expired.",
  USER_SUSPENDED: "This account is suspended. Contact support for help.",
};

export function safeAuthError(error: unknown, fallback: string) {
  const code = getErrorCode(error);
  return (code && messages[code]) || fallback;
}

export function verificationErrorMessage(
  error: unknown,
  fallback = "Unable to verify your code. Please try again.",
) {
  const code = getErrorCode(error);

  switch (code) {
    case "UNAUTHENTICATED":
      return "Invalid or expired code.";
    case "TOO_MANY_REQUESTS":
      return "Too many attempts. Please wait a moment and try again.";
    case "BAD_USER_INPUT":
      return "Enter a valid email and six-digit code.";
    default:
      return fallback;
  }
}
