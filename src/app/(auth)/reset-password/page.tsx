"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button, FormGroup, Input } from "@/components/atomic";
import { useResetPasswordMutation } from "@/lib/features/auth/authApi";
import { safeAuthError } from "@/lib/features/auth/authErrors";

function ResetPasswordContent() {
  const token = useSearchParams().get("token") ?? "";
  const { register, handleSubmit, watch, formState: { errors } } = useForm<{ newPassword: string; confirmPassword: string }>();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);

  async function onSubmit({ newPassword }: { newPassword: string }) {
    if (!token) return setMessage("This reset link is invalid.");
    try {
      await resetPassword({ token, newPassword }).unwrap();
      setComplete(true);
    } catch (error) {
      setMessage(safeAuthError(error, "This reset link is invalid or has expired."));
    }
  }

  return (
    <main className="m-auto w-full max-w-lg border border-danger-light p-8 text-danger-light">
      <h1 className="mb-6 text-4xl font-bold">Choose a new password</h1>
      {complete ? <><p>Password updated successfully.</p><Link href="/login" className="mt-5 block underline">Continue to login</Link></> : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <FormGroup><Input label="new password" htmlFor="newPassword" type="password" autoComplete="new-password" errorMessage={errors.newPassword?.message} {...register("newPassword", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })} /></FormGroup>
          <FormGroup><Input label="confirm password" htmlFor="confirmPassword" type="password" autoComplete="new-password" errorMessage={errors.confirmPassword?.message} {...register("confirmPassword", { required: "Confirm your password", validate: value => value === watch("newPassword") || "Passwords must match" })} /></FormGroup>
          {message && <p role="alert">{message}</p>}
          <Button type="submit" variant="fill" buttonType="secondary" disabled={isLoading}>{isLoading ? "updating…" : "update password"}</Button>
        </form>
      )}
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<p className="m-auto text-danger-light">Loading…</p>}><ResetPasswordContent /></Suspense>;
}
