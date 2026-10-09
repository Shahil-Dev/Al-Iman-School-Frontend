"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Cookies from "js-cookie";

// Student Profile Type
export interface StudentProfile {
  id: string;
  studentCode: string;
  pin?: string;
  userId: string;
  studentIdNo?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  phone?: string;
  classId?: string;
  sectionId?: string;
  rollNo?: number;
  [key: string]: any;
}

// User Interface for All Roles
export interface User {
  id?: string;
  email?: string;
  role?: "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | string;
  isApproved?: boolean;
  isBlocked?: boolean;
  studentProfile?: StudentProfile; // For Student Role
  teacherProfile?: any;            // For Teacher Role
  parentProfile?: any;             // For Parent Role
  adminProfile?: any;              // For Admin Role
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user data from localStorage & Cookies on initial mount / refresh
  useEffect(() => {
    const token = Cookies.get("accessToken");
    const storedUser = localStorage.getItem("userInfo");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
      }
    }
  }, []);

  // Sync user state with localStorage whenever user state changes
  const handleSetUser = (newUser: User | null | ((prev: User | null) => User | null)) => {
    setUser((prevUser) => {
      const updatedUser = typeof newUser === "function" ? newUser(prevUser) : newUser;
      
      if (updatedUser) {
        localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      } else {
        localStorage.removeItem("userInfo");
      }
      return updatedUser;
    });
  };

  const logout = () => {
    // Clear all Auth Cookies
    Cookies.remove("accessToken");
    Cookies.remove("userRole");
    Cookies.remove("studentId");
    
    // Clear Local Storage
    localStorage.removeItem("userInfo");
    
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, logout }}>
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