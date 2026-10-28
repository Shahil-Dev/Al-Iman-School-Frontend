"use client";

import React, { useEffect, useState } from "react";
import { FaPoll, FaSpinner } from "react-icons/fa";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext"; // Updated to
import AcademicTranscript, {
  ITranscriptMark,
} from "@/src/components/ui/AcademicTranscript";

export default function StudentResultsPage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const isBn = language === "bn";

  const [student, setStudent] = useState<any | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [transcriptData, setTranscriptData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [marksheetLoading, setMarksheetLoading] = useState(false);

  // 1. Fetch Student Profile and Exams
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentId =
          user?.studentProfile?.id || user?.studentId || user?.id;
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
      const studentId =
        student?.id || user?.studentProfile?.id || user?.studentId || user?.id;
      if (!selectedExamId || !studentId) return;

      setMarksheetLoading(true);
      try {
        const res = await axiosInstance.get(
          `/marks/marksheet/${selectedExamId}/${studentId}`,
        );
        const data = res.data?.data || res.data || [];
        const marksArray = Array.isArray(data) ? data : [];

        if (marksArray.length > 0) {
          const firstRecord = marksArray[0];
          const formattedMarks: ITranscriptMark[] = marksArray.map(
            (m: any) => ({
              subjectId: m.subjectId,
              subjectName: m.subject?.name || "Unknown Subject",
              fullMarks: m.fullMarks || 100,
              mtMarks: m.mtMarks || 0,
              terminal: m.terminal || 0,
              totalMarks: m.totalMarks || 0,
              grade: m.grade || "F",
              gradePoint: m.gradePoint || 0,
            }),
          );

          setTranscriptData({
            studentName: `${firstRecord.student?.firstName || ""} ${
              firstRecord.student?.lastName || ""
            }`.trim(),
            className:
              firstRecord.student?.class?.name || student?.class?.name || "N/A",
            sectionName:
              firstRecord.student?.section?.name ||
              student?.section?.name ||
              "",
            rollNo: firstRecord.student?.rollNo || student?.rollNo || "N/A",
            studentCode:
              firstRecord.student?.studentCode || student?.studentCode || "N/A",
            examName: firstRecord.exam?.name || "Exam",
            marks: formattedMarks,
          });
        } else {
          setTranscriptData(null);
        }
      } catch (err) {
        console.error("Failed to fetch marksheet", err);
        setTranscriptData(null);
      } finally {
        setMarksheetLoading(false);
      }
    };

    fetchMarksheet();
  }, [selectedExamId, student, user]);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header & Controls */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "আমার ফলাফল" : "My Results"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaPoll className="text-primary text-lg" />
            <span>
              {isBn ? "একাডেমিক ট্রান্সক্রিপ্ট" : "Academic Transcript"}
            </span>
          </h1>
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
        </div>
      </div>

      {loading || marksheetLoading ? (
        <div className="p-16 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-3">
          <FaSpinner className="animate-spin text-primary text-2xl" />
          <span>
            {isBn ? "ট্রান্সক্রিপ্ট লোড হচ্ছে..." : "Loading transcript..."}
          </span>
        </div>
      ) : transcriptData ? (
        <AcademicTranscript
          studentName={transcriptData.studentName}
          className={transcriptData.className}
          sectionName={transcriptData.sectionName}
          rollNo={transcriptData.rollNo}
          studentCode={transcriptData.studentCode}
          examName={transcriptData.examName}
          marks={transcriptData.marks}
          onPrint={handlePrint}
          hideHeader={true}
        />
      ) : (
        <div className="p-12 text-center text-sm text-muted-foreground border border-border rounded-2xl bg-card">
          {isBn
            ? "এই পরীক্ষার কোনো নম্বরপত্র এখনো প্রকাশিত হয়নি।"
            : "No marksheet available for this exam yet."}
        </div>
      )}
    </div>
  );
}
