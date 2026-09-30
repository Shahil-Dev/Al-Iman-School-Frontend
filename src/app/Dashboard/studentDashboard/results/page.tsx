"use client";

import React, { useEffect, useState } from "react";
import {
  FaPoll,
  FaSpinner,
  FaAward,
  FaBookOpen,
  FaFileAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";

export default function StudentResultsPage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const isBn = language === "bn";

  const [student, setStudent] = useState<any | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [marksheet, setMarksheet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marksheetLoading, setMarksheetLoading] = useState(false);

  // 1. Fetch Student Profile and All Available Exams
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentId = user?.studentId || user?.id;
        if (!studentId) return;

        // Fetch Student Profile
        const profRes = await axiosInstance.get(`/students/${studentId}`);
        const profile = profRes.data?.data || profRes.data;
        setStudent(profile);

        // Fetch All Exams
        const examRes = await axiosInstance.get("/exams");
        const examData = examRes.data?.data || examRes.data || [];
        const examList = Array.isArray(examData) ? examData : [];
        setExams(examList);

        if (examList.length > 0) {
          setSelectedExamId(examList[0].id);
        }
      } catch (err) {
        console.error("Failed to load exams or student profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // 2. Fetch Marksheet when Selected Exam Changes
  useEffect(() => {
    const fetchMarksheet = async () => {
      const studentId = student?.id || user?.studentId || user?.id;
      if (!selectedExamId || !studentId) return;

      setMarksheetLoading(true);
      try {
        const res = await axiosInstance.get(
          `/exams/marksheet/${selectedExamId}/${studentId}`
        );
        const data = res.data?.data || res.data || [];
        setMarksheet(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch marksheet", err);
        setMarksheet([]);
      } finally {
        setMarksheetLoading(false);
      }
    };

    fetchMarksheet();
  }, [selectedExamId, student, user]);

  // Calculate Overall GPA & Total Marks
  const totalObtainedMarks = marksheet.reduce(
    (acc, curr) => acc + (Number(curr.totalMarks) || 0),
    0
  );
  
  const totalGradePoints = marksheet.reduce(
    (acc, curr) => acc + (Number(curr.gradePoint) || 0),
    0
  );
  
  const calculatedGPA =
    marksheet.length > 0
      ? (totalGradePoints / marksheet.length).toFixed(2)
      : "0.00";

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "আমার ফলাফল" : "My Results"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaPoll className="text-primary text-lg" />
            <span>{isBn ? "পরীক্ষার নম্বর ও মার্কশিট" : "Exam Marksheet & Grades"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "তোমার বিভিন্ন পরীক্ষার প্রকাশিত ফলাফল ও বিষেয়ভিত্তিক নম্বরপত্র দেখো।"
              : "Select an exam to view detailed subject-wise marks and overall GPA."}
          </p>
        </div>

        {/* Exam Selection Dropdown */}
        {exams.length > 0 && (
          <div className="bg-muted/50 p-2.5 rounded-xl border border-border shrink-0 w-full sm:w-auto">
            <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
              {isBn ? "পরীক্ষা নির্বাচন করুন" : "Select Exam"}
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full bg-background text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name || exam.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-primary text-lg" />
          <span>{isBn ? "পরীক্ষার তথ্য লোড হচ্ছে..." : "Loading exam data..."}</span>
        </div>
      ) : (
        <>
          {/* GPA & Marks Summary Cards */}
          {marksheet.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary text-2xl shrink-0">
                    <FaAward />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      {isBn ? "গড় জিপিএ (GPA)" : "Average GPA"}
                    </span>
                    <span className="text-2xl font-extrabold text-primary font-mono block">
                      {calculatedGPA}
                    </span>
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
                      {isBn ? "মোট প্রাপ্ত নম্বর" : "Total Obtained Marks"}
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-600 font-mono block">
                      {totalObtainedMarks}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-muted text-muted-foreground text-2xl shrink-0">
                    <FaBookOpen />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      {isBn ? "মোট বিষয়" : "Total Subjects"}
                    </span>
                    <span className="text-2xl font-extrabold text-foreground font-mono block">
                      {marksheet.length}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Marksheet Table */}
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border/50 pb-4">
                <FaFileAlt className="text-primary" />
                <span>{isBn ? "বিষয়ভিত্তিক নম্বরপত্র" : "Subject Wise Marksheet"}</span>
              </h3>

              {marksheetLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-primary text-base" />
                  <span>{isBn ? "নম্বরপত্র লোড হচ্ছে..." : "Fetching marksheet..."}</span>
                </div>
              ) : marksheet.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {isBn
                    ? "এই পরীক্ষার কোনো নম্বরপত্র এখনো প্রকাশিত হয়নি।"
                    : "No marksheet available for this exam yet."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3">{isBn ? "বিষয়" : "Subject"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "পূর্ণমান" : "Full Marks"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "এমটি নম্বর" : "MT Marks"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "টার্মিনাল" : "Terminal"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "মোট প্রাপ্ত" : "Total Marks"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "গ্রেড" : "Grade"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "গ্রেড পয়েন্ট" : "GPA"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-sans">
                      {marksheet.map((mark: any, idx: number) => {
                        const isFail = mark.grade === "F";
                        return (
                          <tr
                            key={mark.id || idx}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3.5 px-3 font-semibold text-foreground">
                              {mark.subject?.name || "Subject N/A"}
                              {mark.subject?.code && (
                                <span className="block text-[10px] font-mono text-muted-foreground font-normal">
                                  Code: {mark.subject.code}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono text-muted-foreground">
                              {mark.fullMarks || 100}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono text-foreground">
                              {mark.mtMarks ?? 0}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono text-foreground">
                              {mark.terminal ?? 0}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono font-bold text-primary">
                              {mark.totalMarks ?? 0}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isFail
                                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                }`}
                              >
                                {mark.grade || "F"}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono font-bold text-foreground">
                              {Number(mark.gradePoint || 0).toFixed(2)}
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
    </div>
  );
}