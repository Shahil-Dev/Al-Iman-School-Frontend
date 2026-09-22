"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserFriends,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaBriefcase,
  FaUserTie,
  FaUserCircle,
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
  FaSun,
  FaMoon,
  FaGlobe,
} from "react-icons/fa";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@base-ui/react";
import { Button } from "@/src/components/ui/button";
import { ParentService } from "@/src/Services/parentService";

type LangType = "EN" | "BN";

export default function ParentRegisterPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    fatherName: "",
    motherName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    occupation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lang, setLang] = useState<LangType>("EN");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const cycleLanguage = () => {
    const langs: LangType[] = ["EN", "BN"];
    const nextIdx = (langs.indexOf(lang) + 1) % langs.length;
    setLang(langs[nextIdx]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        occupation: formData.occupation,
      };

      await ParentService.registerParent(payload);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed! Please verify backend endpoint /parents/register"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.04] pointer-events-none select-none overflow-hidden">
        <span className="text-[16vw] font-serif tracking-widest text-[#c9a961] whitespace-nowrap dir-rtl">
          العلم نور والجهل ظلام
        </span>
      </div>

      {/* Header Controls */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
        <button
          onClick={cycleLanguage}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card/80 text-xs font-medium text-foreground shadow-sm hover:border-[#c9a961] transition-all"
        >
          <FaGlobe className="text-[#c9a961]" />
          <span>{lang}</span>
        </button>

        <button
          onClick={toggleTheme}
          type="button"
          className="p-2.5 rounded-xl border border-border bg-card/80 text-foreground shadow-sm hover:border-[#c9a961] transition-all"
        >
          {theme === "dark" ? (
            <FaSun className="text-amber-400 text-sm" />
          ) : (
            <FaMoon className="text-slate-700 text-sm" />
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-6 relative z-10 my-10"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="p-3.5 bg-gradient-to-br from-[#c9a961] to-[#9a7b38] text-white rounded-2xl shadow-xl">
              <FaGraduationCap className="text-3xl" />
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Al-Iman School Parent Registration
          </h1>
          <p className="text-xs text-muted-foreground tracking-wide uppercase font-semibold">
            تسجيل اولياء الامور
          </p>
        </div>

        {/* Toggle Switcher */}
        <div className="flex items-center justify-center gap-2 p-1.5 bg-muted rounded-2xl max-w-sm mx-auto border border-border">
          <button
            type="button"
            onClick={() => router.push("/teacher-register")}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <FaChalkboardTeacher className="text-sm" />
            <span>Teacher Form</span>
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-card text-[#c9a961] shadow-sm border border-[#c9a961]/20 cursor-default"
          >
            <FaUserFriends className="text-sm" />
            <span>Parent Form</span>
          </button>
        </div>

        <Card className="border-border shadow-2xl rounded-2xl overflow-hidden bg-card/95 backdrop-blur-md">
          <CardContent className="p-6 md:p-8">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                  <FaCheckCircle />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Parent Account Created Successfully!
                </h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Your parent account has been registered. Once approved by the administration, you can log in to view your child's academic updates.
                </p>
                <div className="pt-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#c9a961] text-white text-xs font-bold hover:opacity-90 transition-all shadow-md"
                  >
                    Back to Login Page
                  </Link>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                    {error}
                  </div>
                )}

                {/* Section 1 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a961] border-b border-border pb-1">
                    1. Account Credentials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <Input
                          name="email"
                          type="email"
                          required
                          placeholder="parent@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Mobile Phone Number *
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <Input
                          name="phone"
                          required
                          placeholder="01700000000"
                          value={formData.phone}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <Input
                          name="password"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <Input
                          name="confirmPassword"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a961] border-b border-border pb-1">
                    2. Parent Profile Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Father's Name *
                      </label>
                      <div className="relative">
                        <FaUserTie className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <Input
                          name="fatherName"
                          required
                          placeholder="e.g. Md. Rafiqul Islam"
                          value={formData.fatherName}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Mother's Name *
                      </label>
                      <div className="relative">
                        <FaUserCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <Input
                          name="motherName"
                          required
                          placeholder="e.g. Sultana Begum"
                          value={formData.motherName}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Occupation (Optional)
                    </label>
                    <div className="relative">
                      <FaBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                      <Input
                        name="occupation"
                        placeholder="e.g. Businessman, Government Official, Doctor"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#c9a961] to-[#a88a44] text-white hover:opacity-95 h-11 rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      Registering Parent Account...
                    </>
                  ) : (
                    "Register Parent Account"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <FaArrowLeft className="text-xs" />
            Already registered? Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}