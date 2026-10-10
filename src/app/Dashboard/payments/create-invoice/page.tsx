"use client";

import React, { useEffect, useState } from "react";
import { FaFileInvoiceDollar, FaPlus, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaLayerGroup } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { useLanguage } from "@/src/context/LanguageContext";
import { paymentService } from "@/src/Services/paymentService";
import axiosInstance from "@/src/lib/axiosInstance";

interface IClass {
  id: string;
  name: string;
}

interface IStudent {
  id: string;
  firstName: string;
  lastName: string;
  studentIdNo: string;
}

export default function CreateInvoicePage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [classes, setClasses] = useState<IClass[]>([]);
  const [students, setStudents] = useState<IStudent[]>([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [amount, setAmount] = useState<number>(1500);
  const [dueDate, setDueDate] = useState<string>("");
  const [bulkDueDate, setBulkDueDate] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 10);
    const dateStr = defaultDue.toISOString().split("T")[0];
    setDueDate(dateStr);
    setBulkDueDate(dateStr);

    axiosInstance
      .get("/academic/classes")
      .then((res) => setClasses(res.data?.data || []))
      .catch((err) => console.error("Failed to load classes", err));
  }, []);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }
    axiosInstance
      .get(`/students?classId=${selectedClassId}`)
      .then((res) => setStudents(res.data?.data || []))
      .catch(() => setStudents([]));
  }, [selectedClassId]);

  // Single Invoice Handler
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !amount || !dueDate) {
      setMsg({
        type: "error",
        text: isBn ? "অনুগ্রহ করে সকল তথ্য সঠিকভাবে প্রদান করুন।" : "Please fill in all required fields.",
      });
      return;
    }

    try {
      setLoading(true);
      setMsg(null);

      await paymentService.createInvoice({
        studentId: selectedStudentId,
        amount: Number(amount),
        dueDate,
      });

      setMsg({
        type: "success",
        text: isBn
          ? "ইনভয়েস সফলভাবে তৈরি হয়েছে এবং হোয়াটসঅ্যাপে নোটিফিকেশন পাঠানো হয়েছে!"
          : "Invoice generated successfully and WhatsApp notification sent!",
      });

      setSelectedStudentId("");
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || (isBn ? "ইনভয়েস তৈরি করতে সমস্যা হয়েছে।" : "Failed to generate invoice."),
      });
    } finally {
      setLoading(false);
    }
  };

  // Bulk Monthly Invoice Generator Handler
  const handleGenerateBulkInvoices = async () => {
    if (!bulkDueDate) return;

    try {
      setBulkLoading(true);
      setMsg(null);

      const res = await paymentService.generateMonthlyInvoices({
        dueDate: bulkDueDate,
      });

      setMsg({
        type: "success",
        text: isBn
          ? `সফলভাবে ${res?.data?.createdCount || 0} জন শিক্ষার্থীর জন্য মাসিক ইনভয়েস জেনারেট হয়েছে!`
          : `Successfully generated monthly invoices for students!`,
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || (isBn ? "বাল্ক ইনভয়েস জেনারেট করতে সমস্যা হয়েছে।" : "Failed to generate bulk invoices."),
      });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <FaFileInvoiceDollar className="text-primary" />
          <span>{isBn ? "ইনভয়েস তৈরি ও ফি জেনারেশন" : "Create Student Invoices"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "একক ইনভয়েস অথবা এক ক্লিকে সব শিক্ষার্থীর জন্য মাসিক বাল্ক ইনভয়েস জেনারেট করুন।"
            : "Generate single invoices or batch monthly invoices for all active students."}
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

      {/* Bulk Monthly Invoice Generator Card */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card max-w-2xl border-l-4 border-l-primary">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FaLayerGroup className="text-primary text-lg" />
            <h3 className="text-sm font-bold text-foreground">
              {isBn ? "অটোমেটিক মাসিক বাল্ক ইনভয়েস জেনারেটর" : "Automated Monthly Bulk Invoice Generator"}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {isBn
              ? "শ্রেণিভিত্তিক ফি স্ট্রাকচার অনুযায়ী সব সক্রিয় শিক্ষার্থীর ইনভয়েস একবারে তৈরি হবে এবং হোয়াটসঅ্যাপে নোটিফিকেশন যাবে।"
              : "Automatically generate invoices for all active students based on class fee structures."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={bulkDueDate}
              onChange={(e) => setBulkDueDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-semibold"
            />
            <button
              onClick={handleGenerateBulkInvoices}
              disabled={bulkLoading}
              className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaPlus />
              <span>
                {bulkLoading
                  ? isBn
                    ? "জেনারেট হচ্ছে..."
                    : "Generating..."
                  : isBn
                  ? "সকলের জন্য ইনভয়েস জেনারেট করুন"
                  : "Generate Bulk Invoices"}
              </span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Single Invoice Form Card */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card max-w-2xl">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">
            {isBn ? "একক ইনভয়েস তৈরি করুন" : "Create Individual Invoice"}
          </h3>
          <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1.5">
                {isBn ? "শ্রেণি নির্বাচন করুন" : "Select Class"}
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-semibold"
              >
                <option value="">{isBn ? "-- শ্রেণি সিলেক্ট করুন --" : "-- Select Class --"}</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1.5">
                {isBn ? "শিক্ষার্থী নির্বাচন করুন" : "Select Student"}
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-semibold"
              >
                <option value="">{isBn ? "-- শিক্ষার্থী সিলেক্ট করুন --" : "-- Select Student --"}</option>
                {students.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.firstName} {std.lastName} ({std.studentIdNo})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  {isBn ? "বেতনের পরিমাণ (৳)" : "Fee Amount (৳)"}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1.5">
                  {isBn ? "পরিশোধের শেষ তারিখ" : "Due Date"}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaPlus />
              <span>{loading ? (isBn ? "ইনভয়েস তৈরি হচ্ছে..." : "Generating...") : isBn ? "ইনভয়েস সাবমিট করুন" : "Generate Invoice"}</span>
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}