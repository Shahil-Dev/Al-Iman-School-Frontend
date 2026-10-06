"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
import { motion } from "framer-motion";
import axiosInstance from "@/src/lib/axiosInstance";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@base-ui/react";
import { Button } from "@/src/components/ui/button";

type LangType = "EN" | "BN";

type ClassOption = {
  id: string;
  name: string;
};

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
    classTeacherOfId: "",
  });

  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lang, setLang] = useState<LangType>("EN");

  // Fetch Classes for Class Teacher Selection
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axiosInstance.get("/academic-management/classes");
        setClasses(res.data?.data || []);
      } catch (err) {
        console.error("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const cycleLanguage = () => {
    const langs: LangType[] = ["EN", "BN"];
    const nextIdx = (langs.indexOf(lang) + 1) % langs.length;
    setLang(langs[nextIdx]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Image Selection Handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
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
      let photoUrl = "";

      // Optional Image Upload logic (base64 or FormData upload)
      if (photoFile) {
        const reader = new FileReader();
        reader.readAsDataURL(photoFile);
        await new Promise((resolve) => {
          reader.onloadend = () => {
            photoUrl = reader.result as string;
            resolve(true);
          };
        });
      }

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
        classTeacherOfId: formData.classTeacherOfId || undefined,
        photoUrl: photoUrl || undefined,
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
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <div className="p-3.5 bg-gradient-to-br from-[#c9a961] to-[#9a7b38] text-white rounded-2xl shadow-xl">
              <FaGraduationCap className="text-3xl" />
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Al-Iman School Teacher Application
          </h1>
        </div>

        <Card className="border-border shadow-2xl rounded-2xl overflow-hidden bg-card/95 backdrop-blur-md">
          <CardContent className="p-6 md:p-8">
            {isSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                  <FaCheckCircle />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Registration Submitted Successfully!
                </h2>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#c9a961] text-white text-xs font-bold shadow-md"
                >
                  Back to Login Page
                </Link>
              </div>
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
                      <label className="block text-xs font-semibold mb-1">Full Name *</label>
                      <Input
                        name="name"
                        required
                        placeholder="e.g. Md. Abdur Rahman"
                        value={formData.name}
                        onChange={handleChange}
                        className="px-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Email Address *</label>
                      <Input
                        name="email"
                        type="email"
                        required
                        placeholder="teacher@al-iman.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="px-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Password *</label>
                      <Input
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="px-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Confirm Password *</label>
                      <Input
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="px-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Professional & Class Teacher Assignment */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a961] border-b border-border pb-1">
                    2. Professional & Class Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Designation *</label>
                      <Input
                        name="designation"
                        required
                        value={formData.designation}
                        onChange={handleChange}
                        className="px-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Department</label>
                      <Input
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="px-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Class Teacher Of (শ্রেণি শিক্ষক)</label>
                      <select
                        name="classTeacherOfId"
                        value={formData.classTeacherOfId}
                        onChange={handleChange}
                        className="px-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full cursor-pointer"
                      >
                        <option value="">None (সাধারণ শিক্ষক)</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Personal & Photo File Selection */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c9a961] border-b border-border pb-1">
                    3. Personal Details & Photo
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Mobile Number *</label>
                      <Input
                        name="phone"
                        required
                        placeholder="01700000000"
                        value={formData.phone}
                        onChange={handleChange}
                        className="px-3 py-2.5 rounded-xl border border-input bg-background text-xs w-full"
                      />
                    </div>

                    {/* File Browser for Image */}
                    <div>
                      <label className="block text-xs font-semibold mb-1">Profile Photo (ছবি নির্বাচন করুন)</label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/40 text-xs text-foreground cursor-pointer hover:border-[#c9a961] transition-all">
                          <FaCamera className="text-[#c9a961]" />
                          <span>ফোল্ডার থেকে ছবি আনুন</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        {photoPreview && (
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-border">
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#c9a961] to-[#a88a44] text-white h-11 rounded-xl text-xs font-bold shadow-md"
                >
                  {loading ? <FaSpinner className="animate-spin text-sm" /> : "Submit Teacher Application"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}