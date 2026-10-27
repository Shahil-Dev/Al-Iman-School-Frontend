"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { FaSearch, FaSave, FaSpinner, FaUserGraduate } from "react-icons/fa";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

interface IClass { id: string; name: string; }
interface ISection { id: string; name: string; classId: string; }
interface ISubject { id: string; name: string; fullMarks: number; hasMT: boolean; }
interface IExam { id: string; name: string; }
interface IStudent {
  id: string;
  firstName: string;
  lastName: string;
  studentCode?: string;
  studentIdNo?: string;
  rollNo?: number;
  classId?: string;
  sectionId?: string;
}

interface IMarksRow {
  subjectId: string;
  subjectName: string;
  fullMarks: number;
  hasMT: boolean;
  mtMarks: number;
  terminal: number;
}

const springSoft = { type: "spring" as const, stiffness: 380, damping: 32 };
const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

export default function StudentMarkEntryPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const shouldReduceMotion = useReducedMotion();
  const t = (en: string, bn: string) => (isBn ? bn : en);

  const [classes, setClasses] = useState<IClass[]>([]);
  const [sections, setSections] = useState<ISection[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [exams, setExams] = useState<IExam[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [students, setStudents] = useState<IStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<IStudent | null>(null);
  const [marksRows, setMarksRows] = useState<IMarksRow[]>([]);

  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1) Load exams and classes once
  useEffect(() => {
    let cancelled = false;
    setLoadingClasses(true);
    Promise.all([
      axiosInstance.get("/academic/classes"),
      axiosInstance.get("/exams"),
    ])
      .then(([classRes, examRes]) => {
        if (cancelled) return;
        setClasses(classRes.data?.data || []);
        setExams(examRes.data?.data || []);
      })
      .catch(() => {
        if (!cancelled) toast.error(t("Failed to load classes/exams.", "ক্লাস/পরীক্ষা লোড করা যায়নি।"));
      })
      .finally(() => {
        if (!cancelled) setLoadingClasses(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Sections + Subjects when class changes
  useEffect(() => {
    setSections([]);
    setSubjects([]);
    setSelectedSection("");
    setStudents([]);
    setSelectedStudent(null);
    setMarksRows([]);
    if (!selectedClass) return;

    let cancelled = false;
    setLoadingSections(true);
    setLoadingSubjects(true);

    axiosInstance
      .get(`/academic/sections?classId=${selectedClass}`)
      .then((res) => {
        if (cancelled) return;
        const list: ISection[] = (res.data?.data || []).filter(
          (s: ISection) => s.classId === selectedClass,
        );
        setSections(list);
      })
      .catch(() => {
        if (!cancelled) toast.error(t("Failed to load sections.", "সেকশন লোড করা যায়নি।"));
      })
      .finally(() => {
        if (!cancelled) setLoadingSections(false);
      });

    axiosInstance
      .get(`/subjects/class/${selectedClass}`)
      .then((res) => {
        if (cancelled) return;
        setSubjects(res.data?.data || []);
      })
      .catch(() => {
        if (!cancelled) toast.error(t("Failed to load subjects.", "বিষয় লোড করা যায়নি।"));
      })
      .finally(() => {
        if (!cancelled) setLoadingSubjects(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  // 3) Load students
  const handleLoadStudents = async () => {
    if (!selectedClass || !selectedSection) {
      toast.error(t("Select class and section first.", "আগে ক্লাস ও সেকশন নির্বাচন করুন।"));
      return;
    }
    setLoadingStudents(true);
    try {
      const params = new URLSearchParams({
        classId: selectedClass,
        sectionId: selectedSection,
      });
      if (studentSearch.trim()) params.set("searchTerm", studentSearch.trim());
      const res = await axiosInstance.get(`/students?${params.toString()}`);
      const list: IStudent[] = res.data?.data || [];
      setStudents(list);
      setSelectedStudent(null);
      setMarksRows([]);
      if (list.length === 0) {
        toast.info(t("No students found for this filter.", "এই ফিল্টারে কোনো শিক্ষার্থী নেই।"));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("Failed to load students.", "শিক্ষার্থী লোড ব্যর্থ।"));
    } finally {
      setLoadingStudents(false);
    }
  };

  // 4) When a student is picked, prefill rows with all subjects
  const handleSelectStudent = (student: IStudent) => {
    setSelectedStudent(student);
    setMarksRows(
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
    setMarksRows((prev) =>
      prev.map((row) =>
        row.subjectId === subjectId ? { ...row, [field]: num } : row,
      ),
    );
  };

  // 5) Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedStudent || marksRows.length === 0) {
      toast.error(t("Select exam and a student first.", "আগে পরীক্ষা ও একজন শিক্ষার্থী নির্বাচন করুন।"));
      return;
    }

    // client-side validation
    for (const row of marksRows) {
      const total = (row.hasMT ? row.mtMarks : 0) + row.terminal;
      if (total > row.fullMarks) {
        toast.error(
          t(
            `"${row.subjectName}" total exceeds full marks (${row.fullMarks}).`,
            `"${row.subjectName}" এর মোট নম্বর পূর্ণমান (${row.fullMarks}) ছাড়িয়েছে।`,
          ),
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        examId: selectedExam,
        studentId: selectedStudent.id,
        marks: marksRows.map((row) => ({
          subjectId: row.subjectId,
          mtMarks: row.hasMT ? row.mtMarks : 0,
          terminal: row.terminal,
        })),
      };
      await axiosInstance.post("/marks/save-student-marks", payload);
      toast.success(t("Marks saved and GPA calculated.", "নম্বর সংরক্ষিত ও GPA হিসাব সম্পন্ন।"));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t("Failed to save marks.", "নম্বর সংরক্ষণ ব্যর্থ।"));
    } finally {
      setSubmitting(false);
    }
  };

  const canLoad = Boolean(selectedClass && selectedSection) && !loadingStudents;
  const canSubmit =
    Boolean(selectedExam && selectedStudent) && marksRows.length > 0 && !submitting;

  const totalRow = useMemo(() => {
    const totalObtained = marksRows.reduce(
      (sum, r) => sum + (r.hasMT ? r.mtMarks : 0) + r.terminal,
      0,
    );
    const totalFull = marksRows.reduce((sum, r) => sum + r.fullMarks, 0);
    return { totalObtained, totalFull };
  }, [marksRows]);

  const fadeUp = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.12 } }
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: springGentle };

  return (
    <div className="relative min-h-[60vh] p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans text-foreground">
      <motion.header {...fadeUp} className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {t("Results", "ফলাফল")}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
          {t("Student Mark Entry", "শিক্ষার্থীর নম্বর এন্ট্রি")}
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          {t(
            "Pick exam, class, section and one student — all subjects load together and can be saved in one click.",
            "পরীক্ষা, ক্লাস, সেকশন ও একজন শিক্ষার্থী নির্বাচন করুন — সব বিষয় একসাথে লোড হবে, এক ক্লিকে সংরক্ষণ হবে।",
          )}
        </p>
      </motion.header>

      {/* Filters */}
      <motion.div
        {...fadeUp}
        transition={{ ...springGentle, delay: shouldReduceMotion ? 0 : 0.03 }}
        className="rounded-lg border border-border/80 bg-card p-5 sm:p-6 space-y-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">
              {t("Exam", "পরীক্ষা")}
            </label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              disabled={loadingClasses}
            >
              <option value="">{t("— Choose Exam —", "— পরীক্ষা —")}</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">
              {t("Class", "ক্লাস")}
            </label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={loadingClasses}
            >
              <option value="">{t("— Choose Class —", "— ক্লাস —")}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">
              {t("Section", "সেকশন")}
            </label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 disabled:opacity-50"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass || loadingSections}
            >
              <option value="">{t("— Choose Section —", "— সেকশন —")}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground">
              {t("Search student (code / name)", "শিক্ষার্থী খুঁজুন (কোড/নাম)")}
            </label>
            <input
              type="text"
              placeholder={t("e.g. STU-26-0001", "যেমন STU-26-0001")}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (canLoad) handleLoadStudents();
                }
              }}
            />
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={handleLoadStudents}
            disabled={!canLoad}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
          >
            {loadingStudents ? (
              <>
                <FaSpinner className="animate-spin text-[12px]" />
                {t("Loading…", "লোড হচ্ছে…")}
              </>
            ) : (
              <>
                <FaSearch className="text-[12px]" />
                {t("Load students", "শিক্ষার্থী লোড করুন")}
              </>
            )}
          </button>
        </div>

        {loadingSubjects && (
          <p className="text-xs text-muted-foreground">
            {t("Loading subjects for this class…", "এই ক্লাসের বিষয়গুলো লোড হচ্ছে…")}
          </p>
        )}
      </motion.div>

      {/* Student list */}
      <AnimatePresence>
        {students.length > 0 && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={springGentle}
            className="rounded-lg border border-border/80 bg-card"
          >
            <div className="border-b border-border/70 px-5 py-3">
              <h2 className="text-sm font-medium">
                {t("Choose a student", "একজন শিক্ষার্থী বাছাই করুন")}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {students.length} {t("result(s)", "টি ফলাফল")}
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              <ul className="divide-y divide-border/50">
                {students.map((st) => {
                  const isSel = selectedStudent?.id === st.id;
                  return (
                    <li key={st.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectStudent(st)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left text-sm transition-colors ${
                          isSel
                            ? "bg-primary/10 text-foreground font-semibold"
                            : "hover:bg-muted/40 text-foreground"
                        }`}
                      >
                        <FaUserGraduate className="text-[12px] text-muted-foreground shrink-0" />
                        <span className="font-medium">
                          {st.firstName} {st.lastName}
                        </span>
                        <span className="ml-auto flex gap-3 text-xs text-muted-foreground tabular-nums">
                          {st.studentCode && (
                            <span className="font-mono">{st.studentCode}</span>
                          )}
                          {st.rollNo != null && <span>Roll {st.rollNo}</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marks table */}
      <AnimatePresence>
        {selectedStudent && marksRows.length > 0 && (
          <motion.form
            onSubmit={handleSubmit}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={springGentle}
            className="overflow-hidden rounded-lg border border-border/80 bg-card"
          >
            <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-medium">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                  {selectedStudent.studentCode && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground font-mono">
                      {selectedStudent.studentCode}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {marksRows.length} {t("subjects", "বিষয়")}
                </p>
              </div>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin text-[12px]" />
                    {t("Saving…", "সংরক্ষণ হচ্ছে…")}
                  </>
                ) : (
                  <>
                    <FaSave className="text-[12px]" />
                    {t("Save all marks", "সব নম্বর সংরক্ষণ করুন")}
                  </>
                )}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/20">
                    <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t("Subject", "বিষয়")}
                    </th>
                    <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t("Full marks", "পূর্ণমান")}
                    </th>
                    <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t("Model Test", "মডেল টেস্ট")}
                    </th>
                    <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t("Terminal", "টার্মিনাল")}
                    </th>
                    <th className="px-5 py-2.5 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {t("Total", "মোট")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {marksRows.map((row) => {
                    const total = (row.hasMT ? row.mtMarks : 0) + row.terminal;
                    const over = total > row.fullMarks;
                    return (
                      <tr key={row.subjectId} className="hover:bg-muted/30">
                        <td className="px-5 py-2.5 font-medium text-foreground">
                          {row.subjectName}
                          {!row.hasMT && (
                            <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                              {t("No MT", "MT নেই")}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-muted-foreground tabular-nums">
                          {row.fullMarks}
                        </td>
                        <td className="px-3 py-2.5">
                          {row.hasMT ? (
                            <input
                              type="number"
                              min={0}
                              max={row.fullMarks}
                              className="h-8 w-[5.5rem] rounded-md border border-input bg-background px-2.5 font-mono text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-foreground/20"
                              value={row.mtMarks || ""}
                              onChange={(e) =>
                                handleMarkChange(row.subjectId, "mtMarks", e.target.value)
                              }
                            />
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min={0}
                            max={row.fullMarks}
                            className="h-8 w-[5.5rem] rounded-md border border-input bg-background px-2.5 font-mono text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-foreground/20"
                            value={row.terminal || ""}
                            onChange={(e) =>
                              handleMarkChange(row.subjectId, "terminal", e.target.value)
                            }
                          />
                        </td>
                        <td
                          className={`px-5 py-2.5 text-right font-mono text-sm font-semibold tabular-nums ${
                            over ? "text-destructive" : "text-foreground"
                          }`}
                        >
                          {total}
                          {over && <span className="ml-1 text-[10px]">⚠</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border/70 bg-muted/20">
                    <td className="px-5 py-2.5 text-xs font-medium text-muted-foreground" colSpan={4}>
                      {t("Grand total", "সর্বমোট")}
                    </td>
                    <td className="px-5 py-2.5 text-right font-mono text-sm font-semibold tabular-nums">
                      {totalRow.totalObtained} / {totalRow.totalFull}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}