"use client";

import React, { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";

export default function StudentAttendancePage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const isBn = language === "bn";

  const [student, setStudent] = useState<any | null>(null);
  const [attendanceData, setAttendanceData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const studentId = user?.studentId || user?.id;
        if (!studentId) return;

        // 1. Fetch Student Profile
        const res = await axiosInstance.get(`/students/${studentId}`);
        const profile = res.data?.data || res.data;
        setStudent(profile);

        // 2. Fetch Attendance Summary & Detailed Logs
        if (profile?.id) {
          const attRes = await axiosInstance.get(
            `/attendances/summary/${profile.id}`
          );
          setAttendanceData(attRes.data?.data || attRes.data || null);
        }
      } catch (err) {
        console.error("Failed to load attendance records", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user]);

  // Filter Attendance Logs based on Status
  const attendanceLogs: any[] =
    attendanceData?.logs || attendanceData?.attendances || [];
  const filteredLogs = attendanceLogs.filter((log) => {
    if (filterStatus === "PRESENT") return log.status === "PRESENT";
    if (filterStatus === "ABSENT") return log.status === "ABSENT";
    if (filterStatus === "LATE") return log.status === "LATE";
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "আমার উপস্থিতি" : "My Attendance"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaCalendarCheck className="text-primary text-lg" />
            <span>{isBn ? "উপস্থিতির খতিয়ান" : "Attendance Overview"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "তোমার দৈনিক উপস্থিতির হার ও রিপোর্ট বিস্তারিতভাবে নিচে প্রদান করা হলো।"
              : "Track your monthly and daily class attendance performance."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-primary text-lg" />
          <span>
            {isBn ? "উপস্থিতির তথ্য লোড হচ্ছে..." : "Loading attendance data..."}
          </span>
        </div>
      ) : (
        <>
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "উপস্থিতির হার" : "Attendance Rate"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-primary font-mono block">
                  {attendanceData?.percentage ?? 100}%
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "মোট উপস্থিত" : "Total Present"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono block">
                  {attendanceData?.presentDays ?? attendanceData?.totalPresence ?? 0}
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "মোট অনুপস্থিত" : "Total Absent"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-destructive font-mono block">
                  {attendanceData?.absentDays ?? attendanceData?.totalAbsent ?? 0}
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "দেরিতে উপস্থিতি" : "Late Arrival"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 font-mono block">
                  {attendanceData?.lateDays ?? attendanceData?.totalLate ?? 0}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Log Table Card */}
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/50 pb-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <FaCalendarCheck className="text-primary" />
                  <span>
                    {isBn ? "দৈনিক উপস্থিতির ইতিহাস" : "Daily Attendance History"}
                  </span>
                </h3>

                {/* Filter Buttons */}
                <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border text-[11px] font-semibold">
                  <button
                    onClick={() => setFilterStatus("ALL")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterStatus === "ALL"
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isBn ? "সব" : "All"}
                  </button>
                  <button
                    onClick={() => setFilterStatus("PRESENT")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterStatus === "PRESENT"
                        ? "bg-emerald-600 text-white font-bold shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isBn ? "উপস্থিত" : "Present"}
                  </button>
                  <button
                    onClick={() => setFilterStatus("ABSENT")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterStatus === "ABSENT"
                        ? "bg-destructive text-destructive-foreground font-bold shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isBn ? "অনুপস্থিত" : "Absent"}
                  </button>
                </div>
              </div>

              {/* Table Render */}
              {filteredLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {isBn
                    ? "কোনো উপস্থিতির তথ্য পাওয়া যায়নি।"
                    : "No attendance logs available."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3">{isBn ? "তারিখ" : "Date"}</th>
                        <th className="py-3 px-3">
                          {isBn ? "স্ট্যাটাস" : "Status"}
                        </th>
                        <th className="py-3 px-3">
                          {isBn ? "মন্তব্য / নোট" : "Note / Remark"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-sans">
                      {filteredLogs.map((log: any, idx: number) => {
                        const isPresent = log.status === "PRESENT";
                        const isLate = log.status === "LATE";
                        return (
                          <tr
                            key={log.id || idx}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3.5 px-3 font-mono font-medium text-foreground">
                              {new Date(log.date).toLocaleDateString(
                                isBn ? "bn-BD" : "en-US",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  isPresent
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : isLate
                                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                    : "bg-destructive/10 text-destructive border border-destructive/20"
                                }`}
                              >
                                {isPresent ? (
                                  <FaCheckCircle />
                                ) : isLate ? (
                                  <FaClock />
                                ) : (
                                  <FaTimesCircle />
                                )}
                                <span>
                                  {isPresent
                                    ? isBn
                                      ? "উপস্থিত"
                                      : "Present"
                                    : isLate
                                    ? isBn
                                      ? "দেরিতে উপস্থিতি"
                                      : "Late"
                                    : isBn
                                    ? "অনুপস্থিত"
                                    : "Absent"}
                                </span>
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-muted-foreground">
                              {log.remark ||
                                log.note ||
                                (isBn ? "স্বাভাবিক" : "Regular")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}