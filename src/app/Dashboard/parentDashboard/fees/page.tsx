"use client";

import React, { useEffect, useState } from "react";
import {
  FaFileInvoiceDollar,
  FaReceipt,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function ParentFeesPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [invoiceLoading, setInvoiceLoading] = useState<boolean>(false);

  // Load Parent's Children List
  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/parents/my-children")
      .then((res) => {
        const list = res.data?.data || res.data || [];
        setChildren(Array.isArray(list) ? list : []);
        if (list.length > 0) {
          setSelectedChild(list[0]);
        }
      })
      .catch((err) => console.error("Failed to load children list", err))
      .finally(() => setLoading(false));
  }, []);

  // Load Invoices for Selected Child
  useEffect(() => {
    if (!selectedChild?.id) return;

    setInvoiceLoading(true);
    axiosInstance
      .get(`/parents/child-overview/${selectedChild.id}`)
      .then((res) => {
        const overviewData = res.data?.data || res.data || {};
        const invoiceList = overviewData.invoices || [];
        setInvoices(Array.isArray(invoiceList) ? invoiceList : []);
      })
      .catch((err) => {
        console.error("Failed to load invoices", err);
        setInvoices([]);
      })
      .finally(() => setInvoiceLoading(false));
  }, [selectedChild]);

  // Calculate Totals
  const totalPaid = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);

  const totalDue = invoices
    .filter((inv) => inv.status === "PENDING" || inv.status === "UNPAID")
    .reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "ফি ও ইনভয়েস" : "Fees & Receipts"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaFileInvoiceDollar className="text-primary text-lg" />
            <span>{isBn ? "অনলাইন ফি ও রসিদ" : "Student Fee Invoices"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "সন্তানের টিউশন ফি, অন্যান্য চার্জ ও পরিশোধিত ফিস সমূহের বিবরণ দেখুন।"
              : "Track tuition fees, due invoices, and payment histories."}
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

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-primary text-lg" />
          <span>{isBn ? "ডাটা লোড হচ্ছে..." : "Loading fee status..."}</span>
        </div>
      ) : selectedChild ? (
        <div className="space-y-6">
          {/* Stat Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "মোট ইনভয়েস সংখ্যা" : "Total Invoices"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono block">
                  {invoices.length}
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "পরিশোধিত ফি" : "Total Paid"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono block">
                  ৳{totalPaid}
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "বকেয়া ফি" : "Total Due"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-destructive font-mono block">
                  ৳{totalDue}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Invoices List Table */}
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-3">
                <FaReceipt className="text-primary" />
                <span>{isBn ? "ফি বিবরণী ও রসিদ তালিকা" : "Invoice History & Receipts"}</span>
              </h3>

              {invoiceLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-primary" />
                  <span>{isBn ? "ইনভয়েস লোড হচ্ছে..." : "Fetching invoice records..."}</span>
                </div>
              ) : invoices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-12">
                  {isBn
                    ? "কোনো ইনভয়েস বা ফি বিবরণী পাওয়া যায়নি।"
                    : "No invoices or fee statements found."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/30">
                        <th className="py-3 px-3">{isBn ? "ইনভয়েস শিরোনাম" : "Title / Description"}</th>
                        <th className="py-3 px-3">{isBn ? "তারিখ" : "Date"}</th>
                        <th className="py-3 px-3 text-right">{isBn ? "পরিমাণ" : "Amount"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-sans">
                      {invoices.map((inv: any, idx: number) => {
                        const isPaid = inv.status === "PAID";
                        return (
                          <tr key={inv.id || idx} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3.5 px-3 font-semibold text-foreground">
                              {inv.title || inv.description || (isBn ? "টিউশন ফি" : "Tuition Fee")}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-muted-foreground">
                              {new Date(inv.createdAt).toLocaleDateString(isBn ? "bn-BD" : "en-US")}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-foreground">
                              ৳{inv.amount}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  isPaid
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-destructive/10 text-destructive border border-destructive/20"
                                }`}
                              >
                                {isPaid ? <FaCheckCircle /> : <FaExclamationCircle />}
                                <span>
                                  {isPaid
                                    ? isBn
                                      ? "পরিশোধিত"
                                      : "PAID"
                                    : isBn
                                    ? "বকেয়া"
                                    : "UNPAID"}
                                </span>
                              </span>
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
        </div>
      ) : (
        <Card className="p-8 text-center text-xs text-muted-foreground rounded-2xl border border-border">
          {isBn ? "কোনো সংযুক্ত সন্তানের প্রোফাইল পাওয়া যায়নি।" : "No linked student profile found."}
        </Card>
      )}
    </div>
  );
}