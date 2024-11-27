'use client'

import {
  SignUpForm,
  SignUpProfileForm
} from "@/components/organism";
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
        className="m-auto overflow-hidden"
        key={signUpStep}
        initial={{ 
          translateX: 300,
          opacity: 0
        }}
        animate={{ 
          translateX: 0,
          opacity: 1,
        }}
        exit={{ 
          translateX: -300,
          opacity: 0,
        }}
        transition={{
          type: 'spring',
          duration: .7,
        }}
      >
        { selectStep() }
      </motion.div>
    </AnimatePresence>
  )
}
