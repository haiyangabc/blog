"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
// 从next-auth/core/types导入Session类型，而不是从react导入
import { useSession, signOut } from "next-auth/react";
// import type { Session } from "next-auth/core/types";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";

// 认证上下文类型
interface AuthContextType {
  session: Session | null;
  user: Session["user"] | undefined;
  isAuthenticated: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  requireAuth: () => boolean;
  protectRoute: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" || status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const isAuthenticated = status === "authenticated";

  const handleSignOut = async () => {
    await signOut({
      redirect: false,
    });
    router.push("/login");
    router.refresh();
  };

  const requireAuth = () => {
    if (!loading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      return false;
    }
    return true;
  };

  const protectRoute = () => {
    return requireAuth();
  };

  const value: AuthContextType = {
    session,
    user: session?.user,
    isAuthenticated,
    loading,
    signOut: handleSignOut,
    requireAuth,
    protectRoute
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth 必须在 AuthProvider 内部使用");
  }
  return context;
}
    