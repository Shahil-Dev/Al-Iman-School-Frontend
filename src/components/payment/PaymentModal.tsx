"use client";

import React, { useState } from "react";
import {
  FaCheck,
  FaCopy,
  FaCreditCard,
  FaInfoCircle,
  FaShieldAlt,
  FaSpinner,
  FaTimes,
  FaUpload,
} from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import {
  ICollectPaymentPayload,
  paymentService,
} from "@/src/Services/paymentService";
import { BANK_INFO, MOBILE_BANKING_INFO } from "@/src/lib/schoolPaymentInfo";

type PayMethod = "BKASH" | "NAGAD" | "SSLCOMMERZ" | "CASH";

interface PaymentModalProps {
  invoice: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({
  invoice,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [method, setMethod] = useState<PayMethod>("BKASH");
  const [transactionId, setTransactionId] = useState("");
  const [senderAccountNo, setSenderAccountNo] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const isCash = method === "CASH";
  const isBank = method === "SSLCOMMERZ";
  const isMobile = !isCash && !isBank;

  const dueAmount = Math.max(
    0,
    Number(invoice.amount) - Number(invoice.paidAmount || 0),
  );

  const handleMethodChange = (next: PayMethod) => {
    setMethod(next);
    // Reset method-specific fields so stale values are never submitted
    setTransactionId("");
    setSenderAccountNo("");
    setErrorMessage("");
  };

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  };

  const renderCopyButton = (key: string, value: string) => (
    <button
      type="button"
      onClick={() => handleCopy(key, value)}
      className="ml-1 text-primary hover:opacity-80 cursor-pointer"
      title="Copy"
    >
      {copiedKey === key ? <FaCheck /> : <FaCopy />}
    </button>
  );

  // Compress the selected receipt image on the client to avoid large payloads
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
        const MAX = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX) {
            height *= MAX / width;
            width = MAX;
          }
        } else if (height > MAX) {
          width *= MAX / height;
          height = MAX;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        setReceiptUrl(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCash) return;

    if (isMobile && !transactionId.trim()) {
      setErrorMessage(
        isBn
          ? "ট্রানজেকশন আইডি (TrxID) প্রদান করুন।"
          : "Transaction ID is required.",
      );
      return;
    }

    if (isBank && !senderAccountNo.trim()) {
      setErrorMessage(
        isBn
          ? "আপনার ব্যাংক অ্যাকাউন্ট নম্বর দিন।"
          : "Your bank account number is required.",
      );
      return;
    }

    if (!agreed) {
      setErrorMessage(
        isBn
          ? "দয়া করে অঙ্গীকারনামায় টিক চিহ্ন দিন।"
          : "Please agree to the declaration.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const payload: ICollectPaymentPayload = {
        invoiceId: invoice.id,
        amount: dueAmount,
        method,
        transactionId: isMobile ? transactionId.trim() : undefined,
        senderAccountNo: isBank ? senderAccountNo.trim() : undefined,
        receiptUrl: receiptUrl || undefined,
      };

      await paymentService.collectPayment(payload);

      setSuccessMessage(
        isBn
          ? "পেমেন্ট সফলভাবে জমা হয়েছে! অ্যাডমিন যাচাই করে অনুমোদন করবেন।"
          : "Payment submitted successfully! Pending admin approval.",
      );

      setTimeout(onSuccess, 1800);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          (isBn
            ? "পেমেন্ট জমা দিতে সমস্যা হয়েছে।"
            : "Failed to submit payment."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-input rounded-xl p-2 font-mono text-foreground focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        <div className="p-3 border-b border-border flex justify-between items-center bg-muted/40 shrink-0">
          <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
            <FaCreditCard className="text-primary" />
            <span>{isBn ? "ফি পরিশোধ ফরম" : "Submit Payment"}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 transition"
          >
            <FaTimes />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-3 text-xs overflow-y-auto"
        >
          {/* Invoice summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-2.5 space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {isBn ? "ইনভয়েস নং:" : "Invoice No:"}
              </span>
              <span className="font-mono font-bold">{invoice.invoiceNo}</span>
            </div>

            {invoice.reason && (
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {isBn ? "বিবরণ:" : "Reason:"}
                </span>
                <span className="text-right font-semibold">
                  {invoice.reason}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {isBn ? "প্রদেয় পরিমাণ:" : "Amount Due:"}
              </span>
              <span className="font-mono font-bold text-destructive">
                ৳{dueAmount}
              </span>
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="font-bold block mb-1 text-foreground">
              {isBn ? "পেমেন্ট মেথড:" : "Payment Method:"}
            </label>
            <select
              value={method}
              onChange={(e) => handleMethodChange(e.target.value as PayMethod)}
              className="w-full bg-background border border-input rounded-xl p-2 font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="BKASH">bKash</option>
              <option value="NAGAD">Nagad</option>
              <option value="SSLCOMMERZ">Bank (IBBL)</option>
              <option value="CASH">Cash (School Office)</option>
            </select>
          </div>

          {/* bKash / Nagad instructions */}
          {isMobile && (
            <div className="p-3 rounded-xl bg-background border border-primary/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <FaInfoCircle className="text-primary" />
                <span>
                  {isBn
                    ? `${method === "BKASH" ? "bKash" : "Nagad"} এর মাধ্যমে পেমেন্টের নিয়ম`
                    : `How to pay via ${method === "BKASH" ? "bKash" : "Nagad"}`}
                </span>
              </div>
              <div className="flex items-center justify-between bg-primary/10 text-foreground px-2.5 py-1.5 rounded-lg font-mono font-bold">
                <span>{MOBILE_BANKING_INFO.displayNumber}</span>
                {renderCopyButton("mobile", MOBILE_BANKING_INFO.rawNumber)}
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground font-medium">
                <li>
                  {isBn
                    ? `${method === "BKASH" ? "bKash" : "Nagad"} অ্যাপ বা ডায়াল কোডে "Send Money" সিলেক্ট করুন।`
                    : `Open the ${method === "BKASH" ? "bKash" : "Nagad"} app or dial code and choose "Send Money".`}
                </li>
                <li>
                  {isBn
                    ? "উপরের পার্সোনাল নম্বরে প্রদেয় পরিমাণ পাঠান:"
                    : "Send the amount due to the personal number above:"}{" "}
                  <span className="font-mono font-bold text-foreground">
                    ৳{dueAmount}
                  </span>
                </li>
                <li>
                  {isBn
                    ? "SMS-এ পাওয়া ট্রানজেকশন আইডি (TrxID) নিচের ঘরে দিন।"
                    : "Copy the TrxID from the confirmation SMS into the field below."}
                </li>
              </ol>
            </div>
          )}

          {/* Bank instructions */}
          {isBank && (
            <div className="p-3 rounded-xl bg-background border border-primary/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <FaInfoCircle className="text-primary" />
                <span>
                  {isBn
                    ? "ব্যাংকের মাধ্যমে পেমেন্টের নিয়ম"
                    : "How to pay via Bank"}
                </span>
              </div>
              <div className="space-y-1 font-medium">
                <p>
                  <span className="text-muted-foreground">
                    {isBn ? "ব্যাংক: " : "Bank: "}
                  </span>
                  <span className="font-bold text-foreground">
                    {BANK_INFO.bankName}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">
                    {isBn ? "অ্যাকাউন্টের নাম: " : "Account Name: "}
                  </span>
                  <span className="font-bold text-foreground">
                    {BANK_INFO.accountName}
                  </span>
                </p>
              </div>
              <div className="flex items-center justify-between bg-primary/10 text-foreground px-2.5 py-1.5 rounded-lg font-mono font-bold">
                <span>A/C: {BANK_INFO.accountNo}</span>
                {renderCopyButton("bank", BANK_INFO.accountNo)}
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground font-medium">
                <li>
                  {isBn
                    ? "উপরের অ্যাকাউন্টে ব্যাংক ট্রান্সফার বা সরাসরি জমা দিন:"
                    : "Transfer or deposit to the account above:"}{" "}
                  <span className="font-mono font-bold text-foreground">
                    ৳{dueAmount}
                  </span>
                </li>
                <li>
                  {isBn
                    ? "যে অ্যাকাউন্ট থেকে পাঠিয়েছেন তার নম্বর নিচের ঘরে দিন।"
                    : "Enter the account number you paid from in the field below."}
                </li>
                <li>
                  {isBn
                    ? "ব্যাংকের জমা স্লিপ সংরক্ষণ করুন এবং সম্ভব হলে ছবি যুক্ত করুন।"
                    : "Keep the bank slip and attach its photo if possible."}
                </li>
              </ol>
            </div>
          )}

          {/* Cash instructions: no payment can be submitted online */}
          {isCash && (
            <div className="p-3 rounded-xl bg-background border border-primary/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <FaInfoCircle className="text-primary" />
                <span>
                  {isBn ? "ক্যাশে পেমেন্টের নিয়ম" : "How to pay in cash"}
                </span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground font-medium">
                <li>
                  {isBn
                    ? "প্রদেয় অর্থ স্কুল অফিসে সরাসরি জমা দিন:"
                    : "Pay the amount directly at the school office:"}{" "}
                  <span className="font-mono font-bold text-foreground">
                    ৳{dueAmount}
                  </span>
                </li>
                <li>
                  {isBn
                    ? "স্কুল কর্তৃপক্ষ পেমেন্ট এন্ট্রি করলে আপনার ড্যাশবোর্ডে স্বয়ংক্রিয়ভাবে আপডেট হবে।"
                    : "Once the school records your payment, this dashboard updates automatically."}
                </li>
                <li>
                  {isBn
                    ? "এখানে ক্যাশ পেমেন্টের জন্য কিছু জমা দিতে হবে না।"
                    : "Nothing needs to be submitted here for cash payments."}
                </li>
              </ol>
            </div>
          )}

          {/* TrxID: bKash / Nagad only */}
          {isMobile && (
            <div>
              <label className="font-bold block mb-1 text-foreground">
                {isBn
                  ? "ট্রানজেকশন আইডি (TrxID): *"
                  : "Transaction ID (TrxID): *"}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BKH8923JK2"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className={`${inputClass} uppercase`}
              />
            </div>
          )}

          {/* Sender account number: bank only */}
          {isBank && (
            <div>
              <label className="font-bold block mb-1 text-foreground">
                {isBn
                  ? "আপনার ব্যাংক অ্যাকাউন্ট নম্বর (যেখান থেকে পাঠিয়েছেন): *"
                  : "Your Bank Account Number (paid from): *"}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 20501234567890123"
                value={senderAccountNo}
                onChange={(e) => setSenderAccountNo(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {/* Receipt image: bKash / Nagad / Bank */}
          {!isCash && (
            <div>
              <label className="font-bold block mb-1 text-foreground">
                {isBn
                  ? isBank
                    ? "জমা স্লিপের ছবি (ঐচ্ছিক):"
                    : "রসিদের ছবি (ঐচ্ছিক):"
                  : isBank
                    ? "Deposit Slip Image (optional):"
                    : "Receipt Image (optional):"}
              </label>
              <div className="border-2 border-dashed border-input hover:border-primary rounded-xl p-3 text-center cursor-pointer relative bg-background/50 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {receiptUrl ? (
                  <div className="flex items-center justify-between p-1">
                    <div className="flex items-center gap-2">
                      <img
                        src={receiptUrl}
                        alt="Preview"
                        className="h-9 w-9 object-cover rounded-md border"
                      />
                      <span className="text-[10px] text-emerald-600 font-bold truncate max-w-[170px]">
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
                      {isBn ? "ছবি বেছে নিন" : "Select Image"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Declaration */}
          {!isCash && (
            <label className="flex items-start gap-2.5 cursor-pointer select-none p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-foreground font-medium leading-relaxed">
                <strong className="font-bold flex items-center gap-1.5 mb-0.5">
                  <FaShieldAlt className="text-emerald-600" />
                  {isBn ? "অঙ্গীকারনামা:" : "Declaration:"}
                </strong>
                {isBn
                  ? "আমি নিশ্চিত করছি যে উপরে প্রদত্ত পেমেন্ট সংক্রান্ত সকল তথ্য সত্য ও সঠিক। ভুল বা ভুয়া তথ্যের জন্য আল-ঈমান স্কুল এন্ড কলেজ কর্তৃপক্ষ দায়ী থাকবে না।"
                  : "I confirm that all payment details provided above are true and correct. The school authority shall not be held liable for any incorrect information."}
              </span>
            </label>
          )}

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

          {isCash ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-muted text-foreground hover:bg-muted/80 py-2 rounded-xl font-bold transition"
            >
              {isBn ? "বন্ধ করুন" : "Close"}
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || !!successMessage}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 py-2 rounded-xl font-bold transition flex items-center justify-center gap-2 mt-2"
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
          )}
        </form>
      </div>
    </div>
  );
}
