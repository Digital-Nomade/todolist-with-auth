"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, FormGroup, Input } from "@/components/atomic";
import { VerificationCodeInput } from "@/components/atomic/verification-code-input/VerificationCodeInput";
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from "@/lib/features/auth/authApi";
import { getErrorCode, safeAuthError, verificationErrorMessage } from "@/lib/features/auth/authErrors";
import {
  clearVerificationFlowState,
  getRemainingResendCooldownMs,
  getVerificationMessage,
  isValidVerificationCode,
  maskEmail,
  normalizeEmail,
  resolveVerificationEmail,
  setResendCooldown,
  storeVerificationEmail,
  VERIFICATION_RESEND_COOLDOWN_MS,
} from "@/lib/features/auth/verificationFlow";

type ViewState = "confirm" | "recover-email";

function formatCooldown(ms: number) {
  return Math.ceil(ms / 1000);
}

function readVerificationState(queryEmail: string | null) {
  const resolvedEmail = resolveVerificationEmail(queryEmail);

  return {
    email: resolvedEmail,
    registrationMessage: getVerificationMessage() ?? "",
    viewState: resolvedEmail ? "confirm" as ViewState : "recover-email",
  };
}

function CheckEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get("email");
  const initialState = readVerificationState(queryEmail);
  const [email, setEmail] = useState(initialState.email);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [code, setCode] = useState("");
  const [registrationMessage, setRegistrationMessage] = useState(
    initialState.registrationMessage,
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [codeError, setCodeError] = useState("");
  const [viewState, setViewState] = useState<ViewState>(initialState.viewState);
  const [resendCooldownMs, setResendCooldownMs] = useState(0);
  const [verifyBlockedUntil, setVerifyBlockedUntil] = useState(0);
  const [verify, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resend, { isLoading: isResending }] = useResendVerificationMutation();

  useEffect(() => {
    const nextState = readVerificationState(queryEmail);
    setEmail(nextState.email);
    setRegistrationMessage(nextState.registrationMessage);
    setViewState(nextState.viewState);
  }, [queryEmail]);

  useEffect(() => {
    if (!email) return;

    const updateCooldown = () => {
      setResendCooldownMs(getRemainingResendCooldownMs(email));
    };

    updateCooldown();
    const timer = window.setInterval(updateCooldown, 1000);
    return () => window.clearInterval(timer);
  }, [email]);

  const maskedEmail = useMemo(() => maskEmail(email), [email]);
  const isVerifyBlocked = verifyBlockedUntil > Date.now();
  const canResend = resendCooldownMs === 0 && !isResending;
  const canVerify = Boolean(email)
    && isValidVerificationCode(code)
    && !isVerifying
    && !isVerifyBlocked;

  const handleVerify = useCallback(async () => {
    if (!email) {
      setViewState("recover-email");
      return;
    }

    if (!isValidVerificationCode(code)) {
      setCodeError("Enter the six-digit code from your email.");
      return;
    }

    setCodeError("");
    setStatusMessage("");

    try {
      await verify({ email, code }).unwrap();
      clearVerificationFlowState();
      router.replace("/login");
    } catch (error) {
      const message = verificationErrorMessage(error);
      setStatusMessage(message);

      const errorCode = getErrorCode(error);

      if (errorCode === "BAD_USER_INPUT") {
        setCodeError("Enter a valid six-digit code.");
      }

      if (errorCode === "TOO_MANY_REQUESTS") {
        setVerifyBlockedUntil(Date.now() + VERIFICATION_RESEND_COOLDOWN_MS);
      }
    }
  }, [code, email, router, verify]);

  async function handleResend() {
    if (!email) {
      setViewState("recover-email");
      setStatusMessage("Enter your email address to resend the code.");
      return;
    }

    if (!canResend) return;

    setStatusMessage("");

    try {
      const result = await resend(email).unwrap();
      setResendCooldown(email);
      setResendCooldownMs(VERIFICATION_RESEND_COOLDOWN_MS);
      setCode("");
      setCodeError("");
      setStatusMessage(
        `${result.message} Any previous code is no longer valid.`,
      );
    } catch (error) {
      setStatusMessage(safeAuthError(error, "Unable to resend the code. Please try again."));
    }
  }

  function handleRecoverySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeEmail(recoveryEmail);

    if (!normalized) {
      setStatusMessage("Enter the email you used during registration.");
      return;
    }

    storeVerificationEmail(normalized);
    setEmail(normalized);
    setViewState("confirm");
    setStatusMessage("");
  }

  if (viewState === "recover-email") {
    return (
      <main className="m-auto max-w-lg border border-danger-light p-8 text-danger-light">
        <h1 className="mb-4 text-center text-4xl font-bold">Confirm your email</h1>
        <p className="mb-6 text-center">
          Enter the email you used during registration to receive a confirmation code.
        </p>
        <form onSubmit={handleRecoverySubmit} className="flex flex-col gap-5">
          <FormGroup>
            <Input
              label="email"
              htmlFor="recovery-email"
              type="email"
              autoComplete="email"
              value={recoveryEmail}
              onChange={(event) => setRecoveryEmail(event.target.value)}
            />
          </FormGroup>
          {statusMessage && <p role="status">{statusMessage}</p>}
          <Button type="submit" variant="fill" buttonType="secondary" rounded>
            continue
          </Button>
        </form>
        <Link href="/signup" className="mt-6 block text-center underline">
          Back to registration
        </Link>
      </main>
    );
  }

  return (
    <main className="m-auto max-w-lg border border-danger-light p-8 text-danger-light">
      <h1 className="mb-4 text-center text-4xl font-bold">Confirm your email</h1>
      {registrationMessage && (
        <p role="status" className="mb-4 text-center">{registrationMessage}</p>
      )}
      <p className="mb-6 text-center">
        Enter the six-digit code sent to <strong>{maskedEmail}</strong>.
      </p>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleVerify();
        }}
        className="flex flex-col gap-5"
      >
        <VerificationCodeInput
          value={code}
          onChange={(nextCode) => {
            setCode(nextCode);
            if (codeError) setCodeError("");
          }}
          errorMessage={codeError}
          disabled={isVerifying || isVerifyBlocked}
          autoFocus
        />

        {statusMessage && <p role="status">{statusMessage}</p>}

        <Button
          type="submit"
          variant="fill"
          buttonType="secondary"
          rounded
          disabled={!canVerify}
        >
          {isVerifying ? "verifying…" : "verify code"}
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <Button
          type="button"
          variant="outlined"
          buttonType="secondary"
          onClick={handleResend}
          disabled={!canResend}
        >
          {isResending
            ? "sending…"
            : canResend
              ? "resend code"
              : `resend code in ${formatCooldown(resendCooldownMs)}s`}
        </Button>
        <Link href="/signup" className="underline">Use a different email</Link>
        <Link href="/login" className="underline">Back to login</Link>
      </div>
    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<p className="m-auto text-danger-light">Loading…</p>}>
      <CheckEmailContent />
    </Suspense>
  );
}
