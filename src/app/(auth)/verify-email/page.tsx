"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/check-email");
  }, [router]);

  return <p className="m-auto text-danger-light">Redirecting…</p>;
}
