"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button, FormGroup, Input } from "@/components/atomic";
import { useChangePasswordMutation } from "@/lib/features/auth/authApi";
import { safeAuthError } from "@/lib/features/auth/authErrors";

type PasswordForm = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

export default function ChangePasswordPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<PasswordForm>();
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function onSubmit({ currentPassword, newPassword }: PasswordForm) {
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      router.replace("/login");
    } catch (error) {
      setMessage(safeAuthError(error, "Unable to change your password."));
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-8 text-danger-light">
      <h1 className="mb-6 text-4xl font-bold">Change password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormGroup><Input label="current password" htmlFor="currentPassword" type="password" autoComplete="current-password" errorMessage={errors.currentPassword?.message} {...register("currentPassword", { required: "Current password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })} /></FormGroup>
        <FormGroup><Input label="new password" htmlFor="newPassword" type="password" autoComplete="new-password" errorMessage={errors.newPassword?.message} {...register("newPassword", { required: "New password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })} /></FormGroup>
        <FormGroup><Input label="confirm new password" htmlFor="confirmPassword" type="password" autoComplete="new-password" errorMessage={errors.confirmPassword?.message} {...register("confirmPassword", { required: "Confirm your new password", validate: value => value === watch("newPassword") || "Passwords must match" })} /></FormGroup>
        {message && <p role="alert">{message}</p>}
        <Button type="submit" variant="fill" buttonType="secondary" disabled={isLoading}>{isLoading ? "updating…" : "change password"}</Button>
      </form>
    </main>
  );
}
