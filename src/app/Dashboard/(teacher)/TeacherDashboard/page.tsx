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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);

        // Fetch Notices safely without triggering broken 404 routine endpoint
        const noticeRes = await axiosInstance.get("/notices");
        setNotices(noticeRes.data?.data?.slice(0, 3) || []);
      } catch (err) {
        console.warn("Notice fetch warning:", err);
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
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
              ? "আল-ইমান স্কুল অ্যান্ড কলেজের শিক্ষক প্যানেলে আপনাকে স্বাগতম। আপনার দৈনিক ক্লাস ও একাডেমিক কার্যক্রম পরিচালনা করুন।"
              : "Welcome to Al-Iman School & College Teacher Portal. Manage your daily classes & academic tasks."}
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
                {isBn ? "আমার ভূমিকা" : "Assigned Role"}
              </p>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {user?.role || "TEACHER"}
              </h3>
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
                {isBn ? "উপস্থিতি সিস্টেম" : "Attendance Portal"}
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
                {isBn ? "মার্কস এন্ট্রি" : "Marks Entry"}
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
                {notices.length} {isBn ? "টি বার্তা" : "Messages"}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
              <FaBell className="text-lg" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Quick Action Shortcuts & Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Academic Actions */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <FaClock className="text-primary" />
                <span>{isBn ? "শিক্ষক শর্টকাট একশন" : "Teacher Quick Actions"}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/Dashboard/attendance"
                  className="p-4 rounded-xl bg-muted/40 border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg group-hover:scale-105 transition-transform">
                      <FaCalendarCheck />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {isBn ? "শিক্ষার্থী উপস্থিতি" : "Take Attendance"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {isBn ? "দৈনিক উপস্থিতি ইনপুট ও অটো এসএমএস" : "Class attendance entry"}
                      </p>
                    </div>
                  </div>
                  <FaArrowRight className="text-xs text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  href="/Dashboard/marks"
                  className="p-4 rounded-xl bg-muted/40 border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-lg group-hover:scale-105 transition-transform">
                      <FaClipboardList />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {isBn ? "পরীক্ষার নম্বর এন্ট্রি" : "Marks Entry"}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {isBn ? "সাবজেক্ট ভিত্তিক মার্কস সাবমিট" : "Input exam subject marks"}
                      </p>
                    </div>
                  </div>
                  <FaArrowRight className="text-xs text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
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
                {loading ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {isBn ? "নোটিশ লোড হচ্ছে..." : "Loading notices..."}
                  </p>
                ) : notices.length > 0 ? (
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