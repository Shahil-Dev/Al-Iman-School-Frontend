"use client";

import React, { useEffect, useState } from "react";
import { FaClipboardList, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function MarksEntryPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [exams, setExams] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [marksData, setMarksData] = useState<{ [studentId: string]: number }>({});

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Fetch Exams and Classes on mount
  useEffect(() => {
    axiosInstance
      .get("/exams")
      .then((res) => setExams(res.data?.data || []))
      .catch((err) => console.error("Failed to load exams", err));

    axiosInstance
      .get("/academic/classes")
      .then((res) => setClasses(res.data?.data || []))
      .catch((err) => console.error("Failed to load classes", err));

    axiosInstance
      .get("/subjects")
      .then((res) => setSubjects(res.data?.data || []))
      .catch((err) => console.error("Failed to load subjects", err));
  }, []);

  // 2. Fetch Sections when Class changes
  useEffect(() => {
    if (!selectedClassId) {
      setSections([]);
      setSelectedSectionId("");
      return;
    }
    axiosInstance
      .get(`/academic/sections?classId=${selectedClassId}`)
      .then((res) => {
        const secList = res.data?.data || [];
        setSections(secList);
        if (secList.length > 0) setSelectedSectionId(secList[0].id);
      })
      .catch(() => setSections([]));
  }, [selectedClassId]);

  // 3. Load Student list for Marks Input
  const handleLoadStudents = async () => {
    if (!selectedClassId) {
      setMsg({
        type: "error",
        text: isBn ? "অনুগ্রহ করে শ্রেণি সিলেক্ট করুন।" : "Please select a Class.",
      });
      return;
    }

    try {
      setLoading(true);
      setMsg(null);
      const res = await axiosInstance.get(`/students?classId=${selectedClassId}`);
      const studentList = res.data?.data || [];
      setStudents(studentList);

      // Initialize empty marks
      const initialMarks: { [key: string]: number } = {};
      studentList.forEach((st: any) => {
        initialMarks[st.id] = 0;
      });
      setMarksData(initialMarks);
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || (isBn ? "শিক্ষার্থীদের তালিকা লোড করতে সমস্যা হয়েছে।" : "Failed to load students."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, val: number) => {
    setMarksData((prev) => ({ ...prev, [studentId]: val }));
  };

  // 4. Submit Marks to Backend
  const handleSubmitMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !selectedSubjectId || students.length === 0) {
      setMsg({
        type: "error",
        text: isBn
          ? "পরীক্ষা, বিষয় ও শিক্ষার্থী নির্বাচন সম্পন্ন করুন।"
          : "Please select Exam, Subject and load students.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMsg(null);

      const formattedMarks = Object.keys(marksData).map((stId) => ({
        studentId: stId,
        marksObtained: Number(marksData[stId] || 0),
      }));

      await axiosInstance.post("/marks", {
        examId: selectedExamId,
        subjectId: selectedSubjectId,
        marks: formattedMarks,
      });

      setMsg({
        type: "success",
        text: isBn
          ? "পরীক্ষার প্রাপ্ত নম্বর সফলভাবে সংরক্ষণ করা হয়েছে!"
          : "Exam marks saved successfully!",
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          (isBn ? "মার্কস সংরক্ষণ করতে সমস্যা হয়েছে।" : "Failed to submit marks."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <FaClipboardList className="text-primary" />
          <span>{isBn ? "পরীক্ষার নম্বর ইনপুট (Marks Entry)" : "Student Marks Entry"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "পরীক্ষা, শ্রেণি ও বিষয় সিলেক্ট করে শিক্ষার্থীদের প্রাপ্ত নম্বর প্রদান করুন।"
            : "Select exam, class & subject to enter student marks."}
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

      {/* Filters Card */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5">{isBn ? "পরীক্ষা (Exam)" : "Select Exam"}</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">{isBn ? "-- পরীক্ষা সিলেক্ট করুন --" : "-- Select Exam --"}</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5">{isBn ? "শ্রেণি (Class)" : "Select Class"}</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">{isBn ? "-- শ্রেণি সিলেক্ট করুন --" : "-- Select Class --"}</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5">{isBn ? "সেকশন (Section)" : "Select Section"}</label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">{isBn ? "-- সেকশন সিলেক্ট করুন --" : "-- Select Section --"}</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5">{isBn ? "বিষয় (Subject)" : "Select Subject"}</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">{isBn ? "-- বিষয় সিলেক্ট করুন --" : "-- Select Subject --"}</option>
                {subjects.map((sb) => (
                  <option key={sb.id} value={sb.id}>
                    {sb.name} ({sb.code || "N/A"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLoadStudents}
            disabled={loading}
            className="w-full md:w-auto px-6 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
          >
            {loading ? (isBn ? "লোড হচ্ছে..." : "Loading...") : isBn ? "শিক্ষার্থী তালিকা লোড করুন" : "Load Students"}
          </button>
        </CardContent>
      </Card>

      {/* Marks Table Form */}
      {students.length > 0 && (
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmitMarks} className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px]">
                      <th className="py-3 px-3">Roll No</th>
                      <th className="py-3 px-3">Student ID</th>
                      <th className="py-3 px-3">Student Name</th>
                      <th className="py-3 px-3 w-40">Obtained Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-muted/30">
                        <td className="py-3 px-3 font-semibold text-foreground">{st.rollNo}</td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{st.studentIdNo}</td>
                        <td className="py-3 px-3 font-semibold text-foreground">
                          {st.firstName} {st.lastName}
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={marksData[st.id] ?? 0}
                            onChange={(e) => handleMarkChange(st.id, Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground font-mono"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
              >
                {submitting ? (isBn ? "সংরক্ষণ হচ্ছে..." : "Saving...") : isBn ? "নম্বর সাবমিট করুন" : "Save All Marks"}
              </button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}