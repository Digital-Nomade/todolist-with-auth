export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen max-h-screen overflow-hidden">
      {children}
    </div>
  );
}
