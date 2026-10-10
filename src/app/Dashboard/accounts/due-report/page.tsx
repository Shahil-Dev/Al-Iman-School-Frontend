"use client";

import React, { useEffect, useState } from "react";
import { FaExclamationCircle, FaPrint, FaCheck, FaTimes, FaEye, FaClock } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { useLanguage } from "@/src/context/LanguageContext";
import { paymentService } from "@/src/Services/paymentService";

export default function DueReportPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [activeTab, setActiveTab] = useState<"defaulters" | "approvals">("defaulters");
  const [dueInvoices, setDueInvoices] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dueRes, approvalRes] = await Promise.all([
        paymentService.getOverdueDefaulters().catch(() => []),
        paymentService.getPendingApprovals().catch(() => []),
      ]);

      const dueData = dueRes?.data || dueRes || [];
      const approvalData = approvalRes?.data || approvalRes || [];

      setDueInvoices(Array.isArray(dueData) ? dueData : []);
      setPendingApprovals(Array.isArray(approvalData) ? approvalData : []);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveReject = async (transactionId: string, status: "APPROVED" | "REJECTED") => {
    try {
      setActionLoading(transactionId);
      await paymentService.approvePayment({
        transactionId,
        status,
        note: status === "REJECTED" ? "Invalid transaction ID or receipt" : undefined,
      });
      await fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to process transaction status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FaExclamationCircle className="text-amber-500" />
            <span>{isBn ? "বকেয়া রিপোর্ট ও পেমেন্ট অনুমোদন" : "Due Report & Payment Approvals"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "বকেয়া ফি ট্র্যাক করুন এবং শিক্ষার্থীদের অনলাইন পেমেন্ট রসিদ যাচাই করে অনুমোদন দিন।"
              : "Track unpaid student fees and verify online payment submissions."}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition shadow-sm flex items-center gap-2"
        >
          <FaPrint />
          <span>{isBn ? "রিপোর্ট প্রিন্ট করুন" : "Print Report"}</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-border pb-3 print:hidden">
        <button
          onClick={() => setActiveTab("defaulters")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "defaulters"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          {isBn ? `বকেয়া তালিকা (${dueInvoices.length})` : `Overdue Defaulters (${dueInvoices.length})`}
        </button>
        <button
          onClick={() => setActiveTab("approvals")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition relative ${
            activeTab === "approvals"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:text-foreground"
          }`}
        >
          {isBn ? `অনুমোদনের অপেক্ষায় (${pendingApprovals.length})` : `Pending Approvals (${pendingApprovals.length})`}
          {pendingApprovals.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold">
              {pendingApprovals.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Defaulters / Due Report */}
      {activeTab === "defaulters" && (
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              {isBn ? "মেয়াদোত্তীর্ণ ও বকেয়া ইনভয়েসসমূহ" : "Overdue & Unpaid Invoices"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Invoice No</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Class</th>
                    <th className="py-3 px-3">Phone (WhatsApp)</th>
                    <th className="py-3 px-3">Due Amount</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        {isBn ? "লোডিং হচ্ছে..." : "Loading..."}
                      </td>
                    </tr>
                  ) : dueInvoices.length > 0 ? (
                    dueInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-muted/30">
                        <td className="py-3 px-3 font-mono font-bold text-foreground">{inv.invoiceNo}</td>
                        <td className="py-3 px-3 font-semibold text-foreground">
                          {inv.student?.firstName} {inv.student?.lastName}
                        </td>
                        <td className="py-3 px-3">{inv.student?.class?.name || "N/A"}</td>
                        <td className="py-3 px-3 text-primary font-mono">{inv.student?.parent?.phone || inv.student?.phone || "N/A"}</td>
                        <td className="py-3 px-3 font-mono font-bold text-destructive">৳{inv.amount - inv.paidAmount}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        {isBn ? "কোনো বকেয়া পাওয়া যায়নি।" : "No pending due invoices found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Pending Payment Approvals */}
      {activeTab === "approvals" && (
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              {isBn ? "অনলাইন পেমেন্ট ভেরিফিকেশন ও অনুমোদন" : "Pending Payment Approvals"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Invoice No</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">TrxID</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3 text-center">Receipt</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        {isBn ? "লোডিং হচ্ছে..." : "Loading..."}
                      </td>
                    </tr>
                  ) : pendingApprovals.length > 0 ? (
                    pendingApprovals.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/30">
                        <td className="py-3 px-3 font-semibold text-foreground">
                          {tx.invoice?.student?.firstName} {tx.invoice?.student?.lastName}
                          <span className="block text-[10px] text-muted-foreground font-mono">
                            ID: {tx.invoice?.student?.studentIdNo}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold">{tx.invoice?.invoiceNo}</td>
                        <td className="py-3 px-3 font-semibold text-primary">{tx.method}</td>
                        <td className="py-3 px-3 font-mono font-bold text-foreground">{tx.transactionId}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-600">৳{tx.amount}</td>
                        <td className="py-3 px-3 text-center">
                          {tx.receiptUrl ? (
                            <button
                              onClick={() => setSelectedReceipt(tx.receiptUrl)}
                              className="px-2.5 py-1 bg-muted hover:bg-muted/80 rounded-lg text-xs font-semibold text-foreground inline-flex items-center gap-1 mx-auto"
                            >
                              <FaEye /> View
                            </button>
                          ) : (
                            <span className="text-muted-foreground text-[10px]">No image</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center space-x-2">
                          <button
                            onClick={() => handleApproveReject(tx.id, "APPROVED")}
                            disabled={actionLoading === tx.id}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                          >
                            <FaCheck /> {isBn ? "অনুমোদন" : "Approve"}
                          </button>
                          <button
                            onClick={() => handleApproveReject(tx.id, "REJECTED")}
                            disabled={actionLoading === tx.id}
                            className="px-3 py-1 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition shadow-sm disabled:opacity-50"
                          >
                            <FaTimes /> {isBn ? "বাতিল" : "Reject"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        {isBn ? "অনুমোদনের অপেক্ষায় কোনো পেমেন্ট নেই।" : "No pending payment approvals found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-foreground">Payment Receipt Preview</h4>
              <button onClick={() => setSelectedReceipt(null)} className="text-muted-foreground hover:text-foreground">
                <FaTimes />
              </button>
            </div>
            <div className="flex justify-center bg-muted/40 p-2 rounded-xl border">
              <img src={selectedReceipt} alt="Receipt" className="max-h-[60vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}