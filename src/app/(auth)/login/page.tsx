"use client";

import React, { useState, useCallback, memo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  FaSun,
  FaMoon,
  FaGlobe,
  FaUserPlus,
  FaIdCard,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import axiosInstance from "@/src/lib/axiosInstance";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@base-ui/react";
import { Button } from "@/src/components/ui/button";
import { useUser } from "@/src/context/UserContext";
import { toast } from "sonner";

type RoleType = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
type LangType = "EN" | "BN" | "AR";

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
        <Icon className="text-base mb-0.5 text-[#c9a961]" />
        <span className="truncate w-full text-center">{config.label}</span>
        {isSelected && (
          <span className="text-[9px] text-muted-foreground font-normal -mt-0.5 truncate max-w-full px-1">
            {config.description}
          </span>
        )}
      </motion.button>
    );
  },
);

RoleButton.displayName = "RoleButton";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useUser();

  const [selectedRole, setSelectedRole] = useState<RoleType>("ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Password Visibility Toggle State
  const [studentCode, setStudentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<LangType>("EN");

  const reduceMotion = useReducedMotion();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const cycleLanguage = () => {
    const langs: LangType[] = ["EN", "BN", "AR"];
    const nextIdx = (langs.indexOf(lang) + 1) % langs.length;
    setLang(langs[nextIdx]);
  };

  const handleRoleSelect = useCallback((role: RoleType) => {
    setSelectedRole(role);
    setError("");
  }, []);

  const getFriendlyErrorMessage = (err: any) => {
    const status = err.response?.status;
    const serverMsg = err.response?.data?.message || "";

    if (selectedRole === "STUDENT") {
      if (status === 404 || status === 401 || serverMsg.toLowerCase().includes("not found")) {
        return "স্টুডেন্ট কোডটি সঠিক নয়। অনুগ্রহ করে আপনার আইডি কার্ডের কোডটি দিন।";
      }
    } else {
      if (status === 401 || status === 400 || serverMsg.toLowerCase().includes("invalid")) {
        return "ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ডটি সঠিক নয়।";
      }
      if (status === 404) {
        return "এই অ্যাকাউন্টটি খুঁজে পাওয়া যায়নি।";
      }
    }

    if (!err.response) {
      return "ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।";
    }

    return "লগইন করতে সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedRole === "STUDENT") {
      if (!studentCode.trim()) {
        const msg = "অনুগ্রহ করে আপনার স্টুডেন্ট কোড দিন";
        toast.error(msg);
        setError(msg);
        return;
      }
    } else {
      if (!email.trim() || !password) {
        const msg = "ইমেইল/ফোন নম্বর এবং পাসওয়ার্ড দুটিই পূরণ করুন";
        toast.error(msg);
        setError(msg);
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = selectedRole === "STUDENT" ? "/auth/student-login" : "/auth/login";
      
      const payload =
        selectedRole === "STUDENT"
          ? { studentCode }
          : { email, password, role: selectedRole };

      const res = await axiosInstance.post(endpoint, payload);

      const { accessToken, user } = res.data.data;

      const cookieExpiry = rememberMe ? 30 : 7;
      Cookies.set("accessToken", accessToken, { expires: cookieExpiry, path: "/" });
      Cookies.set("userRole", user.role, { expires: cookieExpiry, path: "/" });

      if (user?.studentProfile?.id) {
        Cookies.set("studentId", user.studentProfile.id, { expires: cookieExpiry, path: "/" });
      }

      setUser(user);

      toast.success("সফলভাবে লগইন হয়েছে! রিডাইরেক্ট করা হচ্ছে...");

      let targetRoute = "/Dashboard";
      if (user.role === "STUDENT") {
        targetRoute = "/Dashboard/studentDashboard";
      } else if (user.role === "PARENT") {
        targetRoute = "/Dashboard/parentDashboard";
      } else if (user.role === "TEACHER") {
        targetRoute = "/Dashboard/TeacherDashboard";
      } else if (user.role === "ACCOUNTS") {
        targetRoute = "/Dashboard/accounts";
      } else if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
        targetRoute = "/Dashboard/admin";
      }

      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl && callbackUrl !== "/Dashboard") {
        router.push(callbackUrl);
      } else {
        router.push(targetRoute);
      }
      router.refresh();
    } catch (err: any) {
      const friendlyMsg = getFriendlyErrorMessage(err);
      toast.error(friendlyMsg);
      setError(friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.04] pointer-events-none select-none overflow-hidden">
        <span className="text-[18vw] font-serif tracking-widest text-[#c9a961] whitespace-nowrap dir-rtl">
          الإيمان والإحسان
        </span>
      </div>

      <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
        <button
          onClick={cycleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card/80 text-xs font-medium text-foreground shadow-sm hover:border-[#c9a961] transition-all"
          title="Change Language"
        >
          <FaGlobe className="text-[#c9a961]" />
          <span>{lang}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-border bg-card/80 text-foreground shadow-sm hover:border-[#c9a961] transition-all"
          title="Toggle Theme"
        >
          {isDarkMode ? (
            <FaSun className="text-amber-400 text-sm" />
          ) : (
            <FaMoon className="text-slate-700 text-sm" />
          )}
        </button>
      </div>

      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
        className="max-w-md w-full space-y-6 relative z-10 my-8"
      >
        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-3 group"
            aria-label="Back to homepage"
          >
            <motion.div
              whileHover={reduceMotion ? {} : { scale: 1.05 }}
              whileTap={reduceMotion ? {} : { scale: 0.95 }}
              className="p-3.5 bg-gradient-to-br from-[#c9a961] to-[#9a7b38] text-white rounded-2xl shadow-xl transition-shadow"
            >
              <FaGraduationCap className="text-3xl" />
            </motion.div>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Al-Iman School ERP
            </h1>
            <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase font-semibold">
              مدرسة الإيمان الإسلامية
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sign in to access your ERP Portal
            </p>
          </div>
        </div>

        <Card className="border-border shadow-2xl rounded-2xl overflow-hidden bg-card/95 backdrop-blur-md">
          <CardContent className="p-6 md:p-7 space-y-6">
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

            <form onSubmit={handleLogin} className="space-y-4">
              {selectedRole === "STUDENT" ? (
                <div>
                  <label
                    htmlFor="studentCode"
                    className="block text-xs font-semibold text-foreground mb-1.5"
                  >
                    Student Code or Student ID
                  </label>
                  <div className="relative group">
                    <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm transition-colors group-focus-within:text-[#c9a961]" />
                    <Input
                      id="studentCode"
                      type="text"
                      placeholder="e.g. STU-26-7360"
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      autoComplete="off"
                      className="pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent transition-all duration-200 w-full"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold text-foreground mb-1.5"
                    >
                      Email or Mobile
                    </label>
                    <div className="relative group">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm transition-colors group-focus-within:text-[#c9a961]" />
                      <Input
                        id="email"
                        type="text"
                        placeholder="Enter Email or Mobile"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        className="pl-11 pr-4 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent transition-all duration-200 w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-foreground mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative group">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm transition-colors group-focus-within:text-[#c9a961]" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="pl-11 pr-11 py-3 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent transition-all duration-200 w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-input text-[#c9a961] focus:ring-[#c9a961] transition-colors cursor-pointer accent-[#c9a961]"
                  />
                  <span className="group-hover:text-foreground transition-colors">
                    Remember me
                  </span>
                </label>
                {selectedRole !== "STUDENT" && (
                  <Link
                    href="#"
                    className="text-[#c9a961] font-semibold hover:opacity-80 transition-opacity hover:underline underline-offset-2"
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#c9a961] to-[#a88a44] text-white hover:opacity-95 h-11 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

            <AnimatePresence mode="wait">
              {(selectedRole === "TEACHER" || selectedRole === "PARENT") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="pt-3 border-t border-border text-center"
                >
                  <p className="text-xs text-muted-foreground mb-2">
                    Don't have an account yet?
                  </p>
                  <Link
                    href={
                      selectedRole === "TEACHER"
                        ? "/teacher-register"
                        : "/parent-register"
                    }
                    className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#c9a961] hover:underline hover:opacity-80 transition-all bg-[#c9a961]/10 px-4 py-2 rounded-xl w-full border border-[#c9a961]/20"
                  >
                    <FaUserPlus className="text-xs" />
                    <span>
                      {selectedRole === "TEACHER"
                        ? "Apply for Teacher Registration →"
                        : "Register as a Parent →"}
                    </span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground gap-2">
          <FaSpinner className="animate-spin text-[#c9a961] text-base" />
          <span>Loading Login Page...</span>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}