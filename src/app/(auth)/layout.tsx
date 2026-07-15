"use client"

import { useAppSelector } from "@/lib/hooks";
import { MotionConfig } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = useAppSelector(state => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (auth.isAuthenticated && auth.user?.status === "ACTIVE") {
      router.replace("/home")
    }
  }, [auth.isAuthenticated, auth.user, router])

  if (auth.isAuthenticated && auth.user?.status === "ACTIVE") return null

  return (
    <div className='bg-gradient-to-br from-secondary to-primary-dark min-h-screen w-full p-8 flex overflow-auto'>
        <MotionConfig transition={{ ease: "easeInOut"}}>
          {children}
        </MotionConfig>
    </div>
  )
}
