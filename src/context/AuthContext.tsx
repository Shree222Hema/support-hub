"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

interface User {
  id: string;
  username: string; // Mapped from NextAuth `name` or `email`
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string) => Promise<boolean>; // Deprecated conceptually, but kept for interface compatibility if needed
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id as string,
        username: session.user.name || session.user.email || "User",
        role: (session.user as any).role || "USER",
      });
    } else {
      setUser(null);
    }
  }, [session]);

  // We keep this signature for compatibility, but the actual login happens 
  // via NextAuth `signIn` in the login page now.
  const login = async (username: string): Promise<boolean> => {
    console.warn("login() called on AuthContext. Use NextAuth signIn() instead.");
    return false;
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
