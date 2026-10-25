"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaSearch,
  FaSpinner,
  FaMoneyBillWave,
  FaReceipt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaSyncAlt,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";
import type { User } from "@/src/context/UserContext";
import { paymentService } from "@/src/Services/paymentService";
import InvoiceStatusBadge from "@/src/components/payment/InvoiceStatusBadge";
import UserAvatar from "@/src/components/ui/UserAvatar";

interface ICollectedReceipt {
  key: string;
  receiptId: string;
  studentName: string;
  invoiceNo: string;
  amount: number;
  remaining: number;
  fullyPaid: boolean;
  time: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const money = (n: number) => `৳${round2(Number(n) || 0)}`;
const dueOf = (inv: any) =>
  Math.max(0, round2(Number(inv.amount) - Number(inv.paidAmount || 0)));
const hasPendingTx = (inv: any) =>
  Boolean(inv.transactions?.some((t: any) => t.status === "PENDING_APPROVAL"));
const studentNameOf = (s: any) =>
  `${s?.firstName ?? ""} ${s?.lastName ?? ""}`.trim();
const asUser = (student: any) =>
  ({ role: "STUDENT", studentProfile: student }) as User;

/* -------------------------------------------------------------------------- */
/*  Cash collection modal (form step, then confirm step)                       */
/* -------------------------------------------------------------------------- */

function CashCollectModal({
  invoice,
  studentName,
  isBn,
  onClose,
  onSuccess,
}: {
  invoice: any;
  studentName: string;
  isBn: boolean;
  onClose: () => void;
  onSuccess: (receipt: Omit<ICollectedReceipt, "key" | "time">) => void;
}) {
  const due = dueOf(invoice);
  const [amount, setAmount] = useState(String(due));
  const [voucherNo, setVoucherNo] = useState("");
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const amountNum = Number(amount);
  const validAmount =
    Number.isFinite(amountNum) && amountNum > 0 && amountNum <= due + 0.001;
  const finalAmount = round2(amountNum);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validAmount) {
      setError(
        isBn
          ? `পরিমাণ ০ এর বেশি এবং বকেয়া (${money(due)}) এর মধ্যে হতে হবে।`
          : `Amount must be greater than 0 and not more than the due (${money(due)}).`,
      );
      return;
    }
    setError("");
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await paymentService.collectPayment({
        invoiceId: invoice.id,
        amount: finalAmount,
        method: "CASH",
        transactionId: voucherNo.trim() || undefined,
      });

      const result = res?.data;
      const newPaid = Number(result?.invoice?.paidAmount ?? 0);
      const remaining = Math.max(0, round2(Number(invoice.amount) - newPaid));

      onSuccess({
        receiptId: result?.transaction?.transactionId || "—",
        studentName,
        invoiceNo: invoice.invoiceNo,
        amount: finalAmount,
        remaining,
        fullyPaid: result?.invoice?.status === "PAID" || remaining === 0,
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (isBn ? "পেমেন্ট রেকর্ড করতে সমস্যা হয়েছে।" : "Failed to record the payment."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-input rounded-xl p-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/40 p-3">
          <h3 className="flex items-center gap-2 text-xs font-bold text-foreground">
            <FaMoneyBillWave className="text-primary" />
            <span>{isBn ? "ক্যাশ পেমেন্ট গ্রহণ" : "Receive Cash Payment"}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1 text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto p-4 text-xs">
          <div className="space-y-1 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{isBn ? "শিক্ষার্থী:" : "Student:"}</span>
              <span className="text-right font-bold">{studentName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{isBn ? "ইনভয়েস নং:" : "Invoice No:"}</span>
              <span className="font-mono font-bold">{invoice.invoiceNo}</span>
            </div>
            {invoice.reason && (
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">{isBn ? "বিবরণ:" : "Reason:"}</span>
                <span className="text-right font-semibold">{invoice.reason}</span>
              </div>
            )}
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{isBn ? "মোট বকেয়া:" : "Total Due:"}</span>
              <span className="font-mono font-bold text-destructive">{money(due)}</span>
            </div>
          </div>

          {step === "form" ? (
            <form onSubmit={handleReview} className="space-y-3">
              <div>
                <label className="mb-1 block font-bold text-foreground">
                  {isBn ? "গৃহীত পরিমাণ (৳) *" : "Amount Received (৳) *"}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${inputClass} font-mono font-bold`}
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {isBn
                    ? "আংশিক টাকা নিলে পরিমাণ কমিয়ে দিন, বাকি অংশ বকেয়া থাকবে।"
                    : "For a partial payment, lower the amount. The rest stays as due."}
                </p>
              </div>

              <div>
                <label className="mb-1 block font-bold text-foreground">
                  {isBn ? "রসিদ / ভাউচার নং (ঐচ্ছিক)" : "Receipt / Voucher No (optional)"}
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={voucherNo}
                  onChange={(e) => setVoucherNo(e.target.value)}
                  placeholder={isBn ? "খালি রাখলে স্বয়ংক্রিয় নম্বর হবে" : "Leave blank to auto-generate"}
                  className={`${inputClass} font-mono`}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-2 text-[11px] text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-2.5 font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                {isBn ? "পর্যালোচনা করুন" : "Review"}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="font-bold text-amber-700 dark:text-amber-400">
                  {isBn ? "নিশ্চিত করুন" : "Please confirm"}
                </p>
                <p className="leading-relaxed text-foreground">
                  {isBn
                    ? `${studentName} এর কাছ থেকে নগদ ${money(finalAmount)} গ্রহণ করা হচ্ছে। নিশ্চিত করার পর এটি বাতিল করা যাবে না।`
                    : `You are receiving ${money(finalAmount)} in cash from ${studentName}. This cannot be undone after confirmation.`}
                </p>
                {voucherNo.trim() && (
                  <p className="font-mono text-muted-foreground">
                    {isBn ? "রসিদ নং:" : "Receipt No:"} {voucherNo.trim()}
                  </p>
                )}
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-2 text-[11px] text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep("form");
                  }}
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-muted py-2.5 font-bold text-foreground transition hover:bg-muted/80 disabled:opacity-50"
                >
                  {isBn ? "ফিরে যান" : "Back"}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>{isBn ? "রেকর্ড হচ্ছে..." : "Recording..."}</span>
                    </>
                  ) : (
                    <span>{isBn ? "নিশ্চিত করে টাকা গ্রহণ করুন" : "Confirm & Receive Cash"}</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AdminCollectFeePage() {
  const { language } = useLanguage();
  const { user, loading: userLoading } = useUser();
  const isBn = language === "bn";

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const [student, setStudent] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  const [collectingInvoice, setCollectingInvoice] = useState<any | null>(null);
  const [lastReceipt, setLastReceipt] = useState<ICollectedReceipt | null>(null);
  const [sessionReceipts, setSessionReceipts] = useState<ICollectedReceipt[]>([]);

  const canCollect = user?.role === "SUPER_ADMIN" || user?.role === "ACCOUNTS";

  const loadInvoices = async (studentId: string, silent = false) => {
    if (!silent) setInvoicesLoading(true);
    try {
      const res = await paymentService.getStudentInvoices(studentId);
      const list = res?.data || [];
      setInvoices(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load invoices", err);
      setInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const selectStudent = (s: any) => {
    setStudent(s);
    setResults([]);
    setSearchMsg("");
    setLastReceipt(null);
    setCollectingInvoice(null);
    loadInvoices(s.id);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    if (term.length < 2) {
      setSearchMsg(
        isBn ? "কমপক্ষে ২ অক্ষর লিখুন।" : "Please enter at least 2 characters.",
      );
      return;
    }

    setSearching(true);
    setSearchMsg("");
    setResults([]);
    setStudent(null);
    setInvoices([]);
    setLastReceipt(null);

    try {
      const res = await axiosInstance.get("/students", {
        params: { searchTerm: term },
      });
      const list: any[] = res.data?.data || [];

      if (list.length === 0) {
        setSearchMsg(
          isBn
            ? "এই তথ্য দিয়ে কোনো শিক্ষার্থী পাওয়া যায়নি।"
            : "No student found with this information.",
        );
      } else if (list.length === 1) {
        selectStudent(list[0]);
      } else {
        setResults(list);
      }
    } catch (err: any) {
      setSearchMsg(
        err?.response?.data?.message ||
          (isBn ? "শিক্ষার্থী খুঁজতে সমস্যা হয়েছে।" : "Failed to search students."),
      );
    } finally {
      setSearching(false);
    }
  };

  const handlePaymentRecorded = (
    receipt: Omit<ICollectedReceipt, "key" | "time">,
  ) => {
    const full: ICollectedReceipt = {
      ...receipt,
      key: `${receipt.receiptId}-${Date.now()}`,
      time: new Date().toLocaleTimeString(isBn ? "bn-BD" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setLastReceipt(full);
    setSessionReceipts((prev) => [full, ...prev]);
    setCollectingInvoice(null);
    if (student) loadInvoices(student.id, true);
  };

  const totalAmount = invoices.reduce((a, i) => a + (Number(i.amount) || 0), 0);
  const totalPaid = invoices.reduce((a, i) => a + (Number(i.paidAmount) || 0), 0);
  const totalDue = Math.max(0, round2(totalAmount - totalPaid));
  const sessionTotal = sessionReceipts.reduce((a, r) => a + r.amount, 0);

  if (userLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-xs text-muted-foreground">
        <FaSpinner className="animate-spin text-primary" />
        <span>{isBn ? "লোড হচ্ছে..." : "Loading..."}</span>
      </div>
    );
  }

  if (!canCollect) {
    return (
      <Card className="rounded-2xl border border-border p-8 text-center text-xs text-destructive">
        {isBn
          ? "এই পেজ শুধু সুপার অ্যাডমিন ও অ্যাকাউন্টস দেখতে পারবেন।"
          : "Only Super Admin and Accounts can access this page."}
      </Card>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground md:text-2xl">
          <FaMoneyBillWave className="text-primary" />
          <span>{isBn ? "ক্যাশ পেমেন্ট গ্রহণ" : "Collect Cash Payment"}</span>
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {isBn
            ? "অফিসে নগদ টাকা দিলে STU কোড দিয়ে শিক্ষার্থী খুঁজে ফি গ্রহণ করুন। শিক্ষার্থী ও অভিভাবকের ড্যাশবোর্ডে সঙ্গে সঙ্গে আপডেট হবে।"
            : "Search a student by STU code and receive fees paid in cash at the office. Student and parent dashboards update instantly."}
        </p>
      </div>

      {/* Search */}
      <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
        <CardContent className="space-y-3 p-5">
          <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <FaSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isBn ? "STU কোড (যেমন STU-26-0001), নাম বা ফোন" : "STU code (e.g. STU-26-0001), name or phone"}
                aria-label={isBn ? "শিক্ষার্থী খুঁজুন" : "Search student"}
                className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              {searching ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              <span>{isBn ? "খুঁজুন" : "Search"}</span>
            </button>
          </form>

          {searchMsg && (
            <p className="flex items-center gap-2 text-xs font-medium text-destructive">
              <FaExclamationTriangle />
              <span>{searchMsg}</span>
            </p>
          )}

          {results.length > 1 && (
            <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
              {results.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => selectStudent(s)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-muted/50"
                  >
                    <UserAvatar
                      user={asUser(s)}
                      size={36}
                      className="rounded-full bg-primary/10 text-primary"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {studentNameOf(s)}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.class?.name || "N/A"}
                        {s.section?.name ? ` · ${s.section.name}` : ""} · Roll {s.rollNo ?? "—"}
                      </span>
                    </span>
                    <span className="font-mono text-xs font-bold text-primary">
                      {s.studentCode}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Last receipt */}
      {lastReceipt && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="mt-0.5 text-lg text-emerald-600" />
            <div className="text-xs">
              <p className="font-bold text-emerald-700 dark:text-emerald-400">
                {isBn
                  ? `${money(lastReceipt.amount)} নগদ গ্রহণ সম্পন্ন`
                  : `${money(lastReceipt.amount)} cash received`}
              </p>
              <p className="mt-0.5 text-muted-foreground">
                {lastReceipt.studentName} · {lastReceipt.invoiceNo} ·{" "}
                {lastReceipt.fullyPaid
                  ? isBn
                    ? "সম্পূর্ণ পরিশোধিত"
                    : "Fully paid"
                  : isBn
                    ? `বাকি ${money(lastReceipt.remaining)}`
                    : `${money(lastReceipt.remaining)} still due`}
              </p>
            </div>
          </div>
          <p className="font-mono text-xs font-bold text-foreground">
            {isBn ? "রসিদ আইডি:" : "Receipt ID:"} {lastReceipt.receiptId}
          </p>
        </div>
      )}

      {/* Selected student */}
      {student && (
        <div className="space-y-6">
          <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <UserAvatar
                  user={asUser(student)}
                  size={56}
                  className="rounded-2xl bg-primary/10 text-primary"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-foreground">
                    {studentNameOf(student)}
                  </h2>
                  <p className="font-mono text-xs font-bold text-primary">
                    {student.studentCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {student.class?.name || "N/A"}
                    {student.section?.name ? ` · ${student.section.name}` : ""} · Roll{" "}
                    {student.rollNo ?? "—"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {isBn ? "মোট" : "Total"}
                  </p>
                  <p className="font-mono text-lg font-extrabold text-foreground">{money(totalAmount)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {isBn ? "পরিশোধিত" : "Paid"}
                  </p>
                  <p className="font-mono text-lg font-extrabold text-emerald-600">{money(totalPaid)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {isBn ? "বকেয়া" : "Due"}
                  </p>
                  <p className="font-mono text-lg font-extrabold text-destructive">{money(totalDue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                  <FaReceipt className="text-primary" />
                  <span>{isBn ? "ইনভয়েসসমূহ" : "Invoices"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => loadInvoices(student.id, true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition hover:bg-muted"
                >
                  <FaSyncAlt />
                  <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
                </button>
              </div>

              {invoicesLoading ? (
                <div className="flex items-center justify-center gap-2 p-8 text-xs text-muted-foreground">
                  <FaSpinner className="animate-spin text-primary" />
                  <span>{isBn ? "ইনভয়েস লোড হচ্ছে..." : "Loading invoices..."}</span>
                </div>
              ) : invoices.length === 0 ? (
                <div className="space-y-2 py-8 text-center text-xs text-muted-foreground">
                  <p>
                    {isBn
                      ? "এই শিক্ষার্থীর কোনো ইনভয়েস নেই।"
                      : "This student has no invoices yet."}
                  </p>
                  <Link
                    href="/Dashboard/payments/create-invoice"
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {isBn ? "আগে ইনভয়েস তৈরি করুন" : "Create an invoice first"}
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <th className="px-3 py-3">{isBn ? "ইনভয়েস" : "Invoice"}</th>
                        <th className="px-3 py-3">{isBn ? "শেষ তারিখ" : "Due Date"}</th>
                        <th className="px-3 py-3 text-right">{isBn ? "মোট" : "Total"}</th>
                        <th className="px-3 py-3 text-right">{isBn ? "পরিশোধিত" : "Paid"}</th>
                        <th className="px-3 py-3 text-right">{isBn ? "বকেয়া" : "Due"}</th>
                        <th className="px-3 py-3 text-center">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                        <th className="px-3 py-3 text-center">{isBn ? "অ্যাকশন" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {invoices.map((inv) => {
                        const due = dueOf(inv);
                        const pending = hasPendingTx(inv);
                        const payable = inv.status !== "PAID" && due > 0 && !pending;

                        return (
                          <tr key={inv.id} className="transition-colors hover:bg-muted/20">
                            <td className="px-3 py-3.5">
                              <span className="block font-mono font-bold text-foreground">
                                {inv.invoiceNo}
                              </span>
                              {inv.reason && (
                                <span className="mt-0.5 block max-w-[220px] text-[10px] font-medium leading-snug text-muted-foreground">
                                  {inv.reason}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3.5 font-mono text-muted-foreground">
                              {inv.dueDate
                                ? new Date(inv.dueDate).toLocaleDateString(isBn ? "bn-BD" : "en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "—"}
                            </td>
                            <td className="px-3 py-3.5 text-right font-mono font-bold text-foreground">
                              {money(inv.amount)}
                            </td>
                            <td className="px-3 py-3.5 text-right font-mono font-bold text-emerald-600">
                              {money(inv.paidAmount)}
                            </td>
                            <td className="px-3 py-3.5 text-right font-mono font-bold text-destructive">
                              {money(due)}
                            </td>
                            <td className="px-3 py-3.5 text-center">
                              <InvoiceStatusBadge invoice={inv} isBn={isBn} />
                            </td>
                            <td className="px-3 py-3.5 text-center">
                              {payable ? (
                                <button
                                  type="button"
                                  onClick={() => setCollectingInvoice(inv)}
                                  className="mx-auto inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-emerald-800"
                                >
                                  <FaMoneyBillWave />
                                  <span>{isBn ? "ক্যাশ গ্রহণ" : "Receive Cash"}</span>
                                </button>
                              ) : pending ? (
                                <span className="text-[10px] font-medium text-amber-600">
                                  {isBn ? "অনলাইন পেমেন্ট যাচাই বাকি" : "Online payment awaiting review"}
                                </span>
                              ) : null}
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
      )}

      {/* Receipts recorded in this session */}
      {sessionReceipts.length > 0 && (
        <Card className="rounded-2xl border-border/60 bg-card shadow-sm">
          <CardContent className="space-y-3 p-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                {isBn ? "এই সেশনে গৃহীত ক্যাশ" : "Cash Received This Session"}
              </h3>
              <span className="font-mono text-sm font-extrabold text-emerald-600">
                {money(sessionTotal)}
              </span>
            </div>
            <ul className="divide-y divide-border/40 text-xs">
              {sessionReceipts.map((r) => (
                <li key={r.key} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-foreground">
                      {r.studentName}
                    </span>
                    <span className="block font-mono text-[10px] text-muted-foreground">
                      {r.invoiceNo} · {r.receiptId} · {r.time}
                    </span>
                  </span>
                  <span className="font-mono font-bold text-emerald-600">{money(r.amount)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {collectingInvoice && student && (
        <CashCollectModal
          invoice={collectingInvoice}
          studentName={studentNameOf(student)}
          isBn={isBn}
          onClose={() => setCollectingInvoice(null)}
          onSuccess={handlePaymentRecorded}
        />
      )}
    </div>
  );
}