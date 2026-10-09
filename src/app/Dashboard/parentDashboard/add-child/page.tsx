"use client";

import React, { useState } from "react";
import {
  FaUserPlus,
  FaIdCard,
  FaSpinner,
  FaArrowLeft,
  FaGraduationCap,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddChildPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const router = useRouter();

  const [studentCode, setStudentCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentCode.trim()) {
      toast.error(
        isBn
          ? "অনুগ্রহ করে স্টুডেন্ট আইডি বা কোড প্রদান করুন।"
          : "Please enter a valid Student Code or ID."
      );
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.patch("/parents/link-student", {
        studentCode: studentCode.trim(),
      });

      toast.success(
        isBn
          ? "সন্তান সফলভাবে আপনার প্রোফাইলে যুক্ত হয়েছে!"
          : "Child linked successfully to your profile!"
      );

      setStudentCode("");

      setTimeout(() => {
        router.push("/Dashboard/parentDashboard");
      }, 1000);
    } catch (err: any) {
      console.error("Failed to link student", err);
      toast.error(
        err.response?.data?.message ||
          (isBn
            ? "সন্তান যুক্ত করতে ব্যর্থ হয়েছে। স্টুডেন্ট কোডটি পরীক্ষা করুন।"
            : "Failed to link student. Please verify the Student Code.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 font-sans p-4 md:p-6">
      <div className="flex items-center justify-between">
        <Link
          href="/Dashboard/parentDashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <FaArrowLeft />
          <span>{isBn ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Dashboard"}</span>
        </Link>
      </div>

      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-md">
        <span className="bg-white/10 text-emerald-100 text-[10px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
          {isBn ? "সন্তান সংযোজন" : "Link Student"}
        </span>
        <h1 className="text-xl md:text-2xl font-bold mt-2 flex items-center gap-2">
          <FaGraduationCap className="text-emerald-300" />
          <span>{isBn ? "নতুন সন্তান যুক্ত করুন" : "Add Your Child"}</span>
        </h1>
        <p className="text-xs text-emerald-100/80 mt-1">
          {isBn
            ? "স্কুল বা একাডেমি থেকে প্রাপ্ত শিক্ষার্থীর স্টুডেন্ট আইডি/কোড প্রদান করে সহজেই সংযুক্ত করুন।"
            : "Enter the unique Student Code or ID provided by the school to link your child."}
        </p>
      </div>

      {/* Main Link Form Card */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6 md:p-8 space-y-5">
          <form onSubmit={handleLinkStudent} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-bold text-foreground uppercase tracking-wider text-[11px]">
                {isBn ? "স্টুডেন্ট আইডি / কোড *" : "Student Code / ID *"}
              </label>
              <div className="relative">
                <FaIdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder={
                    isBn ? "যেমন: STU-26-0001" : "e.g. STU-26-0001"
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <FaSpinner className="animate-spin text-sm" />
              ) : (
                <FaUserPlus />
              )}
              <span>
                {submitting
                  ? isBn
                    ? "সংযুক্ত হচ্ছে..."
                    : "Connecting..."
                  : isBn
                  ? "সন্তান যুক্ত করুন"
                  : "Link Child"}
              </span>
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}