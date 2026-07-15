import type { GraphqlApiError } from "@/lib/api";

const messages: Record<string, string> = {
  ACCOUNT_SUSPENDED: "This account is suspended. Contact support for help.",
  EMAIL_NOT_VERIFIED: "Verify your email before signing in.",
  INVALID_CREDENTIALS: "The identifier or password is incorrect.",
  INVALID_RESET_TOKEN: "This reset link is invalid or has expired.",
  INVALID_VERIFICATION_TOKEN: "This verification link is invalid or has expired.",
  USER_SUSPENDED: "This account is suspended. Contact support for help.",
};

export function safeAuthError(error: unknown, fallback: string) {
  const apiError = error as { data?: GraphqlApiError; error?: GraphqlApiError };
  const code = apiError.data?.code ?? apiError.error?.code;
  return (code && messages[code]) || fallback;
}
