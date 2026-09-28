"use client";

import React, { useState } from "react";
import { FaMoneyBillWave, FaSearch, FaCheck, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function CollectFeePage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [studentIdNoInput, setStudentIdNoInput] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Form Fields
  const [method, setMethod] = useState<"BKASH" | "NAGAD" | "CASH">("BKASH");
  const [amount, setAmount] = useState<number>(0);
  const [transactionId, setTransactionId] = useState("");

  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSearchStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdNoInput.trim()) return;

    try {
      setSearching(true);
      setMsg(null);
      setInvoices([]);
      setSelectedInvoice(null);

      // Fetch student invoices via studentId or studentIdNo
      const res = await axiosInstance.get(`/payments/student/${studentIdNoInput.trim()}`);
      const data = res.data?.data || [];
      setInvoices(data);

      if (data.length === 0) {
        setMsg({
          type: "error",
          text: isBn ? "এই শিক্ষার্থীর কোনো ইনভয়েস পাওয়া যায়নি।" : "No invoices found for this student.",
        });
      }
    } catch (err: any) {
      setMsg({
        type: "error",
        text: isBn ? "ইনভয়েস লোড করতে সমস্যা হয়েছে।" : "Failed to fetch student invoices.",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (method !== "CASH" && !transactionId.trim()) {
      setMsg({
        type: "error",
        text: isBn ? "বিকাশ বা নগদের ট্রানজেকশন আইডি (TrxID) প্রদান করুন।" : "Please provide TrxID.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMsg(null);

      await axiosInstance.post("/payments/collect", {
        invoiceId: selectedInvoice.id,
        amount: Number(amount),
        method,
        transactionId: method !== "CASH" ? transactionId.trim() : undefined,
      });

      setMsg({
        type: "success",
        text: isBn
          ? "পেমেন্ট সফলভাবে গৃহীত হয়েছে এবং হোয়াটসঅ্যাপে নিশ্চিতকরণ রসিদ পাঠানো হয়েছে!"
          : "Payment processed successfully and WhatsApp receipt sent!",
      });

      setSelectedInvoice(null);
      setTransactionId("");
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || (isBn ? "পেমেন্ট প্রক্রিয়াজাতকরণ ব্যর্থ হয়েছে।" : "Failed to process payment."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <FaMoneyBillWave className="text-primary" />
          <span>{isBn ? "ফি কালেকশন ও পেমেন্ট অনলাইন" : "Collect Fee & Record Payment"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "স্টুডেন্ট আইডি দিয়ে বিকাশ/নগদ এর TrxID প্রদান করে ফি পরিশোধ করুন।"
            : "Search student invoice and submit bKash/Nagad Transaction ID."}
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
            msg.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {msg.type === "success" ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Search Student Card */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSearchStudent} className="flex gap-3">
            <input
              type="text"
              placeholder={isBn ? "শিক্ষার্থীর আইডি নং লিখুন (যেমন: STU-101)..." : "Enter Student ID No..."}
              value={studentIdNoInput}
              onChange={(e) => setStudentIdNoInput(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
            >
              <FaSearch />
              <span>{searching ? (isBn ? "খোঁজা হচ্ছে..." : "Searching...") : isBn ? "ইনভয়েস খুঁজুন" : "Search"}</span>
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Invoices List */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map((inv) => (
            <Card
              key={inv.id}
              className={`border-border/60 shadow-sm rounded-2xl bg-card p-5 ${
                inv.status === "PAID" ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-amber-500"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-sm text-foreground">{inv.invoiceNo}</span>
                  <p className="text-[10px] text-muted-foreground">
                    Due: {new Date(inv.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    inv.status === "PAID"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {inv.status}
                </span>
              </div>

              <div className="text-xs space-y-1 mb-4">
                <p>
                  Total Amount: <strong>৳{inv.amount}</strong>
                </p>
                <p>
                  Paid Amount: <strong>৳{inv.paidAmount}</strong>
                </p>
              </div>

              {inv.status !== "PAID" && (
                <button
                  onClick={() => {
                    setSelectedInvoice(inv);
                    setAmount(inv.amount - inv.paidAmount);
                  }}
                  className="w-full py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <FaCheck />
                  <span>{isBn ? "এই বিল পরিশোধ করুন" : "Pay This Invoice"}</span>
                </button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Payment Processing Form Modal/Box */}
      {selectedInvoice && (
        <Card className="border-2 border-primary/40 shadow-lg rounded-2xl bg-card max-w-2xl">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-foreground">
              {isBn ? "পেমেন্ট কনফার্মেশন ফর্ম" : "Process Payment for"} ({selectedInvoice.invoiceNo})
            </h3>

            <form onSubmit={handleCollectPayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {isBn ? "পেমেন্ট মেথড (Payment Method)" : "Payment Method"}
                </label>
                <select
                  value={method}
                  onChange={(e: any) => setMethod(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                >
                  <option value="BKASH">bKash (বিকাশ)</option>
                  <option value="NAGAD">Nagad (নগদ)</option>
                  <option value="CASH">Cash (ক্যাশ ফি)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {isBn ? "পরিশোধিত টাকার পরিমাণ (৳)" : "Amount (৳)"}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              {method !== "CASH" && (
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {isBn ? "ট্রানজেকশন আইডি (TrxID)" : "Transaction ID (TrxID)"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BXA987654321"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
              >
                {submitting ? (isBn ? "পেমেন্ট হচ্ছে..." : "Processing...") : isBn ? "পেমেন্ট নিশ্চিত করুন" : "Confirm Payment"}
              </button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}