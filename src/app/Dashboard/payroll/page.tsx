"use client";

import React, { useEffect, useState } from "react";
import { FaUsers, FaPlus, FaCheck, FaSync } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function PayrollPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [teacherId, setTeacherId] = useState("");
  const [month, setMonth] = useState("January");
  const [year, setYear] = useState(2026);
  const [basicSalary, setBasicSalary] = useState<number>(20000);
  const [allowance, setAllowance] = useState<number>(0);
  const [deduction, setDeduction] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, teachRes] = await Promise.all([
        axiosInstance.get("/payroll"),
        axiosInstance.get("/teachers").catch(() => ({ data: { data: [] } })),
      ]);
      setPayrolls(payRes.data?.data || []);
      setTeachers(teachRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load payroll data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId) return;

    try {
      setSubmitting(true);
      setMsg(null);

      await axiosInstance.post("/payroll/create", {
        teacherId,
        month,
        year: Number(year),
        basicSalary: Number(basicSalary),
        allowance: Number(allowance),
        deduction: Number(deduction),
      });

      setMsg({
        type: "success",
        text: isBn
          ? "পে-রোল সাকসেসফুলি জেনারেট হয়েছে!"
          : "Payroll generated successfully!",
      });

      fetchData();
    } catch (err: any) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          (isBn
            ? "পে-রোল তৈরি করতে সমস্যা হয়েছে।"
            : "Failed to create payroll."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await axiosInstance.patch(`/payroll/pay/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to mark paid", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FaUsers className="text-primary" />
            <span>
              {isBn
                ? "শিক্ষক পে-রোল ও স্যালারি ম্যানেজমেন্ট"
                : "Teacher Payroll Management"}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "শিক্ষকদের মাসিক বেতন হিসাব ও পরিশোধ স্ট্যাটাস আপডেট করুন।"
              : "Manage teacher monthly salaries and payrolls."}
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all flex items-center gap-2 shadow-sm"
        >
          <FaSync
            className={`text-xs ${loading ? "animate-spin text-primary" : ""}`}
          />
          <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payroll Form */}
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">
              {isBn ? "স্যালারি জেনারেট করুন" : "Generate Salary"}
            </h3>

            <form onSubmit={handleCreatePayroll} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {isBn ? "শিক্ষক" : "Teacher"}
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none text-foreground"
                >
                  <option value="">
                    {isBn
                      ? "-- শিক্ষক সিলেক্ট করুন --"
                      : "-- Select Teacher --"}
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name || t.firstName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {isBn ? "মাস" : "Month"}
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none text-foreground"
                  >
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {isBn ? "বছর" : "Year"}
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {isBn ? "মূল বেতন (Basic)" : "Basic Salary"}
                </label>
                <input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none text-foreground"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
              >
                {submitting ? "Processing..." : "Generate Payroll"}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Payroll Table */}
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-4">
              {isBn ? "পে-রোল রেকর্ডস" : "Payroll Records"}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px]">
                    <th className="py-3 px-3">Teacher</th>
                    <th className="py-3 px-3">Month</th>
                    <th className="py-3 px-3">Net Salary</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {payrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {p.teacher?.name || p.teacher?.firstName || "Teacher"}
                      </td>
                      <td className="py-3 px-3">
                        {p.month} {p.year}
                      </td>
                      <td className="py-3 px-3 font-bold text-primary">
                        ৳{p.netSalary}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === "PAID" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {p.status !== "PAID" && (
                          <button
                            onClick={() => handleMarkAsPaid(p.id)}
                            className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-semibold rounded-lg hover:bg-emerald-700 transition-all"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
