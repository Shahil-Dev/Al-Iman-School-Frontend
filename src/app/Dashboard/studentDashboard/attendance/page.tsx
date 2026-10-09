"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  FaCalendarCheck,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";
import { getStudentAttendanceSummary } from "@/src/Services/attendanceService";

interface AttendanceLog {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  remark?: string;
  note?: string;
}

interface AttendanceSummary {
  totalDays?: number;
  presentDays?: number;
  absentDays?: number;
  lateDays?: number;
  percentage?: number;
  logs?: AttendanceLog[];
  summary?: {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    percentage: number;
  };
  records?: AttendanceLog[];
}

export default function StudentAttendancePage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const isBn = language === "bn";

  const [attendanceData, setAttendanceData] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    let isMounted = true;
    const fetchAttendanceData = async () => {
      setLoading(true);
      try {
        const studentIdentifier = 
          user?.studentProfile?.id ||
          (user as any)?.studentProfileId || 
          user?.studentCode || 
          user?.studentId || 
          user?.id;

        if (!studentIdentifier) {
          console.warn("Student code/id not found in user context");
          setLoading(false);
          return;
        }

        const res = await getStudentAttendanceSummary(studentIdentifier);
        
        if (isMounted) {
          setAttendanceData(res?.data || res || null);
        }
      } catch (err) {
        console.error("Failed to load attendance records", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (user) {
      fetchAttendanceData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  const logsList = useMemo(() => {
    return attendanceData?.logs || attendanceData?.records || [];
  }, [attendanceData]);

  const filteredLogs = useMemo(() => {
    if (filterStatus === "ALL") return logsList;
    return logsList.filter((log) => log.status === filterStatus);
  }, [logsList, filterStatus]);

  const percentageVal = attendanceData?.percentage ?? attendanceData?.summary?.percentage ?? 100;
  const presentDaysVal = attendanceData?.presentDays ?? attendanceData?.summary?.presentCount ?? 0;
  const absentDaysVal = attendanceData?.absentDays ?? attendanceData?.summary?.absentCount ?? 0;
  const lateDaysVal = attendanceData?.lateDays ?? attendanceData?.summary?.lateCount ?? 0;

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "আমার উপস্থিতি" : "My Attendance"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaCalendarCheck className="text-primary text-lg" />
            <span>{isBn ? "উপস্থিতির খতিয়ান" : "Attendance Overview"}</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "উপস্থিতির হার" : "Attendance Rate"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-primary font-mono block">
                  {percentageVal}%
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "মোট উপস্থিত" : "Total Present"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono block">
                  {presentDaysVal}
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "মোট অনুপস্থিত" : "Total Absent"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-destructive font-mono block">
                  {absentDaysVal}
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "দেরিতে উপস্থিতি" : "Late Arrival"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-500 font-mono block">
                  {lateDaysVal}
                </span>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/50 pb-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <FaCalendarCheck className="text-primary" />
                  <span>
                    {isBn ? "দৈনিক উপস্থিতির ইতিহাস" : "Daily Attendance History"}
                  </span>
                </h3>

                <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border text-[11px] font-semibold">
                  {["ALL", "PRESENT", "ABSENT", "LATE"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        filterStatus === status
                          ? status === "PRESENT"
                            ? "bg-emerald-600 text-white font-bold shadow-sm"
                            : status === "ABSENT"
                            ? "bg-destructive text-destructive-foreground font-bold shadow-sm"
                            : status === "LATE"
                            ? "bg-amber-500 text-white font-bold shadow-sm"
                            : "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {status === "ALL"
                        ? isBn ? "সব" : "All"
                        : status === "PRESENT"
                        ? isBn ? "উপস্থিত" : "Present"
                        : status === "ABSENT"
                        ? isBn ? "অনুপস্থিত" : "Absent"
                        : isBn ? "লেট" : "Late"}
                    </button>
                  ))}
                </div>
              </div>

              {filteredLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {isBn
                    ? "কোনো উপস্থিতির তথ্য পাওয়া যায়নি।"
                    : "No attendance logs available."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3">{isBn ? "তারিখ" : "Date"}</th>
                        <th className="py-3 px-3">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                        <th className="py-3 px-3">{isBn ? "মন্তব্য / নোট" : "Note / Remark"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-sans">
                      {filteredLogs.map((log) => {
                        const isPresent = log.status === "PRESENT";
                        const isLate = log.status === "LATE";
                        return (
                          <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3.5 px-3 font-mono font-medium text-foreground">
                              {new Date(log.date).toLocaleDateString(
                                isBn ? "bn-BD" : "en-US",
                                { weekday: "short", year: "numeric", month: "short", day: "numeric" }
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
                                    ? isBn ? "উপস্থিত" : "Present"
                                    : isLate
                                    ? isBn ? "দেরিতে উপস্থিতি" : "Late"
                                    : isBn ? "অনুপস্থিত" : "Absent"}
                                </span>
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-muted-foreground">
                              {log.remark || log.note || (isBn ? "স্বাভাবিক" : "Regular")}
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