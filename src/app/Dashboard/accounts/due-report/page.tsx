"use client";

import React, { useEffect, useState } from "react";
import { FaExclamationCircle, FaWhatsapp, FaPrint, FaSync } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function DueReportPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [dueInvoices, setDueInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance
      .get("/academic/classes")
      .then((res) => setClasses(res.data?.data || []))
      .catch((err) => console.error("Failed to load classes", err));
  }, []);

  const fetchDueInvoices = async () => {
    try {
      setLoading(true);
      // Fetch invoices filtering pending status
      const res = await axiosInstance.get("/payments/student/due-list").catch(() => ({ data: { data: [] } }));
      setDueInvoices(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch due report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueInvoices();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FaExclamationCircle className="text-amber-500" />
            <span>{isBn ? "বকেয়া রিপোর্ট ও ফলো-আপ" : "Unpaid Due Fee Summary Report"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "যেসব শিক্ষার্থী এখনও বেতন পরিশোধ করেনি তাদের তালিকা।"
              : "Track unpaid student fees and send automated WhatsApp reminders."}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
        >
          <FaPrint />
          <span>{isBn ? "রিপোর্ট প্রিন্ট করুন" : "Print Due Report"}</span>
        </button>
      </div>

      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Invoice No</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">Phone (WhatsApp)</th>
                  <th className="py-3 px-3">Due Amount</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {dueInvoices.length > 0 ? (
                  dueInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30">
                      <td className="py-3 px-3 font-semibold text-foreground">{inv.invoiceNo}</td>
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {inv.student?.firstName} {inv.student?.lastName}
                      </td>
                      <td className="py-3 px-3">{inv.student?.class?.name || "N/A"}</td>
                      <td className="py-3 px-3 text-primary font-mono">{inv.student?.phone || "N/A"}</td>
                      <td className="py-3 px-3 font-bold text-destructive">৳{inv.amount - inv.paidAmount}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      {isBn ? "কোনো বকেয়া পাওয়া যায়নি।" : "No pending due invoices found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}