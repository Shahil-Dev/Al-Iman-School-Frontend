"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  FaFileInvoiceDollar,
  FaSpinner,
  FaMoneyCheckAlt,
  FaReceipt,
  FaExclamationCircle,
  FaCheckCircle,
  FaCreditCard,
  FaSyncAlt,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";
import { paymentService } from "@/src/Services/paymentService";
import PaymentModal from "@/src/components/payment/PaymentModal";
import InvoiceStatusBadge from "@/src/components/payment/InvoiceStatusBadge";

export default function StudentFeesPage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const isBn = language === "bn";

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Invoices are stored against StudentProfile.id (not User.id)
  const studentProfileId: string | undefined = user?.studentProfile?.id;

  const fetchStudentInvoices = useCallback(
    async (silent = false) => {
      if (!studentProfileId) return;

      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await paymentService.getStudentInvoices(studentProfileId);
        const data = res?.data || res || [];
        setInvoices(Array.isArray(data) ? data : []);
        setLoadError("");
      } catch (err) {
        console.error("Failed to load student invoices", err);
        setLoadError(
          isBn ? "ইনভয়েস লোড করতে সমস্যা হয়েছে।" : "Failed to load invoices.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [studentProfileId, isBn],
  );

  useEffect(() => {
    if (!user) return;

    if (!studentProfileId) {
      setLoading(false);
      setLoadError(
        isBn
          ? "স্টুডেন্ট প্রোফাইল পাওয়া যায়নি। অনুগ্রহ করে আবার লগইন করুন।"
          : "Student profile not found. Please log in again.",
      );
      return;
    }

    fetchStudentInvoices();
  }, [user, studentProfileId, fetchStudentInvoices, isBn]);

  // Re-fetch when the user returns to this tab (e.g. after admin records a payment)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchStudentInvoices(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [fetchStudentInvoices]);

  const totalAmount = invoices.reduce(
    (acc, inv) => acc + (Number(inv.amount) || 0),
    0,
  );
  const totalPaidAmount = invoices.reduce(
    (acc, inv) => acc + (Number(inv.paidAmount) || 0),
    0,
  );
  const dueAmount = Math.max(0, totalAmount - totalPaidAmount);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "টিউশন ফি ও বকেয়া" : "Invoices & Fees"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaFileInvoiceDollar className="text-primary text-lg" />
            <span>
              {isBn ? "ফি এবং ইনভয়েস বিবরণী" : "Fee Payments & Status"}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "তোমার পরিশোধিত ফি, বর্তমান বকেয়া ও ইনভয়েসসমূহ নিচে প্রদান করা হলো।"
              : "Review your payment history, pending tuition fees, and official receipts."}
          </p>
        </div>

        <button
          onClick={() => fetchStudentInvoices(true)}
          disabled={refreshing || loading}
          className="bg-muted/60 hover:bg-muted text-foreground px-3 py-2 rounded-xl text-[11px] font-semibold border border-border inline-flex items-center gap-2 transition disabled:opacity-60"
        >
          <FaSyncAlt className={refreshing ? "animate-spin" : ""} />
          <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-primary text-lg" />
          <span>
            {isBn ? "ফি এবং ইনভয়েস লোড হচ্ছে..." : "Loading fee invoices..."}
          </span>
        </div>
      ) : loadError ? (
        <Card className="p-8 text-center text-xs text-destructive rounded-2xl border border-border">
          {loadError}
        </Card>
      ) : (
        <>
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
                    ৳{totalPaidAmount}
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
                    {isBn ? "বর্তমান বকেয়া" : "Current Due"}
                  </span>
                  <span className="text-2xl font-extrabold text-destructive font-mono block">
                    ৳{dueAmount}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-4">
                <FaReceipt className="text-primary" />
                <span>{isBn ? "ইনভয়েসের তালিকা" : "Invoice Statement"}</span>
              </h3>

              {invoices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {isBn
                    ? "কোনো ইনভয়েসের তথ্য পাওয়া যায়নি।"
                    : "No invoices available."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
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
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3.5 px-3">
                              <span className="block font-mono font-bold text-foreground">
                                {inv.invoiceNo}
                              </span>
                              {inv.reason && (
                                <span className="mt-0.5 block max-w-[220px] text-[10px] font-medium leading-snug text-muted-foreground">
                                  {inv.reason}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-muted-foreground font-mono">
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
        </>
      )}

      {selectedInvoice && (
        <PaymentModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onSuccess={() => {
            setSelectedInvoice(null);
            fetchStudentInvoices(true);
          }}
        />
      )}
    </div>
  );
}
