import type { AppDispatch } from "@/lib/store";
import {
  normalizeEmail,
  saveVerificationFlow,
  type VerificationFlowSnapshot,
} from "./verificationFlow";
import { verificationFlowStarted } from "./verificationFlowSlice";

export const DEFAULT_VERIFICATION_MESSAGE =
  "Enter the confirmation code sent to your email to continue using the app.";

export const LOGIN_VERIFICATION_MESSAGE = "Confirm your email to sign in.";

export function beginEmailVerificationFlow(
  dispatch: AppDispatch,
  {
    email,
    message = DEFAULT_VERIFICATION_MESSAGE,
    resendAvailableAt = null,
  }: {
    email: string;
    message?: string;
    resendAvailableAt?: number | null;
  },
) {
  const snapshot: VerificationFlowSnapshot = {
    email: normalizeEmail(email),
    message,
    resendAvailableAt,
  };

  saveVerificationFlow(snapshot);
  dispatch(verificationFlowStarted(snapshot));
}
