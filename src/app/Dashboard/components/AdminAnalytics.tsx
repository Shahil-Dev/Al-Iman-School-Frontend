"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/src/lib/axiosInstance";
import { Users, GraduationCap, UserCheck, DollarSign, AlertCircle } from "lucide-react";

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await axiosInstance.get("/admin/analytics");
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6 text-slate-500">Loading analytics...</div>;
  if (!data) return <div className="p-6 text-rose-500">Failed to load analytics data.</div>;

  const { overview, financials } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={overview?.totalStudents} icon={GraduationCap} color="bg-blue-500" />
        <StatCard title="Total Teachers" value={overview?.totalTeachers} icon={Users} color="bg-emerald-500" />
        <StatCard title="Total Parents" value={overview?.totalParents} icon={UserCheck} color="bg-purple-500" />
        <StatCard title="Monthly Collected" value={`$${financials?.monthlyCollectedAmount}`} icon={DollarSign} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase">Financial Summary</h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Due Amount:</span>
              <span className="font-bold text-rose-600">${financials?.totalDueAmount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600">Pending Payrolls:</span>
              <span className="font-bold text-amber-600">${financials?.pendingPayrollAmount} ({financials?.pendingPayrollCount} Records)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Pending Reviews to Approve</p>
            <p className="text-2xl font-bold text-slate-800">{overview?.pendingReviewsCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value ?? 0}</p>
      </div>
      <div className={`p-3 rounded-lg text-white ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}