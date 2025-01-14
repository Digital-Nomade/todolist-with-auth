import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {},
  callbacks: {
    authorized({ auth, request: { nextUrl }}) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnHome = nextUrl.pathname.startsWith('/home')

      if (isOnDashboard || isOnHome) {
        if (isLoggedIn) return true
        else return false
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    }
  },
  providers: []
} satisfies NextAuthConfig
