import type { GraphqlApiError } from "@/lib/api";

export function getErrorCode(error: unknown) {
  const apiError = error as GraphqlApiError & {
    data?: GraphqlApiError;
    error?: GraphqlApiError;
    errors?: GraphqlApiError["errors"];
  };

  return apiError.code
    ?? apiError.data?.code
    ?? apiError.error?.code
    ?? apiError.errors?.[0]?.extensions?.code;
}

export function getVerificationEmailFromError(error: unknown) {
  const apiError = error as GraphqlApiError & {
    data?: GraphqlApiError;
    error?: GraphqlApiError;
    errors?: GraphqlApiError["errors"];
  };
  const errors = apiError?.errors
    ?? apiError?.data?.errors
    ?? apiError?.error?.errors;
  const email = errors?.[0]?.extensions?.email;

  if (typeof email === "string" && email.includes("@")) {
    return email.trim().toLowerCase();
  }

  return "";
}

export function isEmailNotVerifiedError(error: unknown) {
  return getErrorCode(error) === "EMAIL_NOT_VERIFIED";
}

export function isForbiddenError(error: unknown) {
  return getErrorCode(error) === "FORBIDDEN";
}

export function isUnverifiedLoginError(error: unknown) {
  return isForbiddenError(error) || isEmailNotVerifiedError(error);
}

const messages: Record<string, string> = {
  ACCOUNT_SUSPENDED: "This account is suspended. Contact support for help.",
  EMAIL_NOT_VERIFIED: "Verify your email before signing in.",
  FORBIDDEN: "This account is not available. Verify your email or contact support.",
  INVALID_CREDENTIALS: "Invalid credentials. Please try again.",
  INVALID_RESET_TOKEN: "This reset link is invalid or has expired.",
  USER_SUSPENDED: "This account is suspended. Contact support for help.",
};

export function loginErrorMessage(
  error: unknown,
  fallback = "Unable to sign in. Check your details and try again.",
) {
  const code = getErrorCode(error);

  switch (code) {
    case "UNAUTHENTICATED":
    case "INVALID_CREDENTIALS":
      return "Invalid credentials. Please try again.";
    case "FORBIDDEN":
      return messages.FORBIDDEN;
    case "TOO_MANY_REQUESTS":
      return "Too many attempts. Please wait a moment and try again.";
    default:
      return (code && messages[code]) || fallback;
  }
}

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
