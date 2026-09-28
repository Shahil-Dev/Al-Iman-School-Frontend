"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaChalkboardTeacher,
  FaCalendarCheck,
  FaClipboardList,
  FaClock,
  FaBell,
  FaArrowRight,
  FaUserGraduate,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useUser } from "@/src/context/UserContext";
import { useLanguage } from "@/src/context/LanguageContext";

export default function TeacherDashboardPage() {
  const { user } = useUser();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [notices, setNotices] = useState<any[]>([]);
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch recent notices and routines simultaneously
    const fetchData = async () => {
      try {
        setLoading(true);
        const [noticeRes, routineRes] = await Promise.all([
          axiosInstance.get("/notices"),
          axiosInstance.get("/routines"),
        ]);

        setNotices(noticeRes.data?.data?.slice(0, 3) || []);
        setRoutines(routineRes.data?.data?.slice(0, 5) || []);
      } catch (error) {
        console.error("Failed to load teacher dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Teacher Welcome Banner */}
      <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FaChalkboardTeacher className="text-primary" />
            <span>
              {isBn ? "আসসালামু আলাইকুম," : "Welcome,"} {user?.name || "Teacher"}!
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "আল-ইমান স্কুল অ্যান্ড কলেজের শিক্ষক প্যানেলে আপনাকে স্বাগতম। আজকের ক্লাস ও উপস্থিতি আপডেট করুন।"
              : "Welcome to Al-Iman School & College Teacher Portal. Manage your daily classes & attendance."}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/Dashboard/attendance"
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5"
          >
            <FaCalendarCheck />
            <span>{isBn ? "উপস্থিতি নিন" : "Take Attendance"}</span>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card p-5 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {isBn ? "আমার সাবজেক্টসমূহ" : "Assigned Subjects"}
              </p>
              <h3 className="text-xl font-bold text-foreground mt-1">কোর বিষয়সমূহ</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <FaUserGraduate className="text-lg" />
            </div>
          </div>
        </Card>

        <Card className="border-border/60 shadow-sm rounded-2xl bg-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {isBn ? "উপস্থিতি স্ট্যাটাস" : "Attendance Entry"}
              </p>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {isBn ? "সক্রিয়" : "Active"}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <FaCalendarCheck className="text-lg" />
            </div>
          </div>
        </Card>

        <Card className="border-border/60 shadow-sm rounded-2xl bg-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {isBn ? "পরীক্ষার নম্বর এন্ট্রি" : "Marks Entry"}
              </p>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {isBn ? "প্রস্তুত" : "Ready"}
              </h3>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
              <FaClipboardList className="text-lg" />
            </div>
          </div>
        </Card>

        <Card className="border-border/60 shadow-sm rounded-2xl bg-card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {isBn ? "নোটিশ বোর্ড" : "Notice Board"}
              </p>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {notices.length} {isBn ? "টি নতুন" : "New"}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
              <FaBell className="text-lg" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Class Schedule & Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Routines */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FaClock className="text-primary" />
                  <span>{isBn ? "আজকের ক্লাস রুটিন" : "Today's Class Schedule"}</span>
                </h2>
                <Link
                  href="/Dashboard/academic/routines"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <span>{isBn ? "সব দেখুন" : "View All"}</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px]">
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Class & Sec</th>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-muted-foreground">
                          Loading schedule...
                        </td>
                      </tr>
                    ) : routines.length > 0 ? (
                      routines.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-muted/30">
                          <td className="py-3 px-3 font-semibold text-foreground">
                            {item.subject?.name || "General"}
                          </td>
                          <td className="py-3 px-3 font-medium text-muted-foreground">
                            {item.class?.name} ({item.section?.name || "A"})
                          </td>
                          <td className="py-3 px-3 font-mono text-primary">
                            {item.startTime || "09:00 AM"} - {item.endTime || "09:45 AM"}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <Link
                              href="/Dashboard/attendance"
                              className="px-2.5 py-1 bg-primary/10 text-primary text-[11px] font-semibold rounded-lg hover:bg-primary/20 transition-all"
                            >
                              Attendance
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-muted-foreground">
                          {isBn ? "আজ কোনো ক্লাস নির্ধারিত নেই।" : "No classes scheduled for today."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notice Board Widget */}
        <div className="space-y-4">
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FaBell className="text-amber-500" />
                  <span>{isBn ? "জরুরি নোটিশসমূহ" : "Important Notices"}</span>
                </h2>
                <Link
                  href="/Dashboard/notices"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  {isBn ? "সকল নোটিশ" : "All"}
                </Link>
              </div>

              <div className="space-y-3">
                {notices.length > 0 ? (
                  notices.map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-xl bg-muted/40 border border-border/50 hover:border-border transition-all"
                    >
                      <h4 className="text-xs font-bold text-foreground line-clamp-1">
                        {n.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                        {n.content || n.description}
                      </p>
                      <span className="text-[10px] text-primary/80 font-mono mt-2 block">
                        {new Date(n.createdAt).toLocaleDateString("bn-BD")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {isBn ? "কোনো নোটিশ পাওয়া যায়নি।" : "No active notices."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}