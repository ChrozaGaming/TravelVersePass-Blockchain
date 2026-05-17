"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function AuthGuard({ children }: Readonly<{ children: ReactNode }>) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="container-page">
        <p className="text-slate-500">Memuat session...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="container-page">
        <p className="text-slate-500">Mengarahkan ke login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
