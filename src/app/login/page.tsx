"use client";

import React, { useState, useCallback, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  FaGraduationCap,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserFriends,
  FaLock,
  FaEnvelope,
  FaArrowLeft,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import axiosInstance from "@/src/lib/axiosInstance";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@base-ui/react";
import { Button } from "@/src/components/ui/button";

type RoleType = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

const roleConfig = {
  ADMIN: {
    icon: FaUserShield,
    label: "Admin",
    description: "Full system access",
  },
  TEACHER: {
    icon: FaChalkboardTeacher,
    label: "Teacher",
    description: "Academic management",
  },
  STUDENT: {
    icon: FaUserGraduate,
    label: "Student",
    description: "Learning portal",
  },
  PARENT: {
    icon: FaUserFriends,
    label: "Parent",
    description: "Guardian portal",
  },
} as const;

const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

const RoleButton = memo(
  ({
    role,
    isSelected,
    onSelect,
  }: {
    role: RoleType;
    isSelected: boolean;
    onSelect: (role: RoleType) => void;
  }) => {
    const config = roleConfig[role];
    const Icon = config.icon;
    const reduceMotion = useReducedMotion();

    return (
      <motion.button
        type="button"
        onClick={() => onSelect(role)}
        whileHover={reduceMotion ? {} : { scale: 1.02 }}
        whileTap={reduceMotion ? {} : { scale: 0.98 }}
        aria-pressed={isSelected}
        aria-label={`Select ${config.label} role preview`}
        className={`relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-xs font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a961] ${
          isSelected
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        {isSelected && (
          <motion.div
            layoutId="roleIndicator"
            transition={reduceMotion ? { duration: 0 } : springConfig}
            className="absolute -bottom-px left-2 right-2 h-[2px] rounded-full bg-[#c9a961]"
          />
        )}
        <Icon className="text-base mb-0.5" />
        <span className="truncate w-full text-center">{config.label}</span>
        {isSelected && (
          <span className="text-[9px] text-muted-foreground font-normal -mt-0.5 truncate max-w-full px-1">
            {config.description}
          </span>
        )}
      </motion.button>
    );
  }
);

RoleButton.displayName = "RoleButton";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>("ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const reduceMotion = useReducedMotion();

  const handleRoleSelect = useCallback((role: RoleType) => {
    setSelectedRole(role);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      const { accessToken, user } = res.data.data;

      const cookieExpiry = rememberMe ? 30 : 7;
      Cookies.set("accessToken", accessToken, { expires: cookieExpiry });
      Cookies.set("userRole", user.role, { expires: cookieExpiry });

      const rolePath = user.role.toLowerCase().replace(/_/g, "-");
      const redirectPath = `/dashboard/${rolePath}`;

      router.push(redirectPath);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
        className="max-w-md w-full space-y-6 relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group"
            aria-label="Back to homepage"
          >
            <motion.div
              whileHover={reduceMotion ? {} : { scale: 1.05 }}
              whileTap={reduceMotion ? {} : { scale: 0.95 }}
              className="p-3.5 bg-primary text-primary-foreground rounded-2xl shadow-lg transition-shadow"
            >
              <FaGraduationCap className="text-3xl" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Al-Iman School ERP
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Sign in to access your ERP Portal
            </p>
          </div>
        </div>

        <Card className="border-border shadow-xl rounded-2xl overflow-hidden bg-card/95 backdrop-blur-sm">
          <CardContent className="p-6 md:p-7 space-y-6">
            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-muted rounded-xl">
              {Object.entries(roleConfig).map(([role]) => (
                <RoleButton
                  key={role}
                  role={role as RoleType}
                  isSelected={selectedRole === role}
                  onSelect={handleRoleSelect}
                />
              ))}
            </div>

            {/* Error Display */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={
                    reduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }
                  }
                  animate={{ opacity: 1, height: "auto" }}
                  exit={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
                  }
                  transition={reduceMotion ? { duration: 0 } : springConfig}
                  className="overflow-hidden"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                    <span className="flex-1">{error}</span>
                    <button
                      onClick={() => setError("")}
                      className="shrink-0 hover:opacity-80 transition-opacity"
                      aria-label="Dismiss error"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-foreground mb-2"
                >
                  Email / ID / Phone
                </label>
                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm transition-colors group-focus-within:text-[#c9a961]" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="Email, Student ID, or Phone Number"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    className="pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent transition-all duration-200 w-full"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-foreground mb-2"
                >
                  Password
                </label>
                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm transition-colors group-focus-within:text-[#c9a961]" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent transition-all duration-200 w-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2.5 text-muted-foreground cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-input text-[#c9a961] focus:ring-[#c9a961] transition-colors cursor-pointer accent-[#c9a961]"
                  />
                  <span className="group-hover:text-foreground transition-colors">
                    Remember me for 30 days
                  </span>
                </label>
                <Link
                  href="#"
                  className="text-[#c9a961] font-semibold hover:opacity-80 transition-opacity hover:underline underline-offset-2"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:opacity-90 h-12 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Authenticating...
                  </>
                ) : (
                  "Login to Portal"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back Link */}
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            reduceMotion ? { duration: 0 } : { delay: 0.4, duration: 0.6 }
          }
          className="text-center"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors group"
          >
            <FaArrowLeft className="text-xs transition-transform group-hover:-translate-x-1" />
            Back to Public Website
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}