"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  FaClipboardList,
  FaSearch,
  FaSave,
  FaSpinner,
  FaUserGraduate,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

interface IExam { id: string; name: string; }
interface IClass { id: string; name: string; }
interface ISection { id: string; name: string; classId: string; }
interface ISubject { id: string; name: string; fullMarks: number; hasMT: boolean; }
interface IStudent {
  id: string;
  firstName: string;
  lastName: string;
  studentCode?: string;
  studentIdNo?: string;
  rollNo?: number;
}
interface IMarkRow {
  subjectId: string;
  subjectName: string;
  fullMarks: number;
  hasMT: boolean;
  mtMarks: number;
  terminal: number;
}

export default function TeacherMarksEntryPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const t = (en: string, bn: string) => (isBn ? bn : en);

  const [exams, setExams] = useState<IExam[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [sections, setSections] = useState<ISection[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [students, setStudents] = useState<IStudent[]>([]);

  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [rows, setRows] = useState<IMarkRow[]>([]);

  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1) Initial metadata
  useEffect(() => {
    let cancelled = false;
    setLoadingMeta(true);
    Promise.all([
      axiosInstance.get("/exams"),
      axiosInstance.get("/academic/classes"),
    ])
      .then(([exRes, clsRes]) => {
        if (cancelled) return;
        setExams(exRes.data?.data || []);
        setClasses(clsRes.data?.data || []);
      })
      .catch(() => {
        if (!cancelled)
          setMsg({
            type: "error",
            text: t("Could not load exams or classes.", "পরীক্ষা বা ক্লাস লোড করা যায়নি।"),
          });
      })
      .finally(() => {
        if (!cancelled) setLoadingMeta(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Sections + subjects on class change
  useEffect(() => {
    setSections([]);
    setSelectedSectionId("");
    setSubjects([]);
    setStudents([]);
    setSelectedStudent(null);
    setRows([]);
    if (!selectedClassId) return;

    let cancelled = false;
    setLoadingSections(true);
    setLoadingSubjects(true);

    axiosInstance
      .get(`/academic/sections?classId=${selectedClassId}`)
      .then((res) => {
        if (cancelled) return;
        const list: ISection[] = (res.data?.data || []).filter(
          (s: ISection) => s.classId === selectedClassId,
        );
        setSections(list);
      })
      .catch(() => {
        if (!cancelled)
          setMsg({
            type: "error",
            text: t("Failed to load sections.", "সেকশন লোড করা যায়নি।"),
          });
      })
      .finally(() => {
        if (!cancelled) setLoadingSections(false);
      });

    axiosInstance
      .get(`/subjects/class/${selectedClassId}`)
      .then((res) => {
        if (cancelled) return;
        setSubjects(res.data?.data || []);
      })
      .catch(() => {
        if (!cancelled)
          setMsg({
            type: "error",
            text: t("Failed to load subjects.", "বিষয় লোড করা যায়নি।"),
          });
      })
      .finally(() => {
        if (!cancelled) setLoadingSubjects(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId]);

  const handleLoadStudents = async () => {
    if (!selectedClassId || !selectedSectionId) {
      setMsg({
        type: "error",
        text: t("Select class and section first.", "আগে ক্লাস ও সেকশন নির্বাচন করুন।"),
      });
      return;
    }
    setLoadingStudents(true);
    setMsg(null);
    try {
      const params = new URLSearchParams({
        classId: selectedClassId,
        sectionId: selectedSectionId,
      });
      if (searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
      const res = await axiosInstance.get(`/students?${params.toString()}`);
      const list: IStudent[] = res.data?.data || [];
      setStudents(list);
      setSelectedStudent(null);
      setRows([]);
      if (list.length === 0) {
        setMsg({
          type: "error",
          text: t("No students found for this filter.", "এই ফিল্টারে কোনো শিক্ষার্থী নেই।"),
        });
      }
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err?.response?.data?.message || t("Failed to load students.", "শিক্ষার্থী লোড ব্যর্থ।"),
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handlePickStudent = (st: IStudent) => {
    setSelectedStudent(st);
    setRows(
      subjects.map((s) => ({
        subjectId: s.id,
        subjectName: s.name,
        fullMarks: s.fullMarks,
        hasMT: s.hasMT !== false,
        mtMarks: 0,
        terminal: 0,
      })),
    );
  };

  const handleMarkChange = (
    subjectId: string,
    field: "mtMarks" | "terminal",
    raw: string,
  ) => {
    const num = Math.max(0, Number(raw) || 0);
    setRows((prev) =>
      prev.map((r) => (r.subjectId === subjectId ? { ...r, [field]: num } : r)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !selectedStudent || rows.length === 0) {
      setMsg({
        type: "error",
        text: t(
          "Select exam and a student first.",
          "আগে পরীক্ষা ও একজন শিক্ষার্থী নির্বাচন করুন।",
        ),
      });
      return;
    }
    for (const r of rows) {
      const total = (r.hasMT ? r.mtMarks : 0) + r.terminal;
      if (total > r.fullMarks) {
        setMsg({
          type: "error",
          text: t(
            `"${r.subjectName}" total exceeds full marks (${r.fullMarks}).`,
            `"${r.subjectName}" এর মোট নম্বর পূর্ণমান (${r.fullMarks}) ছাড়িয়েছে।`,
          ),
        });
        return;
      }
    }
    setSubmitting(true);
    setMsg(null);
    try {
      await axiosInstance.post("/marks/save-student-marks", {
        examId: selectedExamId,
        studentId: selectedStudent.id,
        marks: rows.map((r) => ({
          subjectId: r.subjectId,
          mtMarks: r.hasMT ? r.mtMarks : 0,
          terminal: r.terminal,
        })),
      });
      setMsg({
        type: "success",
        text: t("All subject marks saved successfully.", "সব বিষয়ের নম্বর সফলভাবে সংরক্ষিত হয়েছে।"),
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          t("Failed to save marks.", "নম্বর সংরক্ষণ ব্যর্থ।"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const totalObtained = useMemo(
    () => rows.reduce((sum, r) => sum + (r.hasMT ? r.mtMarks : 0) + r.terminal, 0),
    [rows],
  );
  const totalFull = useMemo(() => rows.reduce((sum, r) => sum + r.fullMarks, 0), [rows]);

  const canLoad = Boolean(selectedClassId && selectedSectionId) && !loadingStudents;
  const canSubmit = Boolean(selectedExamId && selectedStudent) && rows.length > 0 && !submitting;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <FaClipboardList className="text-primary" />
          <span>{t("Student Marks Entry", "শিক্ষার্থীর নম্বর এন্ট্রি")}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {t(
            "Pick a student — all subjects for their class load together, save in one click.",
            "একজন শিক্ষার্থী বাছুন — তার ক্লাসের সব বিষয় একসাথে লোড হবে, এক ক্লিকে সংরক্ষণ হবে।",
          )}
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

      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5">
                {t("Exam", "পরীক্ষা")}
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                disabled={loadingMeta}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t("-- Select Exam --", "-- পরীক্ষা --")}</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5">
                {t("Class", "ক্লাস")}
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={loadingMeta}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">{t("-- Select Class --", "-- ক্লাস --")}</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5">
                {t("Section", "সেকশন")}
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                disabled={!selectedClassId || loadingSections}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              >
                <option value="">{t("-- Select Section --", "-- সেকশন --")}</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5">
                {t("Search student", "শিক্ষার্থী খুঁজুন")}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (canLoad) handleLoadStudents();
                  }
                }}
                placeholder={t("Code / name", "কোড / নাম")}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleLoadStudents}
            disabled={!canLoad}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 shadow-sm disabled:opacity-40"
          >
            {loadingStudents ? <FaSpinner className="animate-spin" /> : <FaSearch />}
            {loadingStudents
              ? t("Loading…", "লোড হচ্ছে…")
              : t("Load students", "শিক্ষার্থী লোড করুন")}
          </button>

          {loadingSubjects && (
            <p className="text-xs text-muted-foreground">
              {t("Loading subjects…", "বিষয় লোড হচ্ছে…")}
            </p>
          )}
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-sm font-semibold">
              {t("Choose a student", "একজন শিক্ষার্থী বাছাই করুন")}
            </h2>
            <div className="max-h-72 overflow-y-auto rounded-xl border border-border/60">
              <ul className="divide-y divide-border/40">
                {students.map((st) => {
                  const isSel = selectedStudent?.id === st.id;
                  return (
                    <li key={st.id}>
                      <button
                        type="button"
                        onClick={() => handlePickStudent(st)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs ${
                          isSel
                            ? "bg-primary/10 font-semibold text-foreground"
                            : "hover:bg-muted/40 text-foreground"
                        }`}
                      >
                        <FaUserGraduate className="text-muted-foreground shrink-0" />
                        <span className="font-semibold">
                          {st.firstName} {st.lastName}
                        </span>
                        <span className="ml-auto flex gap-3 text-muted-foreground tabular-nums">
                          {st.studentCode && <span className="font-mono">{st.studentCode}</span>}
                          {st.rollNo != null && <span>Roll {st.rollNo}</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedStudent && rows.length > 0 && (
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {rows.length} {t("subjects", "বিষয়")}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 shadow-sm disabled:opacity-40"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {submitting
                    ? t("Saving…", "সংরক্ষণ হচ্ছে…")
                    : t("Save all marks", "সব নম্বর সংরক্ষণ করুন")}
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px]">
                      <th className="py-3 px-3">{t("Subject", "বিষয়")}</th>
                      <th className="py-3 px-3">{t("Full", "পূর্ণমান")}</th>
                      <th className="py-3 px-3">{t("Model Test", "মডেল টেস্ট")}</th>
                      <th className="py-3 px-3">{t("Terminal", "টার্মিনাল")}</th>
                      <th className="py-3 px-3 text-right">{t("Total", "মোট")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {rows.map((r) => {
                      const total = (r.hasMT ? r.mtMarks : 0) + r.terminal;
                      const over = total > r.fullMarks;
                      return (
                        <tr key={r.subjectId} className="hover:bg-muted/30">
                          <td className="py-3 px-3 font-semibold text-foreground">
                            {r.subjectName}
                            {!r.hasMT && (
                              <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                                {t("No MT", "MT নেই")}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 font-mono text-muted-foreground">{r.fullMarks}</td>
                          <td className="py-3 px-3">
                            {r.hasMT ? (
                              <input
                                type="number"
                                min={0}
                                max={r.fullMarks}
                                value={r.mtMarks || ""}
                                onChange={(e) => handleMarkChange(r.subjectId, "mtMarks", e.target.value)}
                                className="w-20 px-2 py-1.5 rounded-lg bg-muted/50 border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min={0}
                              max={r.fullMarks}
                              value={r.terminal || ""}
                              onChange={(e) => handleMarkChange(r.subjectId, "terminal", e.target.value)}
                              className="w-20 px-2 py-1.5 rounded-lg bg-muted/50 border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-mono font-semibold ${
                              over ? "text-destructive" : "text-foreground"
                            }`}
                          >
                            {total}
                            {over && <span className="ml-1">⚠</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border/60 bg-muted/20">
                      <td className="py-2.5 px-3 text-[11px] text-muted-foreground" colSpan={4}>
                        {t("Grand total", "সর্বমোট")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">
                        {totalObtained} / {totalFull}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}