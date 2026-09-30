"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  FaIdCard,
  FaSpinner,
  FaPrint,
  FaUserGraduate,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaQrcode,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";

export default function StudentIdCardPage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const isBn = language === "bn";

  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      setLoading(true);
      try {
        const studentId = user?.studentId || user?.id;
        if (!studentId) return;

        const res = await axiosInstance.get(`/students/${studentId}`);
        const profile = res.data?.data || res.data;
        setStudent(profile);
      } catch (err) {
        console.error("Failed to load student ID card data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header (Hidden on Print) */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "ডিজিটাল আইডি কার্ড" : "Digital ID Card"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaIdCard className="text-primary text-lg" />
            <span>{isBn ? "স্টুডেন্ট আইডি কার্ড" : "Student Identity Card"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "তোমার অফিসিয়াল ডিজিটাল স্টুডেন্ট আইডি কার্ড দেখো ও পিন্ট করো।"
              : "View and print your official digital student identification card."}
          </p>
        </div>

        {student && (
          <button
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0"
          >
            <FaPrint />
            <span>{isBn ? "আইডি কার্ড প্রিন্ট করুন" : "Print ID Card"}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-primary text-lg" />
          <span>{isBn ? "আইডি কার্ড লোড হচ্ছে..." : "Loading ID Card..."}</span>
        </div>
      ) : !student ? (
        <Card className="p-8 text-center text-xs text-muted-foreground rounded-2xl border border-border">
          {isBn ? "প্রোফাইল তথ্য পাওয়া যায়নি।" : "Student profile not found."}
        </Card>
      ) : (
        /* ID Card Display Container */
        <div className="flex justify-center items-center py-6">
          <div className="w-[340px] sm:w-[360px] bg-card border-2 border-primary/20 rounded-3xl shadow-xl overflow-hidden relative font-sans print:shadow-none print:border">
            
            {/* Top Brand Banner */}
            <div className="bg-primary text-primary-foreground p-5 text-center relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full blur-sm" />
              <div className="relative z-10 space-y-1">
                <h2 className="text-lg font-extrabold tracking-wide uppercase">
                  AL-IMAN SCHOOL
                </h2>
                <p className="text-[10px] opacity-90 tracking-wider uppercase font-semibold">
                  Excellence in Education
                </p>
              </div>
            </div>

            {/* Profile Photo & Basic Details */}
            <div className="p-6 text-center space-y-4">
              <div className="relative mx-auto w-24 h-24 rounded-2xl bg-muted border-4 border-background shadow-md overflow-hidden flex items-center justify-center">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-primary">
                    {student.firstName?.charAt(0) || "S"}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-extrabold text-foreground tracking-tight">
                  {student.firstName} {student.lastName}
                </h3>
                <span className="inline-block bg-primary/10 text-primary font-mono font-bold text-[11px] px-3 py-0.5 rounded-full mt-1 border border-primary/20">
                  {student.studentCode || student.studentIdNo}
                </span>
              </div>

              {/* Grid Academic Attributes */}
              <div className="bg-muted/40 p-3.5 rounded-2xl border border-border/60 grid grid-cols-3 gap-2 text-center text-xs font-sans">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                    {isBn ? "শ্রেণি" : "Class"}
                  </span>
                  <strong className="text-foreground text-xs block truncate mt-0.5">
                    {student.class?.name || "N/A"}
                  </strong>
                </div>
                <div className="border-x border-border/50 px-1">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                    {isBn ? "সেকশন" : "Section"}
                  </span>
                  <strong className="text-foreground text-xs block truncate mt-0.5">
                    {student.section?.name || "N/A"}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">
                    {isBn ? "রোল" : "Roll"}
                  </span>
                  <strong className="text-foreground text-xs block font-mono mt-0.5">
                    {student.rollNo}
                  </strong>
                </div>
              </div>

              {/* Detailed Rows */}
              <div className="space-y-2 text-left text-[11px] pt-1">
                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">
                    {isBn ? "রক্তের গ্রুপ:" : "Blood Group:"}
                  </span>
                  <span className="font-bold text-destructive font-mono">
                    {student.bloodGroup || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">
                    {isBn ? "অভিভাবকের নাম:" : "Father's Name:"}
                  </span>
                  <span className="font-semibold text-foreground truncate max-w-[170px]">
                    {student.fatherName || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground font-medium">
                    {isBn ? "যোগাযোগ:" : "Phone:"}
                  </span>
                  <span className="font-semibold font-mono text-foreground">
                    {student.phone || "N/A"}
                  </span>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1 font-mono">
                  <FaQrcode className="text-lg text-foreground" />
                  <span>Verified ID</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold text-foreground">
                    Al-Iman ERP
                  </span>
                  <span className="text-[9px]">Authorized Student</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}