"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button, FormGroup, Input } from "@/components/atomic";
import { useLogoutAllMutation, useUpdateProfileMutation, useUserProfileQuery } from "@/lib/features/auth/authApi";
import { safeAuthError } from "@/lib/features/auth/authErrors";
import { useOfflineTodoSettings } from "@/lib/features/todos/offline/hooks";

type ProfileForm = {
  birthdate: string;
  lastName: string;
  name: string;
  profilePicture: string;
};

export default function ProfilePage() {
  const { data, isLoading } = useUserProfileQuery();
  const [updateProfile, updateState] = useUpdateProfileMutation();
  const [logoutAll, logoutAllState] = useLogoutAllMutation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileForm>();
  const [message, setMessage] = useState("");
  const [isChangingLocalOnly, setIsChangingLocalOnly] = useState(false);
  const {
    disableLocalOnly,
    enableLocalOnly,
    localOnly,
  } = useOfflineTodoSettings();
  const router = useRouter();

  useEffect(() => {
    if (data) {
      reset({
        birthdate: data.birthdate.slice(0, 10),
        lastName: data.lastName,
        name: data.name,
        profilePicture: data.profilePicture ?? "",
      });
    }
  }, [data, reset]);

  async function onSubmit(input: ProfileForm) {
    setMessage("");
    try {
      await updateProfile({
        ...input,
        birthdate: new Date(`${input.birthdate}T00:00:00.000Z`).toISOString(),
        profilePicture: input.profilePicture || null,
      }).unwrap();
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(safeAuthError(error, "Unable to update your profile."));
    }
  }

  async function handleLogoutAll() {
    try {
      await logoutAll().unwrap();
    } finally {
      router.replace("/login");
    }
  }

  async function handleLocalOnlyChange() {
    if (isChangingLocalOnly) return;
    if (
      localOnly
      && !window.confirm(
        "Turn off local-only mode and upload local todo changes to your account?",
      )
    ) {
      return;
    }

    setIsChangingLocalOnly(true);
    setMessage("");
    try {
      if (localOnly) {
        await disableLocalOnly?.();
        setMessage("Local-only mode disabled. Todo changes will sync in the background.");
      } else {
        await enableLocalOnly?.();
        setMessage("Local-only mode enabled.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to change local-only mode. Please try again.",
      );
    } finally {
      setIsChangingLocalOnly(false);
    }
  }

  if (isLoading) return <p className="m-auto text-danger-light">Loading profile…</p>;

  return (
    <main className="mx-auto w-full max-w-xl overflow-auto px-8 pb-8 text-danger-light">
      <h1 className="mb-6 text-4xl font-bold">Profile</h1>
      <section
        data-testid="profile-local-only-row"
        className="mb-8 rounded border border-danger-light p-4"
      >
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold">Local-only todos</h2>
            <p className="mt-2 font-light">
              Keep todo changes on this device. Existing server todos are not deleted.
              Turning this off uploads your local changes after confirmation.
            </p>
          </div>
          <label className="flex items-center gap-3">
            <span className="sr-only">Local-only todos</span>
            <input
              data-testid="profile-local-only-switch"
              type="checkbox"
              role="switch"
              aria-checked={localOnly}
              checked={localOnly}
              disabled={isChangingLocalOnly}
              onChange={handleLocalOnlyChange}
              className="h-6 w-12 cursor-pointer accent-secondary"
            />
          </label>
        </div>
      </section>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormGroup><Input label="name" htmlFor="name" errorMessage={errors.name?.message} {...register("name", { required: "Name is required" })} /></FormGroup>
        <FormGroup><Input label="last name" htmlFor="lastName" errorMessage={errors.lastName?.message} {...register("lastName", { required: "Last name is required" })} /></FormGroup>
        <FormGroup><Input label="birthdate" htmlFor="birthdate" type="date" errorMessage={errors.birthdate?.message} {...register("birthdate", { required: "Birthdate is required" })} /></FormGroup>
        <FormGroup><Input label="profile picture URL" htmlFor="profilePicture" type="url" {...register("profilePicture")} /></FormGroup>
        {message && <p role="status">{message}</p>}
        <Button type="submit" variant="fill" buttonType="secondary" disabled={updateState.isLoading}>{updateState.isLoading ? "saving…" : "save profile"}</Button>
      </form>
      <div className="mt-6 flex items-center gap-6">
        <Link href="/change-password" className="underline">Change password</Link>
        <button type="button" className="underline" onClick={handleLogoutAll} disabled={logoutAllState.isLoading}>
          {logoutAllState.isLoading ? "Signing out…" : "Sign out all devices"}
        </button>
      </div>
    </main>
  );
}
