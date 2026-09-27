"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaFileInvoiceDollar,
  FaUserClock,
  FaArrowUp,
  FaPlus,
  FaUserCheck,
  FaReceipt,
  FaBell,
  FaSync,
  FaMoneyCheckAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

interface IAnalyticsResponse {
  overview?: {
    totalStudents?: number;
    totalTeachers?: number;
    totalParents?: number;
    pendingAdmissions?: number;
    pendingReviewsCount?: number;
  };
  financials?: {
    monthlyCollectedAmount?: number;
    totalDueAmount?: number;
    pendingPayrollAmount?: number;
    pendingPayrollCount?: number;
  };
  recentAdmissions?: Array<{
    id: string;
    studentName: string;
    applicationNo: string;
    createdAt: string;
    status: string;
  }>;
}

export default function AdminOverviewPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [analytics, setAnalytics] = useState<IAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/admin/analytics", {
        timeout: 15000,
      });
      setAnalytics(response.data?.data || response.data);
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err);
      setError(
        isBn
          ? "অ্যানালিটিক্স ডাটা লোড করতে ব্যর্থ হয়েছে। নেটওয়ার্ক সংযোগ বা সার্ভিস চেক করুন।"
          : "Failed to load dashboard analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stats = [
    {
      title: isBn ? "মোট শিক্ষার্থী" : "Total Students",
      value: analytics?.overview?.totalStudents ?? 0,
      change: isBn ? "নিবন্ধিত শিক্ষার্থী" : "Active Students",
      icon: FaUserGraduate,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: isBn ? "মোট শিক্ষক" : "Total Teachers",
      value: analytics?.overview?.totalTeachers ?? 0,
      change: isBn ? "সক্রিয় শিক্ষকমণ্ডলী" : "Active Faculty",
      icon: FaChalkboardTeacher,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: isBn ? "পেন্ডিং ভর্তি আবেদন" : "Pending Admissions",
      value: analytics?.overview?.pendingAdmissions ?? 0,
      change: isBn ? "অনুমোদন প্রয়োজন" : "Requires Action",
      icon: FaUserClock,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      title: isBn ? "চলতি মাসে সংগৃহীত ফি" : "Monthly Fees Collected",
      value: `৳ ${(analytics?.financials?.monthlyCollectedAmount ?? 0).toLocaleString()}`,
      change: isBn ? "চলতি মাসের আদায়" : "This Month Collection",
      icon: FaFileInvoiceDollar,
      color: "text-purple-500 bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            {isBn ? "অ্যাডমিন ড্যাশবোর্ড ওভারভিউ" : "Admin Dashboard Overview"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "আল-ইমান স্কুলের আজকের সার্বিক তথ্য ও রিয়েলটাইম অ্যানালিটিক্স।"
              : "Welcome back! Here is what is happening in Al-Iman School today."}
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <FaSync className={`text-xs ${loading ? "animate-spin text-primary" : ""}`} />
          <span>{isBn ? "রিফ্রেশ করুন" : "Refresh Data"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2">
          <FaExclamationTriangle className="shrink-0 text-sm" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className="border-border/60 shadow-sm rounded-2xl bg-card hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? "..." : stat.value}
                  </p>
                  <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                    <FaArrowUp className="text-[8px]" />
                    <span>{stat.change}</span>
                  </p>
                </div>
                <div className={`p-3.5 rounded-2xl ${stat.color} shrink-0`}>
                  <Icon className="text-xl" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Financial Overview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                {isBn ? "শিক্ষার্থীদের মোট বকেয়া ফি" : "Total Student Due Amount"}
              </p>
              <p className="text-xl font-bold text-destructive mt-1">
                ৳ {(analytics?.financials?.totalDueAmount ?? 0).toLocaleString()}
              </p>
            </div>
            <Link
              href="/Dashboard/accounts/due-report"
              className="px-3 py-1.5 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg hover:bg-destructive/20 transition-colors"
            >
              {isBn ? "বকেয়া রিপোর্ট" : "Due Report"}
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                {isBn ? "শিক্ষক ও স্টাফ পেন্ডিং বেতন" : "Pending Staff Payroll"}
              </p>
              <p className="text-xl font-bold text-amber-600 mt-1">
                ৳ {(analytics?.financials?.pendingPayrollAmount ?? 0).toLocaleString()}
              </p>
            </div>
            <Link
              href="/Dashboard/payroll"
              className="px-3 py-1.5 bg-amber-500/10 text-amber-600 text-xs font-semibold rounded-lg hover:bg-amber-500/20 transition-colors"
            >
              {isBn ? "পে-রোল প্রদান" : "Payrolls"}
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-foreground mb-1">
            {isBn ? "দ্রুত অ্যাকশনসমূহ (Quick Actions)" : "Quick Actions"}
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            {isBn
              ? "এক ক্লিকেই গুরুত্বপূর্ণ প্রশাসনিক কাজগুলো সম্পন্ন করুন।"
              : "Perform primary administrative tasks in a single click."}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/Dashboard/admissions"
              className="px-4 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
            >
              <FaUserCheck className="text-xs" />
              <span>{isBn ? "অনলাইন আবেদন যাচাই" : "Approve Admissions"}</span>
            </Link>

            <Link
              href="/Dashboard/students/create"
              className="px-4 py-2.5 bg-muted text-foreground text-xs font-semibold rounded-xl hover:bg-muted/80 transition-all flex items-center gap-2 border border-border/50"
            >
              <FaPlus className="text-xs text-primary" />
              <span>{isBn ? "নতুন শিক্ষার্থী ভর্তি" : "Add New Student"}</span>
            </Link>

            <Link
              href="/Dashboard/payments/create-invoice"
              className="px-4 py-2.5 bg-muted text-foreground text-xs font-semibold rounded-xl hover:bg-muted/80 transition-all flex items-center gap-2 border border-border/50"
            >
              <FaReceipt className="text-xs text-purple-500" />
              <span>{isBn ? "ফি ইনভয়েস তৈরি করুন" : "Create Fee Invoice"}</span>
            </Link>

            <Link
              href="/Dashboard/notices"
              className="px-4 py-2.5 bg-muted text-foreground text-xs font-semibold rounded-xl hover:bg-muted/80 transition-all flex items-center gap-2 border border-border/50"
            >
              <FaBell className="text-xs text-amber-500" />
              <span>{isBn ? "নতুন নোটিশ প্রকাশ করুন" : "Publish Notice"}</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications List */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">
              {isBn ? "সাম্প্রতিক ভর্তি আবেদনসমূহ" : "Recent Admission Applications"}
            </h3>
            <Link
              href="/Dashboard/admissions"
              className="text-xs font-semibold text-primary hover:underline"
            >
              {isBn ? "সব আবেদন দেখুন" : "View All"}
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-muted-foreground py-4">
              {isBn ? "ডাটা লোড হচ্ছে..." : "Loading applications..."}
            </p>
          ) : analytics?.recentAdmissions && analytics.recentAdmissions.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentAdmissions.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40 text-xs"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {app.studentName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      App No: {app.applicationNo}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      app.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : app.status === "REJECTED"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4">
              {isBn
                ? "কোনো সাম্প্রতিক আবেদন পাওয়া যায়নি।"
                : "No recent admission applications found."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}