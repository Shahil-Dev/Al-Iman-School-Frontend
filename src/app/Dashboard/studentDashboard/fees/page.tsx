"use client";

import React, { useEffect, useState } from "react";
import {
  FaFileInvoiceDollar,
  FaSpinner,
  FaMoneyCheckAlt,
  FaReceipt,
  FaExclamationCircle,
  FaCheckCircle,
  FaCreditCard,
  FaClock,
  FaUpload,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";
import { paymentService } from "@/src/Services/paymentService";

export default function StudentFeesPage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const isBn = language === "bn";

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "BANK">("BKASH");
  const [transactionId, setTransactionId] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const fetchStudentInvoices = async () => {
    setLoading(true);
    try {
      const studentId = user?.studentId || user?.id;
      if (!studentId) return;

      const res = await paymentService.getStudentInvoices(studentId);
      const data = res?.data || res || [];
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load student invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentInvoices();
    }
  }, [user]);

  // Handle Direct Folder File Upload & Client-Side Image Compression
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Compressed Lightweight Base64 String to prevent 413 Error
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.6);
        setReceiptUrl(compressedDataUrl);
        setPreviewUrl(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Payment Submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (!transactionId.trim()) {
      setErrorMessage(isBn ? "ট্রানজেকশন আইডি (TrxID) প্রদান করুন।" : "Transaction ID is required.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const dueAmount = selectedInvoice.amount - selectedInvoice.paidAmount;

      await paymentService.collectPayment({
        invoiceId: selectedInvoice.id,
        amount: dueAmount,
        method: paymentMethod,
        transactionId: transactionId.trim(),
        receiptUrl: receiptUrl.trim() || undefined,
      });

      setSuccessMessage(
        isBn
          ? "পেমেন্ট সফলভাবে জমা হয়েছে! অ্যাডমিন যাচাই করে অনুমোদন করবেন।"
          : "Payment submitted successfully! Pending admin approval."
      );

      setTimeout(() => {
        setSelectedInvoice(null);
        setTransactionId("");
        setReceiptUrl("");
        setPreviewUrl("");
        setFileName("");
        setSuccessMessage("");
        fetchStudentInvoices();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          (isBn ? "পেমেন্ট জমা দিতে সমস্যা হয়েছে।" : "Failed to submit payment.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = invoices.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
  const totalPaidAmount = invoices.reduce((acc, inv) => acc + (Number(inv.paidAmount) || 0), 0);
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
            <span>{isBn ? "ফি এবং ইনভয়েস বিবরণী" : "Fee Payments & Status"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "তোমার পরিশোধিত ফি, বর্তমান বকেয়া ও ইনভয়েসসমূহ নিচে প্রদান করা হলো।"
              : "Review your payment history, pending tuition fees, and official receipts."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-primary text-lg" />
          <span>{isBn ? "ফি এবং ইনভয়েস লোড হচ্ছে..." : "Loading fee invoices..."}</span>
        </div>
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
                  <span className="text-2xl font-extrabold text-foreground font-mono block">৳{totalAmount}</span>
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
                  <span className="text-2xl font-extrabold text-emerald-600 font-mono block">৳{totalPaidAmount}</span>
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
                  <span className="text-2xl font-extrabold text-destructive font-mono block">৳{dueAmount}</span>
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
                  {isBn ? "কোনো ইনভয়েসের তথ্য পাওয়া যায়নি।" : "No invoices available."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3">{isBn ? "ইনভয়েস নং" : "Invoice No"}</th>
                        <th className="py-3 px-3">{isBn ? "তারিখ" : "Date"}</th>
                        <th className="py-3 px-3 text-right">{isBn ? "মোট ফি" : "Total Fee"}</th>
                        <th className="py-3 px-3 text-right">{isBn ? "পরিশোধিত" : "Paid"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "অ্যাকশন" : "Action"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-sans">
                      {invoices.map((inv: any, idx: number) => {
                        const isPaid = inv.status === "PAID";
                        const hasPendingTx = inv.transactions?.some(
                          (t: any) => t.status === "PENDING_APPROVAL"
                        );

                        return (
                          <tr key={inv.id || idx} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3.5 px-3 font-mono font-bold text-foreground">{inv.invoiceNo}</td>
                            <td className="py-3.5 px-3 text-muted-foreground font-mono">
                              {new Date(inv.createdAt).toLocaleDateString(isBn ? "bn-BD" : "en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-foreground">৳{inv.amount}</td>
                            <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600">৳{inv.paidAmount}</td>
                            <td className="py-3.5 px-3 text-center">
                              {isPaid ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  {isBn ? "পরিশোধিত" : "PAID"}
                                </span>
                              ) : hasPendingTx ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 inline-flex items-center gap-1">
                                  <FaClock /> {isBn ? "অনুমোদনের অপেক্ষায়" : "Pending Approval"}
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                                  {isBn ? "বকেয়া" : "UNPAID"}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {!isPaid && !hasPendingTx && (
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                    setErrorMessage("");
                                    setSuccessMessage("");
                                    setPreviewUrl("");
                                    setReceiptUrl("");
                                    setFileName("");
                                    setTransactionId("");
                                  }}
                                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded-lg font-semibold text-[11px] transition inline-flex items-center justify-center gap-1 mx-auto shadow-sm"
                                >
                                  <FaCreditCard />
                                  <span>{isBn ? "পেমেন্ট করুন" : "Pay Now"}</span>
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

      {/* Optimized Compact Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl overflow-hidden my-auto max-h-[85vh] flex flex-col">
            <div className="p-3 border-b border-border flex justify-between items-center bg-muted/40 shrink-0">
              <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                <FaCreditCard className="text-primary" />
                <span>{isBn ? "ফি পরিশোধ ফরম" : "Submit Payment"}</span>
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-muted-foreground hover:text-foreground p-1 transition"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-4 space-y-3 text-xs overflow-y-auto">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-2.5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? "ইনভয়েস নং:" : "Invoice No:"}</span>
                  <span className="font-mono font-bold">{selectedInvoice.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? "প্রদেয় পরিমাণ:" : "Amount Due:"}</span>
                  <span className="font-mono font-bold text-destructive">
                    ৳{selectedInvoice.amount - selectedInvoice.paidAmount}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-foreground">
                  {isBn ? "পেমেন্ট মেথড:" : "Payment Method:"}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl p-2 font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="BKASH">bKash (Merchant / Personal)</option>
                  <option value="NAGAD">Nagad (Merchant / Personal)</option>
                  <option value="BANK">Bank Transfer / Slip</option>
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1 text-foreground">
                  {isBn ? "ট্রানজেকশন আইডি (TrxID): *" : "Transaction ID (TrxID): *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BKH8923JK2"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl p-2 font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Direct Folder Image Upload (No URL Text Box) */}
              <div>
                <label className="font-bold block mb-1 text-foreground">
                  {isBn ? "রসিদের ছবি (ফোল্ডার থেকে সিলেক্ট করুন):" : "Receipt Image (Select From Folder):"}
                </label>
                <div className="border-2 border-dashed border-input hover:border-primary rounded-xl p-3 text-center cursor-pointer relative bg-background/50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {previewUrl ? (
                    <div className="flex items-center justify-between p-1">
                      <div className="flex items-center gap-2">
                        <img src={previewUrl} alt="Preview" className="h-9 w-9 object-cover rounded-md border" />
                        <span className="text-[10px] text-emerald-600 font-bold truncate max-w-[150px]">
                          {fileName || (isBn ? "ছবি যুক্ত হয়েছে" : "Attached")}
                        </span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <FaCheck className="inline mr-1" /> Ready
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground py-1">
                      <FaUpload className="text-primary" />
                      <span className="text-[11px] font-semibold text-foreground">
                        {isBn ? "ফোল্ডার থেকে ছবি বেছে নিন" : "Select Image from Folder"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {errorMessage && (
                <div className="p-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-[10px]">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-[10px]">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-xl font-bold transition flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>{isBn ? "জমা হচ্ছে..." : "Submitting..."}</span>
                  </>
                ) : (
                  <span>{isBn ? "পেমেন্ট প্রুফ জমা দিন" : "Submit Payment Proof"}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}