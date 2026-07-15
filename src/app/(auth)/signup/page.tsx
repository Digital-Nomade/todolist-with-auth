"use client";

import { Button, FormGroup, Input } from "@/components/atomic";
import { LoadingIcon } from "@/components/icons";
import { useRegisterUserMutation } from "@/lib/features/auth/authApi";
import { safeAuthError } from "@/lib/features/auth/authErrors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Inputs = {
  birthdate: string;
  confirmPassword: string;
  email: string;
  lastName: string;
  name: string;
  password: string;
  profilePicture?: string;
  username: string;
};

export default function SignUp() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
  const [createUser, { isLoading }] = useRegisterUserMutation();
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();

  async function onSubmit({ confirmPassword: _confirm, ...input }: Inputs) {
    void _confirm;
    setSubmitError("");
    try {
      await createUser({
        ...input,
        birthdate: new Date(`${input.birthdate}T00:00:00.000Z`).toISOString(),
        profilePicture: input.profilePicture || null,
      }).unwrap();
      router.push(`/check-email?email=${encodeURIComponent(input.email)}`);
    } catch (error) {
      setSubmitError(safeAuthError(error, "Unable to create the account. Review your details and try again."));
    }
  }

  return (
    <main className="m-auto w-full max-w-xl py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 border border-danger-light p-8">
        <h1 className="text-4xl font-bold text-danger-light">Create account</h1>
        <FormGroup><Input label="email" htmlFor="email" type="email" autoComplete="email" errorMessage={errors.email?.message} {...register("email", { required: "Email is required" })} /></FormGroup>
        <FormGroup><Input label="username" htmlFor="username" autoComplete="username" errorMessage={errors.username?.message} {...register("username", { required: "Username is required" })} /></FormGroup>
        <FormGroup><Input label="password" htmlFor="password" type="password" autoComplete="new-password" errorMessage={errors.password?.message} {...register("password", { required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } })} /></FormGroup>
        <FormGroup><Input label="confirm password" htmlFor="confirm-password" type="password" autoComplete="new-password" errorMessage={errors.confirmPassword?.message} {...register("confirmPassword", { required: "Confirm your password", validate: value => value === watch("password") || "Passwords must match" })} /></FormGroup>
        <div className="grid grid-cols-2 gap-5">
          <FormGroup><Input label="name" htmlFor="name" errorMessage={errors.name?.message} {...register("name", { required: "Name is required" })} /></FormGroup>
          <FormGroup><Input label="last name" htmlFor="lastName" errorMessage={errors.lastName?.message} {...register("lastName", { required: "Last name is required" })} /></FormGroup>
        </div>
        <FormGroup><Input label="birthdate" htmlFor="birthdate" type="date" errorMessage={errors.birthdate?.message} {...register("birthdate", { required: "Birthdate is required" })} /></FormGroup>
        <FormGroup><Input label="profile picture URL (optional)" htmlFor="profilePicture" type="url" {...register("profilePicture")} /></FormGroup>
        {submitError && <p role="alert" className="text-danger-light">{submitError}</p>}
        <Button type="submit" variant="fill" buttonType="secondary" rounded disabled={isLoading}>
          create account <LoadingIcon isLoading={isLoading} />
        </Button>
        <p className="text-center text-danger-light">Already registered? <Link href="/login"><strong>Login</strong></Link></p>
      </form>
    </main>
  );
}
