'use client'
import React from "react";
import { SessionProvider, SessionContext } from "next-auth/react"
import { AuthProvider } from "@/lib/context/AuthContext";
interface AuthWrapperProps {
  children: React.ReactNode;
}


const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {

  return (
      <SessionProvider >
        <AuthProvider>
          <div>
            {children}
          </div>
        </AuthProvider>
      </SessionProvider>
  );
};

export default AuthWrapper;