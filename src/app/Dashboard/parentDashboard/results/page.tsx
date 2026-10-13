"use client";

import React, { useEffect, useState } from "react";
import {
  FaPoll,
  FaSpinner,
  FaAward,
  FaFileAlt,
  FaCheckCircle,
  FaPrint,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function ParentResultsPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<any | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [marksheet, setMarksheet] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [marksheetLoading, setMarksheetLoading] = useState<boolean>(false);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [childrenRes, examsRes] = await Promise.all([
          axiosInstance.get("/parents/my-children").catch(() => ({ data: { data: [] } })),
          axiosInstance.get("/exams").catch(() => ({ data: { data: [] } })),
        ]);

        const childList = childrenRes.data?.data || childrenRes.data || [];
        setChildren(Array.isArray(childList) ? childList : []);
        if (childList.length > 0) {
          setSelectedChild(childList[0]);
        }

        const examList = examsRes.data?.data || examsRes.data || [];
        setExams(Array.isArray(examList) ? examList : []);
        if (examList.length > 0) {
          setSelectedExamId(examList[0].id);
        }
      } catch (err) {
        console.error("Failed to load initial results data", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  useEffect(() => {
    if (!selectedChild?.id || !selectedExamId) return;

    setMarksheetLoading(true);
    // Fixed URL path to point to /marks/marksheet/...
    axiosInstance
      .get(`/marks/marksheet/${selectedExamId}/${selectedChild.id}`)
      .then((res) => {
        const markData = res.data?.data || res.data || [];
        setMarksheet(Array.isArray(markData) ? markData : []);
      })
      .catch((err) => {
        console.error("Failed to load marksheet", err);
        setMarksheet([]);
      })
      .finally(() => setMarksheetLoading(false));
  }, [selectedChild, selectedExamId]);

  const totalObtainedMarks = marksheet.reduce(
    (acc, item) => acc + (Number(item.totalMarks) || 0),
    0
  );
  
  const totalGradePoints = marksheet.reduce(
    (acc, item) => acc + (Number(item.gradePoint) || 0),
    0
  );

  const averageGPA =
    marksheet.length > 0 ? (totalGradePoints / marksheet.length).toFixed(2) : "0.00";

  const isPassed =
    marksheet.length > 0 && !marksheet.some((item) => item.grade === "F");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "ফলাফল ও মার্কশিট" : "Results & Marksheet"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaPoll className="text-primary text-lg" />
            <span>{isBn ? "পরীক্ষার নম্বরপত্র" : "Academic Marksheet"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "সন্তানের পরীক্ষাভিত্তিক মার্কস, গ্রেড পয়েন্ট এবং একাডেমিক অগ্রগতি দেখুন।"
              : "Review subject-wise marks, grades, and cumulative performance."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {children.length > 1 && (
            <div className="bg-muted/50 p-2 rounded-xl border border-border">
              <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                {isBn ? "সন্তান" : "Child"}
              </label>
              <select
                value={selectedChild?.id || ""}
                onChange={(e) => {
                  const found = children.find((c) => c.id === e.target.value);
                  if (found) setSelectedChild(found);
                }}
                className="bg-background text-foreground text-xs font-semibold px-2.5 py-1 rounded-lg border border-border focus:outline-none"
              >
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-muted/50 p-2 rounded-xl border border-border">
            <label className="block text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
              {isBn ? "পরীক্ষা নির্বাচন করুন" : "Select Exam"}
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="bg-background text-foreground text-xs font-semibold px-2.5 py-1 rounded-lg border border-border focus:outline-none"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          {marksheet.length > 0 && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center gap-2"
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
          <span>{isBn ? "ডাটা লোড হচ্ছে..." : "Loading examination data..."}</span>
        </div>
      ) : selectedChild ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:hidden">
            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "গড় গ্রেড পয়েন্ট (GPA)" : "Average GPA"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-primary font-mono block">
                  {averageGPA}
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "মোট প্রাপ্ত নম্বর" : "Total Obtained"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono block">
                  {totalObtainedMarks}
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "বিষয় সংখ্যা" : "Total Subjects"}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-mono block">
                  {marksheet.length}
                </span>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
              <CardContent className="p-5 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                  {isBn ? "ফলাফল স্ট্যাটাস" : "Result Status"}
                </span>
                <span
                  className={`text-xl sm:text-2xl font-extrabold font-mono block mt-1 ${
                    isPassed ? "text-emerald-600" : "text-destructive"
                  }`}
                >
                  {marksheet.length === 0
                    ? "N/A"
                    : isPassed
                    ? (isBn ? "উত্তীর্ণ" : "PASSED")
                    : (isBn ? "অকৃতকার্য" : "FAILED")}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Marksheet Card */}
          <Card className="border-2 border-border/80 shadow-2xl rounded-3xl bg-card overflow-hidden p-6 sm:p-10">
            <CardContent className="space-y-8 p-0">
              <div className="text-center space-y-1.5 border-b-2 border-primary/20 pb-6">
                <h2 className="text-2xl font-extrabold text-primary tracking-tight">
                  Al-Iman Academy & High School
                </h2>
                <p className="text-xs text-muted-foreground">
                  Official Academic Transcript for Guardians
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-6 text-xs font-semibold text-foreground">
                  <span><strong>Student:</strong> {selectedChild.firstName} {selectedChild.lastName}</span>
                  <span><strong>ID:</strong> {selectedChild.studentIdNo || selectedChild.studentCode}</span>
                  <span><strong>Class:</strong> {selectedChild.class?.name || "N/A"}</span>
                  <span><strong>Roll:</strong> {selectedChild.rollNo || "N/A"}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-b border-border/40 pb-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <FaFileAlt className="text-primary" />
                  <span>{isBn ? "বিষয়ভিত্তিক নম্বর ও গ্রেড" : "Subject Wise Grades"}</span>
                </h3>
                <span className="text-xs font-bold text-primary">
                  {exams.find((e) => e.id === selectedExamId)?.name || ""}
                </span>
              </div>

              {marksheetLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin text-primary" />
                  <span>{isBn ? "নম্বরপত্র লোড হচ্ছে..." : "Fetching marksheet..."}</span>
                </div>
              ) : marksheet.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-12">
                  {isBn
                    ? "এই পরীক্ষার জন্য এখনও নম্বরপত্র প্রকাশ করা হয়নি।"
                    : "No marksheet available for this selected exam."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border text-muted-foreground uppercase text-[10px] tracking-wider bg-muted/40">
                        <th className="py-3 px-3">{isBn ? "বিষয়" : "Subject"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "পূর্ণমান" : "Full Marks"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "এমটি নম্বর" : "MT Marks"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "টার্মিনাল" : "Terminal"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "মোট নম্বর" : "Total Marks"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "গ্রেড" : "Grade"}</th>
                        <th className="py-3 px-3 text-center">{isBn ? "গ্রেড পয়েন্ট" : "Grade Point"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-sans">
                      {marksheet.map((item: any, idx: number) => {
                        const isFail = item.grade === "F";
                        return (
                          <tr key={item.id || idx} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3.5 px-3 font-bold text-foreground">
                              {item.subject?.name || "Subject"}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono text-muted-foreground">
                              {item.fullMarks || 100}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono text-muted-foreground">
                              {item.mtMarks ?? 0}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono text-muted-foreground">
                              {item.terminal ?? 0}
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono font-bold text-foreground">
                              {item.totalMarks}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-md font-bold text-[11px] ${
                                  isFail
                                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                                    : "bg-primary/10 text-primary border border-primary/20"
                                }`}
                              >
                                {item.grade}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-center font-mono font-semibold text-foreground">
                              {Number(item.gradePoint).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-16 grid grid-cols-2 justify-between items-end text-xs font-semibold text-foreground border-t border-border/60 mt-8">
                <div>
                  <p className="text-muted-foreground">
                    Issue Date: <span className="font-bold text-foreground">{new Date().toLocaleDateString()}</span>
                  </p>
                </div>
                <div className="text-center ml-auto space-y-1">
                  <div className="w-48 border-b-2 border-foreground/50 mx-auto mb-1"></div>
                  <p className="font-extrabold">Headmaster / Principal</p>
                  <p className="text-[10px] text-muted-foreground">Al-Iman Academy & High School</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-8 text-center text-xs text-muted-foreground rounded-2xl border border-border">
          {isBn ? "কোনো সংযুক্ত সন্তানের প্রোফাইল পাওয়া যায়নি।" : "No linked student profile found."}
        </Card>
      )}
    </div>
  );
}