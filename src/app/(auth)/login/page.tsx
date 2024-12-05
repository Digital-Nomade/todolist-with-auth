'use client'
import {
  Button,
  FormGroup,
  Input
} from "@/components/atomic";
import { LandingLink } from "@/components/atomic/landing-link/LandingLink";
import { LoadingIcon } from "@/components/icons";
import { useLoginUserMutation } from "@/lib/features/auth/authApi";
import { authenticateUser } from "@/lib/features/auth/authSlice";
import { useAppDispatch } from "@/lib/hooks";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
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
  const [login, { isLoading }] = useLoginUserMutation()
  const dispatch = useAppDispatch()

  async function onSubmit(data: Inputs) {
    try {
      const res = await login(data)
      if (res.data?.token) {
        dispatch(authenticateUser({ accessToken: res.data.token, isAuthenticated: true }))
      }

    } catch(error: unknown) {
      console.log(error)
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="m-auto overflow-hidden"
        key={'login'}
        
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
          type: 'spring',
          duration: .7
        }}
      >
        <main className="w-full p-8 flex column h-[100vh] items-center overflow-hidden" >
          <form className="flex flex-col p-8 border border-danger-light max-h-[684px] mx-auto min-w-[450px]">
            <LandingLink />
            <h2 className="font-bold text-4xl text-danger-light mb-16">Login</h2>
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
