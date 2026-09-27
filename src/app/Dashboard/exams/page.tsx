"use client";

import React, { useEffect, useState } from "react";
import { FaBook, FaPlus, FaCalendarAlt, FaSync } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

interface IAcademicYear {
  id: string;
  year: number | string;
  title?: string;
}

interface IExam {
  id: string;
  name: string;
  createdAt: string;
  academicYear?: IAcademicYear;
}

export default function ExamManagementPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [exams, setExams] = useState<IExam[]>([]);
  const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [examName, setExamName] = useState("");
  const [selectedYearId, setSelectedYearId] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchExamsAndYears = async () => {
    try {
      setLoading(true);
      const [examRes, yearRes] = await Promise.all([
        axiosInstance.get("/exams"),
        axiosInstance.get("/academic/years").catch(() => ({ data: { data: [] } })),
      ]);
      setExams(examRes.data?.data || []);
      setAcademicYears(yearRes.data?.data || []);
    } catch (err: any) {
      console.error("Failed to load exams", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamsAndYears();
  }, []);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName || !selectedYearId) {
      setMsg({ type: "error", text: isBn ? "সকল তথ্য সঠিকভাবে দিন।" : "Please fill in all fields." });
      return;
    }

    try {
      setSubmitting(true);
      setMsg(null);
      await axiosInstance.post("/exams/create-exam", {
        name: examName,
        academicYearId: selectedYearId,
      });

      setMsg({ type: "success", text: isBn ? "পরীক্ষা সফলভাবে তৈরি হয়েছে!" : "Exam created successfully!" });
      setExamName("");
      fetchExamsAndYears();
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || (isBn ? "পরীক্ষা তৈরি করতে ব্যর্থ হয়েছে।" : "Failed to create exam."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            {isBn ? "পরীক্ষা ব্যবস্থাপনা" : "Exam Management"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn ? "নতুন পরীক্ষা সেটআপ করুন এবং বিদ্যমান পরীক্ষাগুলো দেখুন।" : "Create and manage academic examinations."}
          </p>
        </div>

        <button
          onClick={fetchExamsAndYears}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all flex items-center gap-2 shadow-sm"
        >
          <FaSync className={`text-xs ${loading ? "animate-spin text-primary" : ""}`} />
          <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold border ${
            msg.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Exam Form */}
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <FaPlus className="text-primary text-xs" />
              <span>{isBn ? "নতুন পরীক্ষা যোগ করুন" : "Create New Exam"}</span>
            </h3>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {isBn ? "পরীক্ষার নাম" : "Exam Name"}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? "যেমন: অর্ধ-বার্ষিকী পরীক্ষা ২০২৬" : "e.g., Half-Yearly Exam 2026"}
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {isBn ? "শিক্ষাবর্ষ (Academic Year)" : "Academic Year"}
                </label>
                <select
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                >
                  <option value="">{isBn ? "-- শিক্ষাবর্ষ সিলেক্ট করুন --" : "-- Select Year --"}</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.year} {year.title ? `(${year.title})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
              >
                {submitting ? (isBn ? "সেভ হচ্ছে..." : "Creating...") : isBn ? "পরীক্ষা তৈরি করুন" : "Create Exam"}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Exam List */}
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <FaBook className="text-primary text-xs" />
              <span>{isBn ? "পরীক্ষাসমূহের তালিকা" : "Existing Examinations"}</span>
            </h3>

            {loading ? (
              <p className="text-xs text-muted-foreground py-4">{isBn ? "লোড হচ্ছে..." : "Loading exams..."}</p>
            ) : exams.length > 0 ? (
              <div className="space-y-3">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/40 text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground text-sm">{exam.name}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <FaCalendarAlt className="text-primary/70" />
                        <span>Year: {exam.academicYear?.year || "N/A"}</span>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4">
                {isBn ? "কোনো পরীক্ষা পাওয়া যায়নি।" : "No exams created yet."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}