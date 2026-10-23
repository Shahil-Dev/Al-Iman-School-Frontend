"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import axiosInstance from "@/src/lib/axiosInstance";

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
  teacherProfile?: any; // For Teacher Role
  parentProfile?: any; // For Parent Role
  adminProfile?: any; // For Admin Role
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  profileLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const PROFILE_KEYS = [
  "studentProfile",
  "teacherProfile",
  "parentProfile",
  "adminProfile",
] as const;

// Base64 photos can be huge; keep them in memory only so localStorage never overflows
const sanitizeForStorage = (value: User): User => {
  const copy: any = { ...value };
  for (const key of PROFILE_KEYS) {
    const profile = copy[key];
    if (
      profile &&
      typeof profile.photoUrl === "string" &&
      profile.photoUrl.startsWith("data:")
    ) {
      copy[key] = { ...profile, photoUrl: undefined };
    }
  }
  return copy as User;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Sync user state with localStorage whenever user state changes
  const handleSetUser = (
    newUser: User | null | ((prev: User | null) => User | null),
  ) => {
    setUser((prevUser) => {
      const updatedUser =
        typeof newUser === "function" ? newUser(prevUser) : newUser;

      if (updatedUser) {
        try {
          localStorage.setItem(
            "userInfo",
            JSON.stringify(sanitizeForStorage(updatedUser)),
          );
        } catch (error) {
          console.error("Failed to persist user data:", error);
        }
      } else {
        localStorage.removeItem("userInfo");
      }
      return updatedUser;
    });
  };

  // Load user from localStorage first, then refresh the full profile (with photo) from the API
  useEffect(() => {
    let cancelled = false;
    const token = Cookies.get("accessToken");
    const storedUser = localStorage.getItem("userInfo");

    if (!token || token === "undefined" || token === "null") {
      setLoading(false);
      return;
    }

    let hasStoredUser = false;
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        hasStoredUser = true;
      } catch (error) {
        console.error("Failed to parse stored user data:", error);
      }
    }

    // When the user is already known, release the global loader right away
    if (hasStoredUser) setLoading(false);
    setProfileLoading(true);

    axiosInstance
      .get("/auth/me", { timeout: 8000 })
      .then((res) => {
        if (cancelled) return;
        const fresh = res.data?.data || res.data;
        if (fresh && typeof fresh === "object") {
          handleSetUser((prev) => ({ ...(prev || {}), ...fresh }));
        }
      })
      .catch(() => {
        // Keep the stored user if the refresh fails
      })
      .finally(() => {
        if (cancelled) return;
        setProfileLoading(false);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <UserContext.Provider
      value={{
        user,
        loading,
        profileLoading,
        setUser: handleSetUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      profileLoading: false,
      setUser: () => {},
      logout: () => {},
    };
  }
  return context;
};