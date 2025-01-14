import { fetcher } from "@/config/axios"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from 'zod'
import { authConfig } from "./auth.config"

async function getUser(email: string, password: string): Promise<any | undefined> {
  try {
    const user = await fetcher.post(
      '/auth/user',
      {
        email,
        password,
      }
    )
    return user
  } catch(error) {
    throw error
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUser(email, password)

          if (!user) return null

          return user
        }

        return null
      }
    })
  ]
})