"use client"

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { beginEmailVerificationFlow, LOGIN_VERIFICATION_MESSAGE } from "@/lib/features/auth/verificationNavigation";
import { MotionConfig } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = useAppSelector(state => state.auth)
  const router = useRouter()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (auth.user?.status === "PENDING_VERIFICATION") {
      beginEmailVerificationFlow(dispatch, {
        email: auth.user.email,
        message: LOGIN_VERIFICATION_MESSAGE,
      });
      router.replace("/check-email");
      return;
    }

    if (auth.isAuthenticated && auth.user?.status === "ACTIVE") {
      router.replace("/home")
    }
  }, [auth.isAuthenticated, auth.user, dispatch, router])

  if (auth.user?.status === "PENDING_VERIFICATION") return null
  if (auth.isAuthenticated && auth.user?.status === "ACTIVE") return null

  return (
    <div className='bg-gradient-to-br from-secondary to-primary-dark min-h-screen w-full p-8 flex overflow-auto'>
        <MotionConfig transition={{ ease: "easeInOut"}}>
          {children}
        </MotionConfig>
    </div>
  )
}
