'use client'

import { useAppSelector } from '@/lib/hooks';
import { MotionConfig } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isUserAuthenticated } = useAppSelector(state => state.auth)
  const router = useRouter()

  if (isUserAuthenticated) {
    return router.push('/home')
  }

  return (
    <html lang="en" className="h-[100vh]">
      <body className='bg-gradient-to-br from-secondary to-primary-dark h-[100%] w-full p-8 flex overflow-hidden'>
        <MotionConfig transition={{ ease: 'easeInOut'}}>
          {children}
        </MotionConfig>
      </body>
    </html>
  )
}
