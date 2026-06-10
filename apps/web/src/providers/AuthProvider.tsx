"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { env } from "@/config/env";

//* Types
/** User type is used for those specifiers who uses auth info from this auth Context. */
export type User = {
  id: string;
  profilePicture: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
};

type AuthContextType = {
  userInfo: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
};

//* Provider Logic
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userInfo, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(env.NEXT_PUBLIC_USER_API_URI, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data.user ?? null);
        }
      } catch (err) {
        console.error("Auth fetch error:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Always try to fetch the user — don't check cookies
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ userInfo, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
