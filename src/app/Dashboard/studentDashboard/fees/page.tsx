"use client";

import React, { useEffect, useState } from "react";
import {
  FaFileInvoiceDollar,
  FaSpinner,
  FaMoneyCheckAlt,
  FaReceipt,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";

export default function StudentFeesPage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const isBn = language === "bn";

  const [student, setStudent] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentInvoices = async () => {
      setLoading(true);
      try {
        const studentId = user?.studentId || user?.id;
        if (!studentId) return;

        // 1. Fetch Student Profile along with relations
        const res = await axiosInstance.get(`/students/${studentId}`);
        const profile = res.data?.data || res.data;
        setStudent(profile);

        // Extract student invoices if present, or fetch from payment endpoint
        if (profile?.invoices && Array.isArray(profile.invoices)) {
          setInvoices(profile.invoices);
        } else {
          const invRes = await axiosInstance.get(
            `/payments?studentId=${profile?.id || studentId}`
          );
          const invData = invRes.data?.data || invRes.data || [];
          setInvoices(Array.isArray(invData) ? invData : []);
        }
      } catch (err) {
        console.error("Failed to load student invoices", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentInvoices();
  }, [user]);

  // Calculate Fee Summary Statistics
  const totalAmount = invoices.reduce(
    (acc, inv) => acc + (Number(inv.totalAmount) || Number(inv.amount) || 0),
    0
  );

  const paidAmount = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce(
      (acc, inv) => acc + (Number(inv.totalAmount) || Number(inv.amount) || 0),
      0
    );

  const dueAmount = invoices
    .filter((inv) => inv.status !== "PAID")
    .reduce(
      (acc, inv) => acc + (Number(inv.totalAmount) || Number(inv.amount) || 0),
      0
    );

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "টিউশন ফি ও বকেয়া" : "Invoices & Fees"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaFileInvoiceDollar className="text-primary text-lg" />
            <span>{isBn ? "ফি এবং ইনভয়েস বিবরণী" : "Fee Payments & Status"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "তোমার পরিশোধিত ফি, বর্তমান বকেয়া ও ইনভয়েসসমূহ নিচে প্রদান করা হলো।"
              : "Review your payment history, pending tuition fees, and official receipts."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-primary text-lg" />
          <span>{isBn ? "ফি এবং ইনভয়েস লোড হচ্ছে..." : "Loading fee invoices..."}</span>
        </div>
      ) : (
        <>
          {/* Financial Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary text-2xl shrink-0">
                  <FaMoneyCheckAlt />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    {isBn ? "মোট নির্ধারিত ফি" : "Total Fee Amount"}
                  </span>
                  <span className="text-2xl font-extrabold text-foreground font-mono block">
                    ৳{totalAmount}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-2xl shrink-0">
                  <FaCheckCircle />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    {isBn ? "মোট পরিশোধিত" : "Total Paid"}
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-600 font-mono block">
                    ৳{paidAmount}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-2xl shrink-0">
                  <FaExclamationCircle />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                    {isBn ? "বর্তমান বকেয়া" : "Current Due"}
                  </span>
                  <span className="text-2xl font-extrabold text-destructive font-mono block">
                    ৳{dueAmount}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices List Table */}
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-4">
                <FaReceipt className="text-primary" />
                <span>{isBn ? "ইনভয়েসের তালিকা" : "Invoice Statement"}</span>
              </h3>

              {invoices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {isBn
                    ? "কোনো ইনভয়েসের তথ্য পাওয়া যায়নি।"
                    : "No invoices available."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3">{isBn ? "ইনভয়েস নং" : "Invoice No"}</th>
                        <th className="py-3 px-3">{isBn ? "বিবরণ / শিরোনাম" : "Title / Description"}</th>
                        <th className="py-3 px-3">{isBn ? "তারিখ" : "Date"}</th>
                        <th className="py-3 px-3 text-right">{isBn ? "পরিমাণ" : "Amount"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-sans">
                      {invoices.map((inv: any, idx: number) => {
                        const isPaid = inv.status === "PAID";
                        return (
                          <tr
                            key={inv.id || idx}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3.5 px-3 font-mono font-bold text-foreground">
                              {inv.invoiceNo || inv.id?.slice(0, 8) || `INV-${idx + 1}`}
                            </td>
                            <td className="py-3.5 px-3 text-foreground font-medium">
                              {inv.title || inv.description || (isBn ? "টিউশন ফি" : "Tuition Fee")}
                            </td>
                            <td className="py-3.5 px-3 text-muted-foreground font-mono">
                              {new Date(inv.createdAt || Date.now()).toLocaleDateString(
                                isBn ? "bn-BD" : "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-foreground">
                              ৳{inv.totalAmount || inv.amount || 0}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isPaid
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                    : "bg-destructive/10 text-destructive border border-destructive/20"
                                }`}
                              >
                                {isPaid
                                  ? isBn
                                    ? "পরিশোধিত"
                                    : "PAID"
                                  : isBn
                                  ? "বকেয়া"
                                  : "UNPAID"}
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
        </>
      )}
    </div>
  );
}