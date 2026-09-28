"use client";

import React, { useEffect, useState } from "react";
import { FaFileInvoiceDollar, FaPlus, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

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

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Set default due date to 10 days from today
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 10);
    setDueDate(defaultDue.toISOString().split("T")[0]);

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

      await axiosInstance.post("/payments/create-invoice", {
        studentId: selectedStudentId,
        amount: Number(amount),
        dueDate,
      });

      setMsg({
        type: "success",
        text: isBn
          ? "ইনভয়েস সফলভাবে তৈরি হয়েছে এবং হোয়াটসঅ্যাপে নোটিফিকেশন পাঠানো হয়েছে!"
          : "Invoice generated successfully and WhatsApp notification sent!",
      });

      setSelectedStudentId("");
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || (isBn ? "ইনভয়েস তৈরি করতে সমস্যা হয়েছে।" : "Failed to generate invoice."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <FaFileInvoiceDollar className="text-primary" />
          <span>{isBn ? "ইনভয়েস তৈরি ও ফি সেটআপ" : "Create Student Invoice"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "মাসের ১ম তারিখে শিক্ষার্থীর ইনভয়েস জেনারেট করুন। এটি হোয়াটসঅ্যাপে অটো-মেসেজ পাঠাবে।"
            : "Generate monthly tuition and fee invoices for students."}
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

      <Card className="border-border/60 shadow-sm rounded-2xl bg-card max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {isBn ? "শ্রেণি (Class)" : "Select Class"}
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
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
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {isBn ? "শিক্ষার্থী (Student)" : "Select Student"}
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
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
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {isBn ? "বেতনের পরিমাণ (Amount in ৳)" : "Fee Amount (৳)"}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {isBn ? "পরিশোধের শেষ তারিখ (Due Date)" : "Due Date"}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaPlus />
              <span>{loading ? (isBn ? "ইনভয়েস তৈরি হচ্ছে..." : "Generating...") : isBn ? "ইনভয়েস সাবমিট করুন" : "Generate Invoice"}</span>
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}