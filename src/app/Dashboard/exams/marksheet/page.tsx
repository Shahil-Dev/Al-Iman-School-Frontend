"use client";

import React, { useEffect, useState } from "react";
import { FaPoll, FaSearch } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import AcademicTranscript, { ITranscriptMark } from "@/src/components/ui/AcademicTranscript";

interface IExam { id: string; name: string; }
interface IClass { id: string; name: string; }
interface IStudent { id: string; firstName: string; lastName: string; studentIdNo: string; rollNo?: number; }

export default function StudentMarksheetPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [exams, setExams] = useState<IExam[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [students, setStudents] = useState<IStudent[]>([]);

  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Transcript Data State
  const [transcriptData, setTranscriptData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setSelectedStudentId("");
      return;
    }
    axiosInstance
      .get(`/students?classId=${selectedClassId}`)
      .then((res) => setStudents(res.data?.data || []))
      .catch(() => setStudents([]));
  }, [selectedClassId]);

  const handleFetchMarksheet = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedExamId || !selectedStudentId) {
      setError(isBn ? "পরীক্ষা এবং শিক্ষার্থী নির্বাচন করুন।" : "Please select both Exam and Student.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTranscriptData(null);

      const res = await axiosInstance.get(`/marks/marksheet/${selectedExamId}/${selectedStudentId}`);
      const data = res.data?.data || res.data;
      
      // Backend returns an Array of marks. The first element contains student/exam info.
      const marksArray = Array.isArray(data) ? data : [];
      
      if (marksArray.length === 0) {
        setError(isBn ? "কোনো মার্কশিট পাওয়া যায়নি।" : "No marksheet found for this student.");
        return;
      }

      const firstRecord = marksArray[0];
      
      const transcriptMarks: ITranscriptMark[] = marksArray.map((m: any) => ({
        subjectId: m.subjectId,
        subjectName: m.subject?.name || "Unknown",
        fullMarks: m.fullMarks || 100,
        mtMarks: m.mtMarks || 0,
        terminal: m.terminal || 0,
        totalMarks: m.totalMarks || 0,
        grade: m.grade || "F",
        gradePoint: m.gradePoint || 0,
      }));

      setTranscriptData({
        studentName: `${firstRecord.student?.firstName || ""} ${firstRecord.student?.lastName || ""}`.trim(),
        className: firstRecord.student?.class?.name || "N/A",
        sectionName: firstRecord.student?.section?.name || "",
        rollNo: firstRecord.student?.rollNo || "N/A",
        studentCode: firstRecord.student?.studentCode || "N/A",
        examName: firstRecord.exam?.name || "Exam",
        marks: transcriptMarks,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
          <FaPoll className="text-primary" />
          <span>{isBn ? "অফিসিয়াল মার্কশিট" : "Official Transcript"}</span>
        </h1>
      </div>

      <Card className="print:hidden border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <form onSubmit={handleFetchMarksheet} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold block mb-1.5">Exam</label>
              <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:ring-2 text-foreground">
                <option value="">-- Select --</option>
                {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5">Class</label>
              <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:ring-2 text-foreground">
                <option value="">-- Select --</option>
                {classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5">Student</label>
              <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:ring-2 text-foreground">
                <option value="">-- Select --</option>
                {students.map((std) => <option key={std.id} value={std.id}>{std.firstName} {std.lastName} ({std.studentIdNo})</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 flex items-center justify-center gap-2">
              <FaSearch /> {loading ? "Searching..." : "View Transcript"}
            </button>
          </form>
        </CardContent>
      </Card>

      {error && <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-xs">{error}</div>}

      {transcriptData && (
        <div className="mt-8">
          <AcademicTranscript 
            studentName={transcriptData.studentName}
            className={transcriptData.className}
            sectionName={transcriptData.sectionName}
            rollNo={transcriptData.rollNo}
            studentCode={transcriptData.studentCode}
            examName={transcriptData.examName}
            marks={transcriptData.marks}
            onPrint={handlePrint}
          />
        </div>
      )}
    </div>
  );
}