"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  FaFileInvoiceDollar,
  FaReceipt,
  FaSpinner,
  FaCreditCard,
  FaSyncAlt,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { paymentService } from "@/src/Services/paymentService";
import PaymentModal from "@/src/components/payment/PaymentModal";
import InvoiceStatusBadge from "@/src/components/payment/InvoiceStatusBadge";

export default function ParentFeesPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [invoiceLoading, setInvoiceLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

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

  const selectedChildId: string | undefined = selectedChild?.id;

  const fetchInvoicesForChild = useCallback(
    async (silent = false) => {
      if (!selectedChildId) return;

      if (silent) setRefreshing(true);
      else setInvoiceLoading(true);

      try {
        const res = await paymentService.getStudentInvoices(selectedChildId);
        const invoiceList = res?.data || res || [];
        setInvoices(Array.isArray(invoiceList) ? invoiceList : []);
      } catch (err) {
        console.error("Failed to load invoices", err);
        setInvoices([]);
      } finally {
        setInvoiceLoading(false);
        setRefreshing(false);
      }
    },
    [selectedChildId],
  );

  useEffect(() => {
    fetchInvoicesForChild();
  }, [fetchInvoicesForChild]);

  // Re-fetch when the user returns to this tab (e.g. after admin records a payment)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchInvoicesForChild(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [fetchInvoicesForChild]);

  const totalAmount = invoices.reduce(
    (acc, inv) => acc + (Number(inv.amount) || 0),
    0,
  );
  const totalPaid = invoices.reduce(
    (acc, inv) => acc + (Number(inv.paidAmount) || 0),
    0,
  );
  const totalDue = Math.max(0, totalAmount - totalPaid);

  return (
    <div className="space-y-6 font-sans">
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

        <div className="flex items-end gap-3">
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

          <button
            onClick={() => fetchInvoicesForChild(true)}
            disabled={refreshing || invoiceLoading || !selectedChildId}
            className="bg-muted/60 hover:bg-muted text-foreground px-3 py-2 rounded-xl text-[11px] font-semibold border border-border inline-flex items-center gap-2 transition disabled:opacity-60"
          >
            <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
            <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-primary text-lg" />
          <span>{isBn ? "ডাটা লোড হচ্ছে..." : "Loading fee status..."}</span>
        </div>
      ) : selectedChild ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "মোট নির্ধারিত ফি" : "Total Fee Amount"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono block">
                  ৳{totalAmount}
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

          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-3">
                <FaReceipt className="text-primary" />
                <span>
                  {isBn ? "ফি বিবরণী ও রসিদ তালিকা" : "Invoice History & Receipts"}
                </span>
              </h3>

              {invoiceLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-primary" />
                  <span>
                    {isBn ? "ইনভয়েস লোড হচ্ছে..." : "Fetching invoice records..."}
                  </span>
                </div>
              ) : invoices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-12">
                  {isBn
                    ? "কোনো ইনভয়েস বা ফি বিবরণী পাওয়া যায়নি।"
                    : "No invoices or fee statements found."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/30">
                        <th className="py-3 px-3">
                          {isBn ? "ইনভয়েস নং" : "Invoice No"}
                        </th>
                        <th className="py-3 px-3">{isBn ? "তারিখ" : "Date"}</th>
                        <th className="py-3 px-3 text-right">
                          {isBn ? "মোট ফি" : "Total Fee"}
                        </th>
                        <th className="py-3 px-3 text-right">
                          {isBn ? "পরিশোধিত" : "Paid"}
                        </th>
                        <th className="py-3 px-3 text-right">
                          {isBn ? "বকেয়া" : "Due"}
                        </th>
                        <th className="py-3 px-3 text-center">
                          {isBn ? "স্ট্যাটাস" : "Status"}
                        </th>
                        <th className="py-3 px-3 text-center">
                          {isBn ? "অ্যাকশন" : "Action"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-sans">
                      {invoices.map((inv: any, idx: number) => {
                        const isPaid = inv.status === "PAID";
                        const hasPendingTx = inv.transactions?.some(
                          (t: any) => t.status === "PENDING_APPROVAL",
                        );
                        const invDue = Math.max(
                          0,
                          Number(inv.amount) - Number(inv.paidAmount || 0),
                        );

                        return (
                          <tr
                            key={inv.id || idx}
                            className="hover:bg-muted/20 transition-colors"
                          >
                            <td className="py-3.5 px-3 font-mono font-bold text-foreground">
                              {inv.invoiceNo}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-muted-foreground">
                              {new Date(inv.createdAt).toLocaleDateString(
                                isBn ? "bn-BD" : "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-foreground">
                              ৳{inv.amount}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600">
                              ৳{inv.paidAmount}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-destructive">
                              ৳{invDue}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <InvoiceStatusBadge invoice={inv} isBn={isBn} />
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {!isPaid && !hasPendingTx && (
                                <button
                                  onClick={() => setSelectedInvoice(inv)}
                                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded-lg font-semibold text-[11px] transition inline-flex items-center justify-center gap-1 mx-auto shadow-sm"
                                >
                                  <FaCreditCard />
                                  <span>
                                    {isBn ? "পেমেন্ট করুন" : "Pay Now"}
                                  </span>
                                </button>
                              )}
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
          {isBn
            ? "কোনো সংযুক্ত সন্তানের প্রোফাইল পাওয়া যায়নি।"
            : "No linked student profile found."}
        </Card>
      )}

      {selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={() => {
            setSelectedInvoice(null);
            fetchInvoicesForChild(true);
          }}
        />
      )}
    </div>
  );
}