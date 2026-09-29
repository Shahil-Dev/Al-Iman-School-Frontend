"use client";

import React, { useEffect, useState } from "react";
import {
  FaUserGraduate,
  FaCalendarCheck,
  FaPoll,
  FaFileInvoiceDollar,
  FaSpinner,
  FaBullhorn,
  FaPhoneAlt,
  FaIdCard,
  FaBookOpen,
  FaUserPlus,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import Link from "next/link";

export default function ParentOverviewPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [attendanceSummary, setAttendanceSummary] = useState<any | null>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParentData = async () => {
      setLoading(true);
      try {
        const [childrenRes, noticesRes] = await Promise.all([
          axiosInstance
            .get("/parents/my-children")
            .catch(() => ({ data: { data: [] } })),
          axiosInstance.get("/notices").catch(() => ({ data: { data: [] } })),
        ]);

        const childrenList = childrenRes.data?.data || childrenRes.data || [];
        setChildren(Array.isArray(childrenList) ? childrenList : []);

        if (childrenList.length > 0) {
          setSelectedChild(childrenList[0]);
        }

        const noticeList = noticesRes.data?.data || noticesRes.data || [];
        setNotices(Array.isArray(noticeList) ? noticeList.slice(0, 3) : []);
      } catch (err) {
        console.error("Failed to fetch parent overview data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchParentData();
  }, []);

  // Fetch Attendance Summary when selectedChild changes
  useEffect(() => {
    if (!selectedChild?.id) return;
    axiosInstance
      .get(`/attendances/summary/${selectedChild.id}`)
      .then((res) => setAttendanceSummary(res.data?.data || res.data || null))
      .catch(() => setAttendanceSummary(null));
  }, [selectedChild]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <FaSpinner className="animate-spin text-primary text-lg" />
        <span>{isBn ? "ডাটা লোড হচ্ছে..." : "Loading Data..."}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "অভিভাবক পোর্টাল" : "Parent Portal"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2">
            {isBn ? "স্বাগতম, অভিভাবক!" : "Welcome, Parent!"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "আপনার সন্তানের অ্যাকাডেমিক তথ্য, উপস্থিতি ও পরীক্ষার ফলাফল পর্যবেক্ষণ করুন।"
              : "Monitor your child's academic progress, attendance, and exam results."}
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="bg-muted/50 p-2.5 rounded-xl border border-border">
            <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              {isBn ? "সন্তান নির্বাচন করুন" : "Select Child"}
            </label>
            <select
              value={selectedChild?.id || ""}
              onChange={(e) => {
                const found = children.find((c) => c.id === e.target.value);
                if (found) setSelectedChild(found);
              }}
              className="bg-background text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} ({c.class?.name || "N/A"})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Child Profile & Quick Stats Grid */}
      {selectedChild ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Student Card */}
          <Card className="md:col-span-2 border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4 border-b border-border/50 pb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl ring-1 ring-primary/20">
                  {selectedChild.photoUrl ? (
                    <img
                      src={selectedChild.photoUrl}
                      alt={selectedChild.firstName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    selectedChild.firstName?.charAt(0) || "S"
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {selectedChild.firstName} {selectedChild.lastName}
                  </h2>
                  <p className="text-xs font-medium text-muted-foreground">
                    {isBn ? "স্টুডেন্ট আই ডি:" : "Student ID:"}{" "}
                    <span className="font-mono text-foreground font-semibold">
                      {selectedChild.studentIdNo || selectedChild.studentCode}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-muted px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-foreground border border-border/60">
                      {isBn ? "শ্রেণি:" : "Class:"}{" "}
                      {selectedChild.class?.name || "N/A"}
                    </span>
                    <span className="bg-muted px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-foreground border border-border/60">
                      {isBn ? "সেকশন:" : "Section:"}{" "}
                      {selectedChild.section?.name || "N/A"}
                    </span>
                    <span className="bg-muted px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-foreground border border-border/60">
                      {isBn ? "রোল:" : "Roll:"} {selectedChild.rollNo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info Items */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground block font-medium">
                    {isBn ? "পিতার নাম" : "Father Name"}
                  </span>
                  <strong className="text-foreground">
                    {selectedChild.fatherName || "N/A"}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground block font-medium">
                    {isBn ? "মাতার নাম" : "Mother Name"}
                  </span>
                  <strong className="text-foreground">
                    {selectedChild.motherName || "N/A"}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground block font-medium">
                    {isBn ? "জরুরি যোগাযোগ" : "Contact Phone"}
                  </span>
                  <strong className="text-foreground font-mono">
                    {selectedChild.phone || "N/A"}
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Quick Card */}
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-3">
                <FaCalendarCheck className="text-primary" />
                <span>{isBn ? "উপস্থিতি সংক্ষেপ" : "Attendance Rate"}</span>
              </h3>

              <div className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <span className="text-3xl font-extrabold text-primary font-mono">
                  {attendanceSummary?.percentage || "95"}%
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
                    {attendanceSummary?.presentDays || "0"}
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                  <span className="text-[10px] text-muted-foreground block">
                    {isBn ? "অনুপস্থিত" : "Absent"}
                  </span>
                  <strong className="text-destructive font-mono">
                    {attendanceSummary?.absentDays || "0"}
                  </strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center text-xs text-muted-foreground rounded-2xl border border-border">
          {isBn
            ? "কোনো সংযুক্ত সন্তানের প্রোফাইল পাওয়া যায়নি।"
            : "No linked student profile found."}
        </Card>
      )}

      {/* Quick Access Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/Dashboard/parentDashboard/attendance">
          <Card className="border-border/60 hover:border-primary/50 shadow-sm transition-all rounded-2xl bg-card p-5 flex items-center gap-4 group">
            <div className="p-3 rounded-xl bg-primary/10 text-primary text-xl group-hover:scale-105 transition-transform">
              <FaCalendarCheck />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {isBn ? "উপস্থিতি ট্র্যাকার" : "Attendance Tracker"}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {isBn ? "দৈনিক রেকর্ড দেখুন" : "View daily records"}
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/Dashboard/parentDashboard/results">
          <Card className="border-border/60 hover:border-primary/50 shadow-sm transition-all rounded-2xl bg-card p-5 flex items-center gap-4 group">
            <div className="p-3 rounded-xl bg-primary/10 text-primary text-xl group-hover:scale-105 transition-transform">
              <FaPoll />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {isBn ? "পরীক্ষার ফলাফল" : "Exam Results"}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {isBn ? "মার্কশিট দেখুন" : "View marksheets"}
              </p>
            </div>
          </Card>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/Dashboard/parentDashboard/add-child"
            className="px-3.5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
          >
            <FaUserPlus />
            <span>{isBn ? "সন্তান যুক্ত করুন" : "Add Child"}</span>
          </Link>
        </div>

        <Link href="/Dashboard/parentDashboard/fees">
          <Card className="border-border/60 hover:border-primary/50 shadow-sm transition-all rounded-2xl bg-card p-5 flex items-center gap-4 group">
            <div className="p-3 rounded-xl bg-primary/10 text-primary text-xl group-hover:scale-105 transition-transform">
              <FaFileInvoiceDollar />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                {isBn ? "টিউশন ফি ও ইনভয়েস" : "Fees & Receipts"}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                {isBn ? "বকেয়া ফি ও রসিদ" : "Check due invoices"}
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Notices */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-3">
            <FaBullhorn className="text-amber-500" />
            <span>
              {isBn ? "সাম্প্রতিক নোটিশসমূহ" : "Official Announcements"}
            </span>
          </h3>

          {notices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-1"
                >
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(n.createdAt).toLocaleDateString(
                      isBn ? "bn-BD" : "en-US",
                    )}
                  </span>
                  <h4 className="text-xs font-bold text-foreground line-clamp-1">
                    {n.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {n.description || n.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2">
              {isBn ? "কোনো সাম্প্রতিক নোটিশ নেই।" : "No recent announcements."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
