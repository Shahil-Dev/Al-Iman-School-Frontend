"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserFriends,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaIdCard,
  FaBuilding,
  FaBook,
  FaVenusMars,
  FaTint,
  FaCamera,
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
  FaSun,
  FaMoon,
  FaGlobe,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "@/src/lib/axiosInstance";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@base-ui/react";
import { Button } from "@/src/components/ui/button";

type LangType = "EN" | "BN" | "AR";

export default function TeacherRegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    designation: "Assistant Teacher",
    department: "",
    qualification: "",
    gender: "MALE",
    bloodGroup: "A+",
    nidOrPassport: "",
    photoUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<LangType>("EN");

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const cycleLanguage = () => {
    const langs: LangType[] = ["EN", "BN", "AR"];
    const nextIdx = (langs.indexOf(lang) + 1) % langs.length;
    setLang(langs[nextIdx]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        designation: formData.designation,
        department: formData.department,
        qualification: formData.qualification,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        nidOrPassport: formData.nidOrPassport,
        photoUrl: formData.photoUrl,
      };

      await axiosInstance.post("/teachers/register", payload);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed! Please check your input."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-300">
      {/* Background Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Arabic Typography Watermark Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] dark:opacity-[0.04] pointer-events-none select-none overflow-hidden">
        <span className="text-[16vw] font-serif tracking-widest text-[#c9a961] whitespace-nowrap dir-rtl">
          العلم نور والجهل ظلام
        </span>
      </div>

      {/* Header Controls: Theme & Language Toggle */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
        <button
          onClick={cycleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card/80 text-xs font-medium text-foreground shadow-sm hover:border-[#c9a961] transition-all"
        >
          <FaGlobe className="text-[#c9a961]" />
          <span>{lang}</span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-border bg-card/80 text-foreground shadow-sm hover:border-[#c9a961] transition-all"
        >
          {isDarkMode ? (
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
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="p-3.5 bg-gradient-to-br from-[#c9a961] to-[#9a7b38] text-white rounded-2xl shadow-xl">
              <FaGraduationCap className="text-3xl" />
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Al-Iman School Teacher Application
          </h1>
          <p className="text-xs text-muted-foreground tracking-wide uppercase font-semibold">
            طلب انضمام المعلمين
          </p>
        </div>

        {/* Registration Type Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 p-1.5 bg-muted rounded-2xl max-w-sm mx-auto border border-border">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold bg-card text-[#c9a961] shadow-sm border border-[#c9a961]/20"
          >
            <FaChalkboardTeacher className="text-sm" />
            <span>Teacher Form</span>
          </button>
          <Link
            href="/parent-register"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <FaUserFriends className="text-sm" />
            <span>Parent Form</span>
          </Link>
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
                  Registration Submitted Successfully!
                </h2>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Your application for teacher registration has been sent to the Admin Panel. Once reviewed and approved by the Super Admin, you will receive confirmation and be able to log in.
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

                {/* Section 1: Credentials */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a961] border-b border-border pb-1">
                    1. Account Credentials
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <Input
                          name="name"
                          required
                          placeholder="e.g. Md. Abdur Rahman"
                          value={formData.name}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                        />
                      </div>
                    </div>

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
                          placeholder="teacher@al-iman.com"
                          value={formData.email}
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

                {/* Section 2: Professional Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a961] border-b border-border pb-1">
                    2. Professional Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Designation *
                      </label>
                      <div className="relative">
                        <FaBuilding className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <Input
                          name="designation"
                          required
                          placeholder="Senior / Assistant Teacher"
                          value={formData.designation}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Department / Specialty
                      </label>
                      <div className="relative">
                        <FaBook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <Input
                          name="department"
                          placeholder="e.g. Arabic, Mathematics"
                          value={formData.department}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Qualification
                      </label>
                      <Input
                        name="qualification"
                        placeholder="e.g. M.A in Arabic, B.Sc"
                        value={formData.qualification}
                        onChange={handleChange}
                        className="px-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Personal & Verification Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a961] border-b border-border pb-1">
                    3. Personal Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Mobile Number *
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
                        Gender *
                      </label>
                      <div className="relative">
                        <FaVenusMars className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none cursor-pointer"
                        >
                          <option value="MALE">MALE</option>
                          <option value="FEMALE">FEMALE</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Blood Group
                      </label>
                      <div className="relative">
                        <FaTint className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none cursor-pointer"
                        >
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        NID or Passport Number
                      </label>
                      <div className="relative">
                        <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <Input
                          name="nidOrPassport"
                          placeholder="Enter NID or Passport No"
                          value={formData.nidOrPassport}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Profile Photo URL
                      </label>
                      <div className="relative">
                        <FaCamera className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
                        <Input
                          name="photoUrl"
                          placeholder="https://..."
                          value={formData.photoUrl}
                          onChange={handleChange}
                          className="pl-10 pr-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full focus:ring-2 focus:ring-[#c9a961] focus:outline-none"
                        />
                      </div>
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
                      Submitting Application...
                    </>
                  ) : (
                    "Submit Teacher Application"
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