"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/atomic";
import { useVerifyEmailMutation } from "@/lib/features/auth/authApi";

type State = "loading" | "success" | "invalid";

function VerifyEmailContent() {
  const token = useSearchParams().get("token");
  const [verify] = useVerifyEmailMutation();
  const [state, setState] = useState<State>("loading");

  const runVerification = useCallback(async () => {
    if (!token) return setState("invalid");
    setState("loading");
    try {
      await verify(token).unwrap();
      setState("success");
    } catch {
      setState("invalid");
    }
  }, [token, verify]);

  useEffect(() => {
    void runVerification();
  }, [runVerification]);

  return (
    <main className="m-auto max-w-lg border border-danger-light p-8 text-center text-danger-light">
      {state === "loading" && <><h1 className="text-3xl font-bold">Verifying email</h1><p className="mt-4">Please wait…</p></>}
      {state === "success" && <><h1 className="text-3xl font-bold">Email verified</h1><p className="my-4">Your account is ready.</p><Link href="/login" className="underline">Continue to login</Link></>}
      {state === "invalid" && <><h1 className="text-3xl font-bold">Invalid verification link</h1><p className="my-4">The link is invalid or has expired.</p><Button type="button" variant="outlined" buttonType="secondary" onClick={runVerification}>retry</Button><Link href="/login" className="mt-5 block underline">Back to login</Link></>}
    </main>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<p className="m-auto text-danger-light">Loading…</p>}><VerifyEmailContent /></Suspense>;
}
