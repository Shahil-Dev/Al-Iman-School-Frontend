"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  FaGraduationCap,
  FaPoll,
  FaPrint,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaUniversity,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

interface IExam {
  id: string;
  name: string;
}

interface IClass {
  id: string;
  name: string;
}

interface IStudent {
  id: string;
  firstName: string;
  lastName: string;
  studentIdNo: string;
  rollNo?: number;
}

interface ISubjectMark {
  id: string;
  fullMarks: number;
  mtMarks: number;
  terminal: number;
  totalMarks: number;
  grade: string;
  gradePoint: number;
  subject: {
    name: string;
    code: string;
  };
}

interface IMarksheetData {
  student?: {
    firstName: string;
    lastName: string;
    studentIdNo: string;
    rollNo?: number;
    class?: { name: string };
    section?: { name: string };
  };
  exam?: {
    name: string;
  };
  marks?: ISubjectMark[];
  subjectMarks?: ISubjectMark[];
  totalObtainedMarks?: number;
  gpa?: number;
  isPassed?: boolean;
  resultStatus?: string;
}

export default function StudentMarksheetPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const printRef = useRef<HTMLDivElement>(null);

  const [exams, setExams] = useState<IExam[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [students, setStudents] = useState<IStudent[]>([]);

  // Selection Filter State
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [marksheet, setMarksheet] = useState<IMarksheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial Load for Exams & Classes
    const fetchInitialData = async () => {
      try {
        const [examRes, classRes] = await Promise.all([
          axiosInstance.get("/exams"),
          axiosInstance.get("/academic/classes"),
        ]);
        setExams(examRes.data?.data || []);
        setClasses(classRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch students when Class changes
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

  // Fetch Marksheet Data
  const handleFetchMarksheet = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedExamId || !selectedStudentId) {
      setError(
        isBn
          ? "অনুগ্রহ করে পরীক্ষা এবং শিক্ষার্থী নির্বাচন করুন।"
          : "Please select both Exam and Student.",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMarksheet(null);

      const response = await axiosInstance.get(
        `/exams/marksheet/${selectedExamId}/${selectedStudentId}`,
      );

      const data = response.data?.data || response.data;

      if (!data || data.message || (data.marks && data.marks.length === 0)) {
        setError(
          isBn
            ? "এই শিক্ষার্থীর জন্য কোনো মার্কশিট বা নম্বর পাওয়া যায়নি।"
            : "No mark sheet records found for this student in the selected exam.",
        );
      } else {
        setMarksheet(data);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (isBn
            ? "ফলাফল লোড করতে সমস্যা হয়েছে।"
            : "Failed to retrieve student mark sheet."),
      );
    } finally {
      setLoading(false);
    }
  };

  // Trigger Print Action
  const handlePrint = () => {
    window.print();
  };

  const marksList = marksheet?.marks || marksheet?.subjectMarks || [];
  const studentInfo = marksheet?.student;
  const examInfo = marksheet?.exam;
  const isPassed =
    marksheet?.isPassed !== undefined
      ? marksheet.isPassed
      : marksheet?.resultStatus === "Passed";

  return (
    <div className="space-y-6">
      {/* Top Header Controls (Hide in print mode) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FaPoll className="text-primary" />
            <span>
              {isBn
                ? "শিক্ষার্থী মার্কশিট ও ফলাফল"
                : "Academic Marksheet & Result Card"}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "শিক্ষার্থী এবং পরীক্ষা নির্বাচন করে ফলাফল জেনারেট করুন।"
              : "Generate and print student academic performance cards."}
          </p>
        </div>

        {marksheet && (
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
          >
            <FaPrint />
            <span>{isBn ? "মার্কশিট প্রিন্ট করুন" : "Print Marksheet"}</span>
          </button>
        )}
      </div>

      {/* Filter Card (Hide in print mode) */}
      <Card className="print:hidden border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <form
            onSubmit={handleFetchMarksheet}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {isBn ? "পরীক্ষা (Exam)" : "Select Exam"}
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">
                  {isBn ? "-- পরীক্ষা বেছে নিন --" : "-- Select Exam --"}
                </option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {isBn ? "শ্রেণি (Class)" : "Filter by Class"}
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">
                  {isBn ? "-- শ্রেণি বেছে নিন --" : "-- Select Class --"}
                </option>
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
                <option value="">
                  {isBn ? "-- শিক্ষার্থী বেছে নিন --" : "-- Select Student --"}
                </option>
                {students.map((std) => (
                  <option key={std.id} value={std.id}>
                    {std.firstName} {std.lastName} ({std.studentIdNo})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaSearch />
              <span>
                {loading
                  ? isBn
                    ? "খোঁজা হচ্ছে..."
                    : "Searching..."
                  : isBn
                    ? "মার্কশিট দেখুন"
                    : "View Marksheet"}
              </span>
            </button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          {error}
        </div>
      )}

      {/* Printable Marksheet Container */}
      {marksheet && studentInfo && (
        <Card className="border-border/60 shadow-lg rounded-2xl bg-card overflow-hidden print:border-none print:shadow-none print:m-0">
          <CardContent className="p-8 space-y-6" ref={printRef}>
            {/* Institute Header */}
            <div className="text-center pb-6 border-b border-border/80 space-y-1">
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-xl">
                <FaUniversity />
                <span>Al-Iman Academy / School</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                Academic Progress & Official Mark Sheet
              </p>
              <div className="pt-2">
                <span className="px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {examInfo?.name || "Academic Examination"}
                </span>
              </div>
            </div>

            {/* Student Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl border border-border/40 text-xs">
              <div>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">
                  Student Name
                </p>
                <p className="font-bold text-foreground text-sm">
                  {studentInfo.firstName} {studentInfo.lastName}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">
                  Student ID No
                </p>
                <p className="font-semibold text-foreground">
                  {studentInfo.studentIdNo}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">
                  Class & Section
                </p>
                <p className="font-semibold text-foreground">
                  {studentInfo.class?.name || "N/A"}{" "}
                  {studentInfo.section?.name
                    ? `(${studentInfo.section.name})`
                    : ""}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] uppercase font-bold">
                  Roll No
                </p>
                <p className="font-semibold text-foreground">
                  {studentInfo.rollNo || "N/A"}
                </p>
              </div>
            </div>

            {/* Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-border text-foreground uppercase text-[10px] font-bold">
                    <th className="py-3 px-3">Subject</th>
                    <th className="py-3 px-3 text-center">Full Marks</th>
                    <th className="py-3 px-3 text-center">MT Marks</th>
                    <th className="py-3 px-3 text-center">Terminal</th>
                    <th className="py-3 px-3 text-center">Total Obtained</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-3 text-center">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {marksList.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20">
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {item.subject?.name}{" "}
                        <span className="text-[10px] text-muted-foreground">
                          ({item.subject?.code})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-medium">
                        {item.fullMarks}
                      </td>
                      <td className="py-3 px-3 text-center font-medium">
                        {item.mtMarks ?? 0}
                      </td>
                      <td className="py-3 px-3 text-center font-medium">
                        {item.terminal ?? 0}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-foreground">
                        {item.totalMarks}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.grade === "F"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {item.grade}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">
                        {item.gradePoint.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Final GPA and Result Summary */}
            <div className="pt-4 border-t-2 border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isPassed ? (
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center gap-2">
                    <FaCheckCircle className="text-xl" />
                    <div>
                      <p className="text-xs font-bold uppercase">
                        Final Result: PASSED
                      </p>
                      <p className="text-[10px] opacity-80">
                        Passed all mandatory subjects.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-2xl flex items-center gap-2">
                    <FaTimesCircle className="text-xl" />
                    <div>
                      <p className="text-xs font-bold uppercase">
                        Final Result: FAILED
                      </p>
                      <p className="text-[10px] opacity-80">
                        Needs improvement in failed subjects.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right bg-muted/40 px-6 py-3 rounded-2xl border border-border/50 min-w-[180px]">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Grade Point Average (GPA)
                </p>
                <p className="text-2xl font-extrabold text-primary">
                  {marksheet.gpa?.toFixed(2) ?? "0.00"} / 5.00
                </p>
              </div>
            </div>

            {/* Official Signatures Section for Print */}
            <div className="pt-12 grid grid-cols-2 justify-between text-center text-xs font-semibold text-muted-foreground">
              <div>
                <div className="w-36 border-b border-foreground/30 mx-auto mb-1"></div>
                <span>Class Teacher's Signature</span>
              </div>
              <div>
                <div className="w-36 border-b border-foreground/30 mx-auto mb-1"></div>
                <span>Headmaster / Principal</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
