'use client'
import { LayoutHeader } from "@/components/organism/layout-header/LayoutHeader";
import { usePathname } from "next/navigation";

export default function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {

  const path = usePathname()

  return (
    <html lang="en" className="h-[100vh]">
      <body className="bg-gradient-to-br from-primary-light to-primary-dark h-[100%] w-full">
        <LayoutHeader path={path} />
        {children}
      </body>
    </html>
  )
}
