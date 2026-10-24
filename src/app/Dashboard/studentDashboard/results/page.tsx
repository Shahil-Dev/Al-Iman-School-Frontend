"use client";

import React, { useEffect, useState } from "react";
import {
  FaPoll,
  FaSpinner,
  FaAward,
  FaBookOpen,
  FaFileAlt,
  FaCheckCircle,
  FaPrint,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/hooks/useUser";

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

  // 1. Fetch Student Profile and Exams
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentId = user?.studentId || user?.id;
        if (!studentId) return;

        const profRes = await axiosInstance.get(`/students/${studentId}`);
        const profile = profRes.data?.data || profRes.data;
        setStudent(profile);

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

  // 2. Fetch Marksheet when Exam or Student changes
  useEffect(() => {
    const fetchMarksheet = async () => {
      const studentId = student?.id || user?.studentId || user?.id;
      if (!selectedExamId || !studentId) return;

      setMarksheetLoading(true);
      try {
        const res = await axiosInstance.get(
          `/marks/marksheet/${selectedExamId}/${studentId}`,
        );
        const data = res.data?.data || res.data || [];
        // Safely map array whether it comes direct or nested
        const marksArray = Array.isArray(data)
          ? data
          : Array.isArray(data.marks)
            ? data.marks
            : [];
        setMarksheet(marksArray);
      } catch (err) {
        console.error("Failed to fetch marksheet", err);
        setMarksheet([]);
      } finally {
        setMarksheetLoading(false);
      }
    };

    fetchMarksheet();
  }, [selectedExamId, student, user]);

  const totalObtainedMarks = marksheet.reduce(
    (acc, curr) => acc + (Number(curr.totalMarks) || 0),
    0,
  );

  const totalGradePoints = marksheet.reduce(
    (acc, curr) => acc + (Number(curr.gradePoint) || 0),
    0,
  );

  const calculatedGPA =
    marksheet.length > 0
      ? (totalGradePoints / marksheet.length).toFixed(2)
      : "0.00";

  const isPassed =
    marksheet.length > 0 && !marksheet.some((item) => item.grade === "F");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "আমার ফলাফল" : "My Results"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaPoll className="text-primary text-lg" />
            <span>
              {isBn ? "পরীক্ষার নম্বর ও মার্কশিট" : "Exam Marksheet & Grades"}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "তোমার বিভিন্ন পরীক্ষার প্রকাশিত ফলাফল ও বিষয়ভিত্তিক নম্বরপত্র দেখো।"
              : "Select an exam to view detailed subject-wise marks and overall GPA."}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {exams.length > 0 && (
            <div className="bg-muted/50 p-2.5 rounded-xl border border-border flex-1 sm:flex-initial">
              <label className="block text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                {isBn ? "পরীক্ষা নির্বাচন করুন" : "Select Exam"}
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full bg-background text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg border border-border focus:outline-none"
              >
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name || exam.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {marksheet.length > 0 && (
            <button
              onClick={handlePrint}
              className="self-end px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:opacity-95 transition-all flex items-center gap-2"
            >
              <FaPrint />
              <span>{isBn ? "প্রিন্ট" : "Print"}</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-primary text-lg" />
          <span>
            {isBn ? "পরীক্ষার তথ্য লোড হচ্ছে..." : "Loading exam data..."}
          </span>
        </div>
      ) : (
        <>
          {marksheet.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:hidden">
              <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary text-2xl shrink-0">
                    <FaAward />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      {isBn ? "গড় জিপিএ (GPA)" : "Average GPA"}
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
                      {isBn ? "মোট প্রাপ্ত নম্বর" : "Total Obtained"}
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
                      {isBn ? "মোট বিষয়" : "Total Subjects"}
                    </span>
                    <span className="text-2xl font-extrabold text-foreground font-mono block">
                      {marksheet.length}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl text-2xl shrink-0 ${
                      isPassed
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    <FaCheckCircle />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      {isBn ? "স্ট্যাটাস" : "Status"}
                    </span>
                    <span
                      className={`text-lg font-extrabold font-mono block ${
                        isPassed ? "text-emerald-600" : "text-destructive"
                      }`}
                    >
                      {isPassed
                        ? isBn
                          ? "উত্তীর্ণ"
                          : "PASSED"
                        : isBn
                          ? "অকৃতকার্য"
                          : "FAILED"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Marksheet Report Card */}
          <Card className="border-2 border-border/80 shadow-xl rounded-3xl bg-card overflow-hidden p-6 sm:p-8">
            <CardContent className="space-y-6 p-0">
              <div className="text-center space-y-1.5 border-b-2 border-primary/20 pb-6">
                <h2 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
                  Al-Iman School & College
                </h2>
                <p className="text-xs text-muted-foreground">
                  Official Academic Transcript & Marksheet
                </p>
                {student && (
                  <div className="pt-2 flex flex-wrap justify-center gap-4 text-xs font-medium text-foreground">
                    <span>
                      <strong>Name:</strong> {student.firstName}{" "}
                      {student.lastName}
                    </span>
                    <span>
                      <strong>ID:</strong>{" "}
                      {student.studentIdNo || student.studentCode}
                    </span>
                    <span>
                      <strong>Class:</strong> {student.class?.name || "N/A"}
                    </span>
                    <span>
                      <strong>Roll:</strong> {student.rollNo || "N/A"}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <FaFileAlt className="text-primary" />
                <span>
                  {isBn
                    ? "বিষয়ভিত্তিক নম্বর ও গ্রেড বিবরণী"
                    : "Subject Wise Grade Report"}
                </span>
              </h3>

              {marksheetLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-primary text-base" />
                  <span>
                    {isBn ? "নম্বরপত্র লোড হচ্ছে..." : "Fetching marksheet..."}
                  </span>
                </div>
              ) : marksheet.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-12">
                  {isBn
                    ? "এই পরীক্ষার কোনো নম্বরপত্র এখনো প্রকাশিত হয়নি।"
                    : "No marksheet available for this exam yet."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/40">
                        <th className="py-3 px-3">
                          {isBn ? "বিষয়" : "Subject"}
                        </th>
                        <th className="py-3 px-3 text-center">
                          {isBn ? "পূর্ণমান" : "Full Marks"}
                        </th>
                        <th className="py-3 px-3 text-center">
                          {isBn ? "এমটি নম্বর" : "MT Marks"}
                        </th>
                        <th className="py-3 px-3 text-center">
                          {isBn ? "টার্মিনাল" : "Terminal"}
                        </th>
                        <th className="py-3 px-3 text-center">
                          {isBn ? "মোট প্রাপ্ত" : "Total Marks"}
                        </th>
                        <th className="py-3 px-3 text-center">
                          {isBn ? "গ্রেড" : "Grade"}
                        </th>
                        <th className="py-3 px-3 text-center">
                          {isBn ? "গ্রেড পয়েন্ট" : "GPA"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-sans">
                      {marksheet.map((mark: any, idx: number) => {
                        const isFail = mark.grade === "F";
                        return (
                          <tr
                            key={mark.id || idx}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3.5 px-3 font-bold text-foreground">
                              {mark.subject?.name || "Subject N/A"}
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
                                className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
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

              {/* Signature Footer */}
              <div className="pt-16 grid grid-cols-2 justify-between items-end text-xs font-semibold text-foreground border-t border-border/60 mt-8">
                <div>
                  <p className="text-muted-foreground">
                    Published Date:{" "}
                    <span className="font-bold text-foreground">
                      {new Date().toLocaleDateString()}
                    </span>
                  </p>
                </div>
                <div className="text-center ml-auto space-y-1">
                  <div className="w-48 border-b-2 border-foreground/50 mx-auto mb-1"></div>
                  <p className="font-extrabold">
                    Principal / Controller of Exams
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                     Al-Iman School & College
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
