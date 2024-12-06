'use client'

import { Button } from "@/components/atomic/button/Button";
import { FormGroup } from "@/components/atomic/form-group/FormGroup";
import { Input } from "@/components/atomic/input/Input";
import { LandingLink } from "@/components/atomic/landing-link/LandingLink";
import { LoadingIcon } from "@/components/icons";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Inputs = {
  email: string
  password: string
  confirmPassword: string
}

interface Props {
  moveToNextStep: () => void
}

export function SignUpForm({ moveToNextStep }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
    }
  } = useForm<Inputs>()

  const [loading, setLoading] = useState(false)

  function onSubmit(data: Inputs) {
    setLoading(true)

    //TODO: Add api call, save email and password and store the user ID to save Profile Info
    console.log(data)

    setTimeout(() => { // simulates API call with delay
      setLoading(false)
      moveToNextStep()
    }, 2000)
  }

  return (
    <main key={'signup-form'} className="w-full p-8 flex column h-[100vh] items-center overflow-hidden" >
      <form className="flex flex-col p-8 border border-danger-light max-h-[684px] mx-auto min-w-[450px]">
        <LandingLink />
        <h2 className="font-bold text-4xl text-danger-light mb-16">Sign Up</h2>
        <FormGroup>
          <Input
            errorMessage={errors['email']?.message}
            label="email"
            htmlFor="email"
            type="email"
            {...register('email',
              {
                required: 'You must add a valid email',
                validate: (val: string) => {
                  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
                  if (!regex.test(val)) {
                    return 'You must provide a valid email'
                  }
                }
              }
            )}
          />
        </FormGroup>
        <FormGroup>
          <Input
            errorMessage={errors['password']?.message}
            label="password"
            htmlFor="password"
            type="password"
            {...register('password', { required: 'Password min length 6', minLength: 6 })}
          />
        </FormGroup>
        <FormGroup>
          <Input
            errorMessage={errors['confirmPassword']?.message}
            label="retype
            password"
            htmlFor="confirm-password"
            type="password"
            {...register('confirmPassword', 
              { 
                required: 'Passwords must match',
                validate: (val: string) => {
                  if (watch('password') !== val) {
                    return 'Passwords must match '
                  }
                }
              }
            )}
          />
        </FormGroup>
        <FormGroup>
          <Button
            className="flex relative"
            type="button"
            variant="fill"
            buttonType="secondary"
            rounded
            onClick={handleSubmit(onSubmit)}
          >
            next
            <LoadingIcon isLoading={loading} />
          </Button>
        </FormGroup>
        <FormGroup>
          <p className="text-danger-light font-extralight mt-auto text-lg mx-auto w-full block text-center">
              Already have an account? <Link href="login"><strong>Login</strong></Link>
          </p>
        </FormGroup>
      </form>
    </main>
  )
}
