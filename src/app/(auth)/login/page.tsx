"use client"
import {
  Button,
  FormGroup,
  Input
} from "@/components/atomic";
import { LandingLink } from "@/components/atomic/landing-link/LandingLink";
import { LoadingIcon } from "@/components/icons";
import { useLoginUserMutation } from "@/lib/features/auth/authApi";
import {
  isEmailNotVerifiedError,
  isForbiddenError,
  loginErrorMessage,
} from "@/lib/features/auth/authErrors";
import {
  beginEmailVerificationFlow,
  LOGIN_VERIFICATION_MESSAGE,
} from "@/lib/features/auth/verificationNavigation";
import {
  emailFromLoginIdentifier,
  resolveVerificationEmailFromLogin,
} from "@/lib/features/auth/verificationFlow";
import { useAppDispatch } from "@/lib/hooks";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Inputs {
  identifier: string
  password: string
}

export default function LoginPage() {
    const {
    register,
    handleSubmit,
    formState: {
      errors,
    }
  } = useForm<Inputs>()
  const [login, { isLoading }] = useLoginUserMutation()
  const [submitError, setSubmitError] = useState("")
  const router = useRouter()
  const dispatch = useAppDispatch()

  async function onSubmit(data: Inputs) {
    setSubmitError("")
    try {
      const result = await login(data).unwrap()
      if (result.user.status === "ACTIVE") {
        router.replace("/home")
      } else if (result.user.status === "PENDING_VERIFICATION") {
        beginEmailVerificationFlow(dispatch, {
          email: result.user.email,
          message: LOGIN_VERIFICATION_MESSAGE,
        });
        router.replace("/check-email");
      } else {
        setSubmitError("This account is suspended. Contact support for help.")
      }
    } catch (error) {
      if (isForbiddenError(error)) {
        const email = emailFromLoginIdentifier(data.identifier);

        if (email) {
          beginEmailVerificationFlow(dispatch, {
            email,
            message: LOGIN_VERIFICATION_MESSAGE,
          });
          router.replace("/check-email");
          return;
        }

        setSubmitError(loginErrorMessage(error));
        return;
      }

      if (isEmailNotVerifiedError(error)) {
        const email = resolveVerificationEmailFromLogin(data.identifier, error);

        if (email) {
          beginEmailVerificationFlow(dispatch, {
            email,
            message: LOGIN_VERIFICATION_MESSAGE,
          });
          router.replace("/check-email");
          return;
        }

        setSubmitError(loginErrorMessage(error));
        return;
      }

      setSubmitError(loginErrorMessage(error))
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="m-auto overflow-hidden"
        key={"login"}
        
        initial={{ 
          translateX: 300,
          opacity: 0 
        }}
        animate={{ 
          translateX: 0,
          opacity: 1 
        }}
        exit={{
          translateX: -300,
          opacity: 0
        }}
        transition={{
          type: "spring",
          duration: .7
        }}
      >
        <main className="w-full p-8 flex column h-[100vh] items-center overflow-hidden" >
          <form className="flex flex-col p-8 border border-danger-light max-h-[684px] mx-auto min-w-[450px]">
            <header className="flex flex-col justify-center w-full items-center">
              <LandingLink />
              <h2 className="font-bold text-4xl text-danger-light mb-12">Login</h2>
            </header>
            <FormGroup className="mb-4">
              <Input
                errorMessage={errors.identifier?.message}
                label="email or username"
                htmlFor="identifier"
                type="text"
                autoComplete="username"
                {...register("identifier", { required: "Email or username is required" } )}
              />
            </FormGroup>
            <FormGroup className="mb-4">
              <Input
                errorMessage={errors["password"]?.message}
                className="mb-4"
                label="password"
                htmlFor="password"
                type="password"
                autoComplete="current-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                })}
              />
              <a
                className="text-danger-light font-extralight text-lg ml-auto block text-right"
                href="/forgot-password"
              >
                Forgot password?
              </a>
            </FormGroup>
            {submitError && <p role="alert" className="mb-4 text-center text-danger-light">{submitError}</p>}
            <FormGroup className="mb-4">
              <Button
                className="flex relative"
                type="submit"
                variant="fill"
                buttonType="secondary"
                onClick={handleSubmit(onSubmit)}
                rounded
              >
                login
                <LoadingIcon isLoading={isLoading} />
              </Button>
            </FormGroup>
            <FormGroup>
              <p className=" text-danger-light font-extralight text-lg mx-auto text-center">
                Don&apos;t have an account? <Link href="signup"><strong>Create account</strong></Link>
              </p>
            </FormGroup>
          </form>
        </main>
      </motion.div>
    </AnimatePresence>
  )
}
