"use client";

import React, { useEffect, useState } from "react";
import {
  FaFileInvoiceDollar,
  FaReceipt,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaCreditCard,
  FaUpload,
  FaTimes,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { paymentService } from "@/src/Services/paymentService";

export default function ParentFeesPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [invoiceLoading, setInvoiceLoading] = useState<boolean>(false);

  // Payment Modal States
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "BKASH" | "NAGAD" | "BANK"
  >("BKASH");
  const [transactionId, setTransactionId] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

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
  const fetchInvoicesForChild = async (childId: string) => {
    setInvoiceLoading(true);
    try {
      const res = await paymentService.getStudentInvoices(childId);
      const invoiceList = res?.data || res || [];
      setInvoices(Array.isArray(invoiceList) ? invoiceList : []);
    } catch (err) {
      console.error("Failed to load invoices", err);
      setInvoices([]);
    } finally {
      setInvoiceLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild?.id) {
      fetchInvoicesForChild(selectedChild.id);
    }
  }, [selectedChild]);

  // Handle Payment Submit
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    if (!transactionId.trim()) {
      setErrorMessage(
        isBn
          ? "ট্রানজেকশন আইডি (TrxID) প্রদান করুন।"
          : "Transaction ID is required.",
      );
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
          ? "পেমেন্ট সফলভাবে জমা হয়েছে! অ্যাডমিন যাচাই করে অনুমোদন করবেন।"
          : "Payment submitted successfully! Pending admin approval.",
      );

      setTimeout(() => {
        setSelectedInvoice(null);
        setTransactionId("");
        setReceiptUrl("");
        setSuccessMessage("");
        if (selectedChild?.id) {
          fetchInvoicesForChild(selectedChild.id);
        }
      }, 2000);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          (isBn
            ? "পেমেন্ট জমা দিতে সমস্যা হয়েছে।"
            : "Failed to submit payment."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate Totals
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

          {/* Invoices List Table */}
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-3">
                <FaReceipt className="text-primary" />
                <span>
                  {isBn
                    ? "ফি বিবরণী ও রসিদ তালিকা"
                    : "Invoice History & Receipts"}
                </span>
              </h3>

              {invoiceLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-primary" />
                  <span>
                    {isBn
                      ? "ইনভয়েস লোড হচ্ছে..."
                      : "Fetching invoice records..."}
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
                            <td className="py-3.5 px-3 text-center">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  <FaCheckCircle /> {isBn ? "পরিশোধিত" : "PAID"}
                                </span>
                              ) : hasPendingTx ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                  <FaClock />{" "}
                                  {isBn
                                    ? "অনুমোদনের অপেক্ষায়"
                                    : "Pending Approval"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                                  <FaExclamationCircle />
                                  <span>
                                    {inv.status === "OVERDUE"
                                      ? isBn
                                        ? "মেয়াদোত্তীর্ণ"
                                        : "OVERDUE"
                                      : isBn
                                        ? "বকেয়া"
                                        : "UNPAID"}
                                  </span>
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
                                  }}
                                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded-lg font-semibold text-[11px] transition flex items-center justify-center gap-1 mx-auto shadow-sm"
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

      {/* Online Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/40">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
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

            {/* Modal Form */}
            <form
              onSubmit={handlePaymentSubmit}
              className="p-5 space-y-4 text-xs"
            >
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isBn ? "ইনভয়েস নং:" : "Invoice No:"}
                  </span>
                  <span className="font-mono font-bold">
                    {selectedInvoice.invoiceNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isBn ? "প্রদেয় পরিমাণ:" : "Amount Due:"}
                  </span>
                  <span className="font-mono font-bold text-destructive text-sm">
                    ৳{selectedInvoice.amount - selectedInvoice.paidAmount}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="font-bold block mb-1 text-foreground">
                  {isBn
                    ? "পেমেন্ট মেথড নির্বাচন করুন:"
                    : "Select Payment Method:"}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl p-2.5 font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="BKASH">bKash (Merchant / Personal)</option>
                  <option value="NAGAD">Nagad (Merchant / Personal)</option>
                  <option value="BANK">Bank Transfer / Slip</option>
                </select>
              </div>

              {/* Instructions */}
              <div className="bg-muted/50 p-3 rounded-xl text-[11px] text-muted-foreground space-y-1">
                <p className="font-bold text-foreground">
                  {paymentMethod === "BANK"
                    ? isBn
                      ? "ডাচ-বাংলা ব্যাংক লিমিটেড:"
                      : "Dutch-Bangla Bank Ltd:"
                    : isBn
                      ? "মার্চেন্ট/পার্সোনাল নম্বর:"
                      : "Merchant/Personal Number:"}
                </p>
                <p className="font-mono font-bold text-primary">
                  {paymentMethod === "BANK"
                    ? "A/C: 123-456-7890-1"
                    : "01700-000000"}
                </p>
                <p>
                  {isBn
                    ? "টাকা পাঠানোর পর প্রাপ্ত Transaction ID (TrxID) নিচে প্রদান করুন।"
                    : "Enter the Transaction ID (TrxID) received after payment below."}
                </p>
              </div>

              {/* Transaction ID Input */}
              <div>
                <label className="font-bold block mb-1 text-foreground">
                  {isBn
                    ? "ট্রানজেকশন আইডি (TrxID / Reference): *"
                    : "Transaction ID (TrxID): *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BKH8923JK2"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl p-2.5 font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {/* Receipt Image URL / Reference Input */}
              <div>
                <label className="font-bold block mb-1 text-foreground">
                  {isBn
                    ? "রসিদের ছবি বা ব্যাংক স্লিপ লিংক (ঐচ্ছিক):"
                    : "Receipt Image URL / Reference (Optional):"}
                </label>
                <input
                  type="text"
                  placeholder={
                    isBn
                      ? "যেমন: ড্রাইভ লিংক বা স্ক্রিনশট লিংক"
                      : "e.g. Google Drive link or image URL"
                  }
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl p-2.5 font-mono text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-[11px]">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-[11px]">
                  {successMessage}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>{isBn ? "জমা হচ্ছে..." : "Submitting..."}</span>
                  </>
                ) : (
                  <span>
                    {isBn ? "পেমেন্ট প্রুফ জমা দিন" : "Submit Payment Proof"}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
