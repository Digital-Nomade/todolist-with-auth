import StoreProvider from '@/lib/StoreProvider';
import { NextUIProvider } from '@nextui-org/react';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-secondary to-primary-dark">
        <NextUIProvider className="flex h-full">
          <StoreProvider>
            {children}
          </StoreProvider>
        </NextUIProvider>
      </body>
    </html>
  );
}
