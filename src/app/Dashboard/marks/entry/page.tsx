"use client";

import React, { useEffect, useState } from "react";
import { FaClipboardList, FaSave, FaSync } from "react-icons/fa";
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

interface ISubject {
  id: string;
  name: string;
  fullMarks: number;
}

interface IStudent {
  id: string;
  firstName: string;
  lastName: string;
  studentIdNo: string;
  rollNo?: number;
}

interface IStudentMarkInput {
  studentId: string;
  studentName: string;
  rollNo?: number;
  mtMarks: number;
  terminal: number;
}

export default function BulkMarkEntryPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [exams, setExams] = useState<IExam[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);

  // Selection state
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [studentMarks, setStudentMarks] = useState<IStudentMarkInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // Initial Load of Exams & Classes
    const fetchInitial = async () => {
      try {
        const [examRes, classRes] = await Promise.all([
          axiosInstance.get("/exams"),
          axiosInstance.get("/academic/classes"),
        ]);
        setExams(examRes.data?.data || []);
        setClasses(classRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load options", err);
      }
    };
    fetchInitial();
  }, []);

  // Fetch subjects when Class changes
  useEffect(() => {
    if (!selectedClassId) {
      setSubjects([]);
      return;
    }
    axiosInstance
      .get(`/subjects/class/${selectedClassId}`)
      .then((res) => setSubjects(res.data?.data || []))
      .catch(() => setSubjects([]));
  }, [selectedClassId]);

  // Load Students list when Class & Subject are selected
  const handleLoadStudents = async () => {
    if (!selectedExamId || !selectedClassId || !selectedSubjectId) {
      setMsg({
        type: "error",
        text: isBn
          ? "অনুগ্রহ করে পরীক্ষা, শ্রেণি ও বিষয় নির্বাচন করুন।"
          : "Please select Exam, Class and Subject.",
      });
      return;
    }

    try {
      setLoading(true);
      setMsg(null);
      const studentRes = await axiosInstance.get(
        `/students?classId=${selectedClassId}`,
      );
      const students: IStudent[] = studentRes.data?.data || [];

      // Map students to Mark Input Format
      const initialMarks: IStudentMarkInput[] = students.map((std) => ({
        studentId: std.id,
        studentName: `${std.firstName} ${std.lastName}`,
        rollNo: std.rollNo,
        mtMarks: 0,
        terminal: 0,
      }));

      setStudentMarks(initialMarks);
    } catch (err: any) {
      setMsg({
        type: "error",
        text: isBn
          ? "শিক্ষার্থীদের তালিকা লোড করতে ব্যর্থ হয়েছে।"
          : "Failed to load students.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    studentId: string,
    field: "mtMarks" | "terminal",
    val: number,
  ) => {
    setStudentMarks((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, [field]: val } : item,
      ),
    );
  };

  // Submit Bulk Marks to Backend API (/marks/save-bulk-marks)
  const handleSubmitBulkMarks = async () => {
    try {
      setSubmitting(true);
      setMsg(null);

      const payload = {
        examId: selectedExamId,
        subjectId: selectedSubjectId,
        marks: studentMarks.map((item) => ({
          studentId: item.studentId,
          mtMarks: Number(item.mtMarks || 0),
          terminal: Number(item.terminal || 0),
        })),
      };

      await axiosInstance.post("/marks/save-bulk-marks", payload);
      setMsg({
        type: "success",
        text: isBn
          ? "সকল শিক্ষার্থীর নম্বর সফলভাবে সেভ হয়েছে!"
          : "Bulk marks saved successfully!",
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          (isBn
            ? "নম্বর সেভ করতে সমস্যা হয়েছে।"
            : "Failed to save bulk marks."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
          {isBn
            ? "পরীক্ষার নম্বর এন্ট্রি (Bulk Mark Entry)"
            : "Bulk Marks Entry"}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "শ্রেণি ও বিষয় নির্বাচন করে একসাথে পুরো ক্লাসের নম্বর এন্ট্রি দিন।"
            : "Enter marks for the whole class."}
        </p>
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

      {/* Filter Selection Card */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {isBn ? "শ্রেণি (Class)" : "Select Class"}
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
                {isBn ? "বিষয় (Subject)" : "Select Subject"}
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">
                  {isBn ? "-- বিষয় বেছে নিন --" : "-- Select Subject --"}
                </option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} (Full Marks: {sub.fullMarks})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleLoadStudents}
            className="mt-4 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
          >
            <FaClipboardList />
            <span>
              {isBn ? "শিক্ষার্থী তালিকা লোড করুন" : "Load Students List"}
            </span>
          </button>
        </CardContent>
      </Card>

      {/* Student Marks Table */}
      {studentMarks.length > 0 && (
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">
                {isBn
                  ? "শিক্ষার্থীদের নম্বর প্রদান করুন"
                  : "Enter Marks for Students"}
              </h3>
              <button
                onClick={handleSubmitBulkMarks}
                disabled={submitting}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <FaSave />
                <span>
                  {submitting
                    ? isBn
                      ? "সেভ হচ্ছে..."
                      : "Saving..."
                    : isBn
                      ? "সব নম্বর সেভ করুন"
                      : "Save All Marks"}
                </span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Roll</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">MT Marks (Model Test)</th>
                    <th className="py-3 px-3">Terminal Exam Marks</th>
                    <th className="py-3 px-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {studentMarks.map((std) => (
                    <tr key={std.studentId} className="hover:bg-muted/30">
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {std.rollNo || "-"}
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {std.studentName}
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={std.mtMarks}
                          onChange={(e) =>
                            handleInputChange(
                              std.studentId,
                              "mtMarks",
                              Number(e.target.value),
                            )
                          }
                          className="w-24 px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={std.terminal}
                          onChange={(e) =>
                            handleInputChange(
                              std.studentId,
                              "terminal",
                              Number(e.target.value),
                            )
                          }
                          className="w-24 px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        />
                      </td>
                      <td className="py-3 px-3 font-bold text-primary">
                        {(Number(std.mtMarks) || 0) +
                          (Number(std.terminal) || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
