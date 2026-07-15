"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button, FormGroup, Input } from "@/components/atomic";
import { useRequestPasswordResetMutation } from "@/lib/features/auth/authApi";

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();
  const [requestReset, { isLoading }] = useRequestPasswordResetMutation();
  const [sent, setSent] = useState(false);

  async function onSubmit({ email }: { email: string }) {
    try {
      await requestReset(email).unwrap();
    } catch {
      // Deliberately return the same result for known and unknown accounts.
    } finally {
      // Use the same response for known and unknown accounts.
      setSent(true);
    }
  }

  return (
    <main className="m-auto w-full max-w-lg border border-danger-light p-8 text-danger-light">
      <h1 className="mb-6 text-4xl font-bold">Reset password</h1>
      {sent ? (
        <p>If an account exists for that email, a password reset link has been sent.</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <FormGroup><Input label="email" htmlFor="email" type="email" autoComplete="email" errorMessage={errors.email?.message} {...register("email", { required: "Email is required" })} /></FormGroup>
          <Button type="submit" variant="fill" buttonType="secondary" disabled={isLoading}>{isLoading ? "sending…" : "send reset link"}</Button>
        </form>
      )}
      <Link href="/login" className="mt-6 block underline">Back to login</Link>
    </main>
  );
}