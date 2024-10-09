'use client'

import { SignUpForm } from "@/components/organism/signup-form/SignUpForm";
import { SignUpProfileForm } from "@/components/organism/signup-profile-form/SignUpProfileForm";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type SignUpStep = 'credentials' | 'profile'

export default function SingUp() {
  const [signUpStep, setSignUpStep] = useState<SignUpStep>('credentials')
  const moveToNextStep = useCallback(() => setSignUpStep('profile'), [])
  const router = useRouter()

  function selectStep() {
    switch(signUpStep) {
      case 'credentials':
        return <SignUpForm moveToNextStep={moveToNextStep} />
      case 'profile':
        return <SignUpProfileForm navigate={() => router.push('home')}/>
      default:
        throw new Error('Broken step not found!')
      }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="m-auto"
        key={signUpStep}
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ duration: 0.1 }}
      >
        { selectStep() }
      </motion.div>
    </AnimatePresence>
  )
}
