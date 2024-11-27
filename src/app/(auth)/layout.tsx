import { MotionConfig } from 'framer-motion';
export default function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-[100vh]">
      <body className='bg-gradient-to-br from-primary-light to-primary-dark h-[100%] w-full p-8 flex'>
        <MotionConfig transition={{ ease: 'easeInOut'}}>
          {children}
        </MotionConfig>
      </body>
    </html>
  )
}
