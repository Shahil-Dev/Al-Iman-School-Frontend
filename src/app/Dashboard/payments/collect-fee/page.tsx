"use client";

import React, { useState } from "react";
import { FaMoneyBillWave, FaSearch, FaCheck, FaExclamationTriangle, FaCheckCircle, FaUpload, FaTimes } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { useLanguage } from "@/src/context/LanguageContext";
import { paymentService } from "@/src/Services/paymentService";

export default function CollectFeePage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [studentIdNoInput, setStudentIdNoInput] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Form Fields
  const [method, setMethod] = useState<"BKASH" | "NAGAD" | "BANK" | "CASH">("BKASH");
  const [amount, setAmount] = useState<number>(0);
  const [transactionId, setTransactionId] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

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

      // Using paymentService to fetch student invoices
      const res = await paymentService.getStudentInvoices(studentIdNoInput.trim());
      const data = res?.data || res || [];
      setInvoices(Array.isArray(data) ? data : []);

      if (data.length === 0) {
        setMsg({
          type: "error",
          text: isBn ? "এই শিক্ষার্থীর কোনো ইনভয়েস পাওয়া যায়নি।" : "No invoices found for this student.",
        });
      }
    } catch (err: any) {
      setMsg({
        type: "error",
        text: isBn ? "ইনভয়েস লোড করতে সমস্যা হয়েছে।" : "Failed to fetch student invoices.",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (method !== "CASH" && !transactionId.trim()) {
      setMsg({
        type: "error",
        text: isBn ? "অনলাইন পেমেন্টের জন্য ট্রানজেকশন আইডি (TrxID) প্রদান করুন।" : "Transaction ID is required.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMsg(null);

      await paymentService.collectPayment({
        invoiceId: selectedInvoice.id,
        amount: Number(amount),
        method,
        transactionId: method !== "CASH" ? transactionId.trim() : undefined,
        receiptUrl: receiptUrl.trim() || undefined,
      });

      setMsg({
        type: "success",
        text: isBn
          ? "পেমেন্ট সফলভাবে গৃহীত হয়েছে এবং হোয়াটসঅ্যাপে নিশ্চিতকরণ রসিদ পাঠানো হয়েছে!"
          : "Payment processed successfully and WhatsApp receipt sent!",
      });

      setSelectedInvoice(null);
      setTransactionId("");
      setReceiptUrl("");
      setPreviewUrl("");
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || (isBn ? "পেমেন্ট প্রক্রিয়াজাতকরণ ব্যর্থ হয়েছে।" : "Failed to process payment."),
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
          <span>{isBn ? "ফি কালেকশন ও পেমেন্ট এন্ট্রি" : "Collect Fee & Record Payment"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "স্টুডেন্ট আইডি দিয়ে ইনভয়েস সার্চ করে ক্যাশ বা অনলাইন পেমেন্ট এন্ট্রি দিন।"
            : "Search student invoice and record manual or online payments."}
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
              required
              placeholder={isBn ? "শিক্ষার্থীর আইডি (Student ID/UUID) লিখুন..." : "Enter Student ID/UUID..."}
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
              <span>{searching ? (isBn ? "খোঁজা হচ্ছে..." : "Searching...") : isBn ? "ইনভয়েস খুঁজুন" : "Search"}</span>
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
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-foreground">
                {isBn ? "পেমেন্ট কনফার্মেশন ফরম" : "Process Payment for"} ({selectedInvoice.invoiceNo})
              </h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-muted-foreground hover:text-foreground">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCollectPayment} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  {isBn ? "পেমেন্ট মেথড (Payment Method)" : "Payment Method"}
                </label>
                <select
                  value={method}
                  onChange={(e: any) => setMethod(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-semibold"
                >
                  <option value="BKASH">bKash (বিকাশ)</option>
                  <option value="NAGAD">Nagad (নগদ)</option>
                  <option value="BANK">Bank Transfer (ব্যাংক)</option>
                  <option value="CASH">Cash (ক্যাশ ফি - তাৎক্ষণিক অনুমোদিত)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  {isBn ? "পরিশোধিত টাকার পরিমাণ (৳)" : "Amount (৳)"}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono font-bold"
                />
              </div>

              {method !== "CASH" && (
                <div>
                  <label className="font-semibold text-foreground block mb-1.5">
                    {isBn ? "ট্রানজেকশন আইডি (TrxID) *" : "Transaction ID (TrxID) *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BXA987654321"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                  />
                </div>
              )}

              {/* Direct Folder Image Upload */}
              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  {isBn ? "রসিদের ছবি / স্ক্রিনশট আপলোড করুন:" : "Upload Receipt Screenshot:"}
                </label>
                <div className="border-2 border-dashed border-input hover:border-primary rounded-xl p-4 text-center cursor-pointer relative bg-background transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {previewUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={previewUrl} alt="Preview" className="max-h-20 object-contain rounded-lg border" />
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {isBn ? "ছবি সিলেক্ট হয়েছে (পরিবর্তন করতে ক্লিক করুন)" : "Image selected (Click to replace)"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                      <FaUpload className="text-base text-primary" />
                      <span className="font-semibold text-foreground text-[11px]">
                        {isBn ? "কম্পিউটার থেকে ছবি নির্বাচন করুন" : "Choose image from computer"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (isBn ? "পেমেন্ট প্রসেস হচ্ছে..." : "Processing...") : isBn ? "পেমেন্ট নিশ্চিত করুন" : "Confirm Payment"}
              </button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}