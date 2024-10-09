'use client'

import { Button } from "@/components/atomic/button/Button";
import { FormGroup } from "@/components/atomic/form-group/FormGroup";
import { Input } from "@/components/atomic/input/Input";
import { LoadingIcon } from "@/components/icons/loading-icon/LoadingIcon";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Inputs {
  email: string
  password: string
}

export default function LoginPage() {
    const {
    register,
    handleSubmit,
    // watch,
    formState: {
      errors,
    }
  } = useForm<Inputs>()
  const [loading, setLoading] = useState(false)

  function onSubmit(data: unknown) {
    setLoading(true)
    console.log(data)
    setTimeout(() => {
      setLoading(true)
    }, 2000)
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="m-auto"
        key={'login'}
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -300, opacity: 0 }}
        transition={{ duration: 0.1 }}
      >
        <main
          className="w-full p-8 flex column"
        >
          <form className="flex flex-col p-8 border border-danger-light max-h-[684px] mx-auto min-w-[450px]">
            <h1 className="font-bold text-4xl text-danger-light mb-16">Login</h1>
            <FormGroup>
              <Input
                errorMessage={errors['email']?.message}
                label="email"
                htmlFor="email"
                type="email"
                {...register('email', { required: 'Username is required' } )} 
              />
            </FormGroup>
            <FormGroup>
              <Input
                errorMessage={errors['password']?.message}
                className="mb-4"
                label="password"
                htmlFor="password"
                type="password"
                {...register('password', { required: 'Min password length 6', minLength: 6 })}
              />
              <a
                className="text-danger-light font-extralight text-lg ml-auto block text-right"
                href="forgot-password"
              >
                Forgot password?
              </a>
            </FormGroup>
            <FormGroup>
              <Button
                className="flex relative"
                type="button"
                variant="fill"
                buttonType="secondary"
                onClick={handleSubmit(onSubmit)}
                rounded
              >
                login
                <LoadingIcon isLoading={loading} />
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
