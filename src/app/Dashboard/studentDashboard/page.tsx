"use client";

import React, { useEffect, useState } from "react";
import {
  FaUserGraduate,
  FaCalendarCheck,
  FaPoll,
  FaSpinner,
  FaClock,
  FaIdCard,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";
import Link from "next/link";

export default function StudentOverviewPage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const isBn = language === "bn";

  const [student, setStudent] = useState<any | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<any | null>(null);
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

        // Fetch attendance summary
        if (profile?.id) {
          const attRes = await axiosInstance
            .get(`/attendances/summary/${profile.id}`)
            .catch(() => null);
          setAttendanceSummary(attRes?.data?.data || attRes?.data || null);
        }
      } catch (err) {
        console.error("Failed to fetch student data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <FaSpinner className="animate-spin text-primary text-lg" />
        <span>{isBn ? "প্রোফাইল তথ্য লোড হচ্ছে..." : "Loading student profile..."}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "শিক্ষার্থী পোর্টাল" : "Student Portal"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2">
            {isBn
              ? `স্বাগতম, ${student?.firstName || ""} ${student?.lastName || ""}!`
              : `Welcome, ${student?.firstName || ""} ${student?.lastName || ""}!`}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "তোমার অ্যাকাডেমিক প্রোফাইল, উপস্থিতি, ফলাফল এবং রুটিন একনজরে দেখো।"
              : "View your academic profile, attendance, exam results, and schedule."}
          </p>
        </div>
      </div>

      {/* Main Student Profile Info Card */}
      {student && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-border/50 pb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl ring-1 ring-primary/20 shrink-0">
                  {student.photoUrl ? (
                    <img
                      src={student.photoUrl}
                      alt={student.firstName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    student.firstName?.charAt(0) || "S"
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {student.firstName} {student.lastName}
                  </h2>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isBn ? "স্টুডেন্ট কোড:" : "Student Code:"}{" "}
                    <span className="font-mono text-foreground font-semibold">
                      {student.studentCode || student.studentIdNo}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-muted px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-foreground border border-border/60">
                      {isBn ? "শ্রেণি:" : "Class:"} {student.class?.name || "N/A"}
                    </span>
                    <span className="bg-muted px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-foreground border border-border/60">
                      {isBn ? "সেকশন:" : "Section:"} {student.section?.name || "N/A"}
                    </span>
                    <span className="bg-muted px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-foreground border border-border/60">
                      {isBn ? "রোল:" : "Roll:"} {student.rollNo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground block font-medium">
                    {isBn ? "রক্তের গ্রুপ" : "Blood Group"}
                  </span>
                  <strong className="text-foreground">{student.bloodGroup || "N/A"}</strong>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground block font-medium">
                    {isBn ? "ধর্ম" : "Religion"}
                  </span>
                  <strong className="text-foreground">{student.religion || "N/A"}</strong>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground block font-medium">
                    {isBn ? "মোবাইল নম্বর" : "Contact Phone"}
                  </span>
                  <strong className="text-foreground font-mono">{student.phone || "N/A"}</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Stats Quick View */}
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-3">
                <FaCalendarCheck className="text-primary" />
                <span>{isBn ? "উপস্থিতির হার" : "Attendance Rate"}</span>
              </h3>

              <div className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <span className="text-3xl font-extrabold text-primary font-mono">
                  {attendanceSummary?.percentage ?? 100}%
                </span>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {isBn ? "মোট উপস্থিতির পার্সেন্টেজ" : "Overall Attendance"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground block">
                    {isBn ? "উপস্থিত" : "Present"}
                  </span>
                  <strong className="text-primary font-mono">
                    {attendanceSummary?.presentDays ?? attendanceSummary?.totalPresence ?? 0}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground block">
                    {isBn ? "অনুপস্থিত" : "Absent"}
                  </span>
                  <strong className="text-destructive font-mono">
                    {attendanceSummary?.absentDays ?? attendanceSummary?.totalAbsent ?? 0}
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Quick Access Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/Dashboard/student/routine">
          <Card className="border-border/60 hover:border-primary/50 shadow-sm transition-all rounded-2xl bg-card p-5 flex items-center gap-4 group h-full">
            <div className="p-3 rounded-xl bg-primary/10 text-primary text-xl group-hover:scale-105 transition-transform shrink-0">
              <FaClock />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {isBn ? "ক্লাস রুটিন" : "Class Routine"}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {isBn ? "দৈনিক ক্লাসের সময়সূচী" : "Daily class schedule"}
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/Dashboard/student/results">
          <Card className="border-border/60 hover:border-primary/50 shadow-sm transition-all rounded-2xl bg-card p-5 flex items-center gap-4 group h-full">
            <div className="p-3 rounded-xl bg-primary/10 text-primary text-xl group-hover:scale-105 transition-transform shrink-0">
              <FaPoll />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {isBn ? "আমার ফলাফল" : "My Marksheet"}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {isBn ? "পরীক্ষার নম্বর ও গ্রেড" : "Check grades and marks"}
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/Dashboard/student/id-card">
          <Card className="border-border/60 hover:border-primary/50 shadow-sm transition-all rounded-2xl bg-card p-5 flex items-center gap-4 group h-full">
            <div className="p-3 rounded-xl bg-primary/10 text-primary text-xl group-hover:scale-105 transition-transform shrink-0">
              <FaIdCard />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {isBn ? "ডিজিটাল আইডি কার্ড" : "Digital ID Card"}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {isBn ? "ডিজিটাল স্টুডেন্ট আইডি" : "View & print ID card"}
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}