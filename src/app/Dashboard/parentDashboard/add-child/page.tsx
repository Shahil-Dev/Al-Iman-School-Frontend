"use client";

import React, { useState } from "react";
import {
  FaUserPlus,
  FaIdCard,
  FaKey,
  FaSpinner,
  FaArrowLeft,
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
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentCode.trim() || !pin.trim()) {
      toast.error(
        isBn
          ? "অনুরোধ করে স্টুডেন্ট আইডি ও সিকিউরিটি পিন প্রদান করুন।"
          : "Please enter both Student ID and PIN."
      );
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.patch("/parents/link-student", {
        studentCode,
        pin,
      });

      toast.success(
        isBn
          ? "সন্তান সফলভাবে আপনার প্রোফাইলে যুক্ত হয়েছে!"
          : "Child linked successfully to your profile!"
      );

      setStudentCode("");
      setPin("");

      setTimeout(() => {
        router.push("/Dashboard/parent");
      }, 1000);
    } catch (err: any) {
      console.error("Failed to link student", err);
      toast.error(
        err.response?.data?.message ||
          (isBn
            ? "সন্তান যুক্ত করতে ব্যর্থ হয়েছে। আইডি বা পিন পরীক্ষা করুন।"
            : "Failed to link student. Please check Code/PIN.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <Link
          href="/Dashboard/parent"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <FaArrowLeft />
          <span>{isBn ? "ড্যাশবোর্ডে ফিরে যান" : "Back to Overview"}</span>
        </Link>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
          {isBn ? "সন্তান সংযোজন" : "Link Student"}
        </span>
        <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
          <FaUserPlus className="text-primary text-lg" />
          <span>{isBn ? "নতুন সন্তান যুক্ত করুন" : "Add Your Child"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "স্কুল অফিস থেকে প্রাপ্ত স্টুডেন্ট আইডি/কোড এবং পিন (PIN) প্রদান করুন।"
            : "Enter Student Code/ID and Security PIN provided by school admin."}
        </p>
      </div>

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
                  placeholder={isBn ? "যেমন: STU-26-0001" : "e.g. STU-26-0001"}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-foreground uppercase tracking-wider text-[11px]">
                {isBn ? "সিকিউরিটি পিন (PIN) *" : "Security PIN *"}
              </label>
              <div className="relative">
                <FaKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={isBn ? "যেমন: 123456" : "e.g. 123456"}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <FaSpinner className="animate-spin text-sm" />
              ) : (
                <FaUserPlus />
              )}
              <span>{isBn ? "সন্তান কানেক্ট করুন" : "Verify & Link Child"}</span>
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}