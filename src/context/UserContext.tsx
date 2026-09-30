"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

export interface User {
  id?: string;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  studentId?: string; 
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = Cookies.get("accessToken");
    const role = Cookies.get("userRole");
    const studentId = Cookies.get("studentId"); // Fetch studentId from Cookie

    if (token && role) {
      setUser((prev) => prev || { role, studentId });
    }
  }, []);

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("userRole");
    Cookies.remove("studentId");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    return {
      user: null,
      setUser: () => {},
      logout: () => {},
    };
  }
  return context;
};