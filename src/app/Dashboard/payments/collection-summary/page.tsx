"use client";

import React, { useEffect, useState } from "react";
import { FaChartLine, FaWallet, FaCheckCircle } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function CollectionSummaryPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [invoices, setInvoices] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/payments")
      .then((res) => {
        const invoiceData = res.data?.data || [];
        setInvoices(invoiceData);

        const allTransactions: any[] = [];
        let totalSum = 0;

        invoiceData.forEach((inv: any) => {
          if (inv.transactions && Array.isArray(inv.transactions)) {
            inv.transactions.forEach((tx: any) => {
              allTransactions.push({
                ...tx,
                studentName: inv.student
                  ? `${inv.student.firstName} ${inv.student.lastName}`
                  : "N/A",
                invoiceNo: inv.invoiceNo,
              });
              totalSum += tx.amount || 0;
            });
          }
        });

        setTransactions(allTransactions);
        setTotalCollected(totalSum);
      })
      .catch((err) => console.error("Failed to load collection summary", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <FaChartLine className="text-primary" />
          <span>{isBn ? "ফি কালেকশন সামারি ও ওভারভিউ" : "Fee Collection Summary"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "সংগৃহীত মোট অর্থের পরিমাণ এবং লেনদেনের রেকর্ডস।"
            : "Overall fee collection statistics and transaction log."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? "মোট সংগৃহীত ফি" : "Total Fee Collected"}
              </p>
              <h2 className="text-2xl font-extrabold text-foreground mt-1">
                ৳{totalCollected}
              </h2>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <FaWallet className="text-xl" />
            </div>
          </div>
        </Card>

        <Card className="border-border/60 shadow-sm rounded-2xl bg-card p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {isBn ? "মোট ইনভয়েস সংখ্যা" : "Total Invoices Issued"}
              </p>
              <h2 className="text-2xl font-extrabold text-foreground mt-1">
                {invoices.length}
              </h2>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <FaCheckCircle className="text-xl" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">
            {isBn ? "সর্বশেষ পেমেন্ট ট্রানজেকশনসমূহ" : "Recent Payment Transactions"}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px]">
                  <th className="py-3 px-3">Trx ID</th>
                  <th className="py-3 px-3">Invoice No</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      {isBn ? "লোডিং হচ্ছে..." : "Loading records..."}
                    </td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((t, idx) => (
                    <tr key={t.id || idx} className="hover:bg-muted/30">
                      <td className="py-3 px-3 font-semibold font-mono text-primary">
                        {t.transactionId || "N/A"}
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {t.invoiceNo || "N/A"}
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {t.studentName}
                      </td>
                      <td className="py-3 px-3">{t.method || "CASH"}</td>
                      <td className="py-3 px-3 font-bold text-emerald-600">
                        ৳{t.amount}
                      </td>
                      <td className="py-3 px-3">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      {isBn
                        ? "কোনো পেমেন্ট বা ট্রানজেকশন পাওয়া যায়নি।"
                        : "No transactions found."}
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