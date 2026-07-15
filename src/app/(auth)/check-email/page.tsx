"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/atomic";
import { useResendVerificationMutation } from "@/lib/features/auth/authApi";
import { safeAuthError } from "@/lib/features/auth/authErrors";

function CheckEmailContent() {
  const email = useSearchParams().get("email") ?? "";
  const [resend, { isLoading }] = useResendVerificationMutation();
  const [message, setMessage] = useState("");

  async function handleResend() {
    if (!email) return setMessage("Return to registration and provide your email address.");
    try {
      await resend(email).unwrap();
      setMessage("A new verification email has been sent.");
    } catch (error) {
      setMessage(safeAuthError(error, "Unable to resend the email. Please try again."));
    }
  }

  return (
    <main className="m-auto max-w-lg border border-danger-light p-8 text-center text-danger-light">
      <h1 className="mb-4 text-4xl font-bold">Check your email</h1>
      <p className="mb-6">Use the verification link sent to {email || "your email address"}.</p>
      {message && <p role="status" className="mb-4">{message}</p>}
      <Button type="button" variant="outlined" buttonType="secondary" onClick={handleResend} disabled={isLoading}>
        {isLoading ? "sending…" : "resend verification"}
      </Button>
      <Link href="/login" className="mt-6 block underline">Back to login</Link>
    </main>
  );
}

export default function CheckEmailPage() {
  return <Suspense fallback={<p className="m-auto text-danger-light">Loading…</p>}><CheckEmailContent /></Suspense>;
}
