"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { login as doLogin, logout as doLogout, validateSession } from "@/lib/auth";

type AuthState = {
  wallet: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from JWT (kalau ada di localStorage)
    validateSession()
      .then((w) => setWallet(w))
      .finally(() => setIsLoading(false));
  }, []);

  async function login() {
    setIsLoading(true);
    try {
      const { wallet: w } = await doLogin();
      setWallet(w);
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    doLogout();
    setWallet(null);
  }

  const value: AuthState = {
    wallet,
    isLoggedIn: !!wallet,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
