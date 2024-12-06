'use client'

import { Button, FormGroup, Input } from "@/components/atomic";
import { LoadingIcon } from "@/components/icons";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
  navigate: () => void
}

type Inputs = {
  name: string
  lastName: string
  username: string
  birthdate: Date
}

export function SignUpProfileForm({ navigate }: Props) {
  const {
    register,
    handleSubmit,
    formState: {
      errors,
    }
  } = useForm<Inputs>()

  const [loading, setLoading] = useState(false)

  function onSubmit(data: unknown) {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      navigate()
    }, 2000)
  }
  return (
    <main className="h-[100vh] w-full p-8 flex column items-center overflow-hidden">
      <form className="flex flex-col p-8 border border-danger-light h-full max-h-[684px] mx-auto min-w-[450px]">
        <h1 className="font-bold text-4xl text-danger-light mb-16">Your info</h1>
        <FormGroup>
          <Input
          errorMessage={errors['name']?.message}
          label="name"
          htmlFor="name"
          type="text"
          {...register('name', { required: 'You must provide a name', minLength: 3 })}
        />
        </FormGroup>
        <FormGroup>
          <Input
            errorMessage={errors['lastName']?.message}
            label="last name"
            htmlFor="lastName"
            type="text"
            {...register('lastName', { required: 'You must provide a last name.' })}
          />
        </FormGroup>
        <FormGroup>
          <Input
            label="username"
            htmlFor="username"
            type="text"
            {...register('username', { required: 'You must provide a unique user name' })}
          />
        </FormGroup>
        <FormGroup>
          <Input
            label="birthdate"
            htmlFor="confirm-password"
            type="date"
            {...register('birthdate')}
          />
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
            create account
            <LoadingIcon isLoading={loading} />
          </Button>
        </FormGroup>
        <FormGroup>
          <p className="text-danger-light font-extralight mt-auto text-lg mx-auto text-center">
              Already have an account? <Link href="login"><strong>Login</strong></Link>
          </p>
        </FormGroup>
      </form>
    </main>
  )
}
