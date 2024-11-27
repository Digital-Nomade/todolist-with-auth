import StoreProvider from '@/lib/StoreProvider';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-primary-light to-primary-dark">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
