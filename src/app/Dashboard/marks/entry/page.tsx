"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import {
  FaClipboardList,
  FaSave,
  FaSpinner,
  FaPen,
  FaSearch,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
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

const componentStyles = `
  .bulk-marks {
    width: 100%;
    max-width: 80rem;
    margin-inline: auto;
    padding: 2.5rem 1.5rem;
    color: var(--foreground);
    font-family: inherit;
    letter-spacing: 0;
  }
  .bulk-marks *, .bulk-marks *::before, .bulk-marks *::after {
    box-sizing: border-box;
  }
  .bulk-marks .bme-header {
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--border);
  }
  .bulk-marks .bme-heading-line {
    display: flex;
    align-items: flex-start;
    gap: .875rem;
  }
  .bulk-marks .bme-heading-icon {
    flex-shrink: 0;
    margin-top: .375rem;
    color: var(--primary);
    font-size: 1.125rem;
  }
  .bulk-marks h1 {
    margin: 0;
    font-size: 1.875rem;
    font-weight: 650;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }
  .bulk-marks .bme-subtitle {
    max-width: 42rem;
    margin: .75rem 0 0;
    color: var(--muted-foreground);
    font-size: .875rem;
    line-height: 1.75;
  }
  .bulk-marks .bme-section { padding-block: 1.75rem; }
  .bulk-marks .bme-section-heading {
    display: flex;
    align-items: center;
    gap: .625rem;
    margin: 0 0 1.25rem;
    font-size: .875rem;
    font-weight: 600;
    line-height: 1.5;
  }
  .bulk-marks .bme-section-heading > svg {
    flex-shrink: 0;
    color: var(--muted-foreground);
  }
  .bulk-marks .bme-filters {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(11rem, .85fr);
    gap: 1rem;
    align-items: end;
  }
  .bulk-marks .bme-field { min-width: 0; }
  .bulk-marks .bme-label {
    display: block;
    margin-bottom: .5rem;
    font-size: .75rem;
    font-weight: 600;
    line-height: 1.5;
  }
  .bulk-marks .bme-required { color: var(--muted-foreground); }
  .bulk-marks .bme-control {
    width: 100%;
    min-height: 2.875rem;
    padding: .625rem .75rem;
    border: 1px solid var(--input);
    border-radius: .375rem;
    background: var(--background);
    color: var(--foreground);
    font: inherit;
    font-size: .875rem;
    line-height: 1.5;
    transition: border-color 160ms ease;
  }
  .bulk-marks .bme-control:hover:not(:disabled) {
    border-color: var(--muted-foreground);
  }
  .bulk-marks .bme-control:focus-visible,
  .bulk-marks .bme-button:focus-visible,
  .bulk-marks .bme-table-scroll:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 3px;
  }
  .bulk-marks .bme-control:disabled {
    color: var(--muted-foreground);
    background: var(--muted);
    cursor: not-allowed;
  }
  .bulk-marks .bme-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: .625rem;
    min-height: 2.875rem;
    padding: .625rem 1.125rem;
    border: 1px solid transparent;
    border-radius: .375rem;
    background: var(--primary);
    color: var(--primary-foreground);
    font: inherit;
    font-size: .8125rem;
    font-weight: 600;
    line-height: 1.5;
    cursor: pointer;
    transition: transform 180ms cubic-bezier(.2,.8,.2,1), opacity 160ms ease;
  }
  .bulk-marks .bme-button:hover:not(:disabled) { opacity: .9; }
  .bulk-marks .bme-button:active:not(:disabled) { transform: translateY(1px); }
  .bulk-marks .bme-button:disabled { opacity: .5; cursor: not-allowed; }
  .bulk-marks .bme-button > svg { flex-shrink: 0; }
  .bulk-marks .bme-load { width: 100%; }
  .bulk-marks .bme-notice {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    margin-top: 1.25rem;
    padding: .875rem 1rem;
    border: 1px solid var(--border);
    border-radius: .375rem;
    background: var(--muted);
    color: var(--foreground);
    font-size: .875rem;
    line-height: 1.6;
    overflow-wrap: anywhere;
  }
  .bulk-marks .bme-notice > svg { flex-shrink: 0; margin-top: .25rem; }
  .bulk-marks .bme-notice[data-type="success"] > svg { color: var(--primary); }
  .bulk-marks .bme-notice[data-type="error"] {
    border-color: var(--destructive);
    color: var(--destructive);
    background: var(--background);
  }
  .bulk-marks .bme-ledger {
    border-top: 1px solid var(--border);
    animation: bme-reveal 280ms cubic-bezier(.2,.8,.2,1) both;
  }
  .bulk-marks .bme-ledger-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .bulk-marks .bme-ledger-heading .bme-section-heading { margin-bottom: .375rem; }
  .bulk-marks .bme-caption {
    margin: 0;
    color: var(--muted-foreground);
    font-size: .8125rem;
    line-height: 1.65;
  }
  .bulk-marks .bme-save { flex-shrink: 0; min-width: 10.5rem; }
  .bulk-marks .bme-table-scroll {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: .375rem;
    background: var(--background);
  }
  .bulk-marks table {
    width: 100%;
    min-width: 660px;
    border-collapse: collapse;
    table-layout: fixed;
    text-align: left;
    font-size: .875rem;
  }
  .bulk-marks th {
    padding: .875rem 1rem;
    border-bottom: 1px solid var(--border);
    background: var(--muted);
    color: var(--muted-foreground);
    font-size: .75rem;
    font-weight: 500;
    line-height: 1.5;
  }
  .bulk-marks td {
    height: 4.375rem;
    padding: .75rem 1rem;
    border-bottom: 1px solid var(--border);
  }
  .bulk-marks tbody tr:last-child td { border-bottom: 0; }
  .bulk-marks tbody tr:hover,
  .bulk-marks tbody tr:focus-within { background: var(--muted); }
  .bulk-marks .bme-roll-column { width: 11%; }
  .bulk-marks .bme-name-column { width: 32%; }
  .bulk-marks .bme-mark-column { width: 20%; }
  .bulk-marks .bme-total-column { width: 17%; text-align: right; }
  .bulk-marks .bme-roll {
    color: var(--muted-foreground);
    font-variant-numeric: tabular-nums;
  }
  .bulk-marks .bme-student { font-weight: 550; overflow-wrap: anywhere; }
  .bulk-marks .bme-mark {
    min-height: 2.5rem;
    max-width: 7rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .bulk-marks .bme-total {
    color: var(--primary);
    font-weight: 650;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .bulk-marks .bme-summary {
    margin: .875rem 0 0;
    color: var(--muted-foreground);
    font-size: .75rem;
    font-variant-numeric: tabular-nums;
  }
  .bulk-marks .bme-spinner { animation: bme-spin 850ms linear infinite; }
  @keyframes bme-spin { to { transform: rotate(360deg); } }
  @keyframes bme-reveal {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 1023px) {
    .bulk-marks .bme-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 639px) {
    .bulk-marks { padding: 1.5rem 1rem; }
    .bulk-marks h1 { font-size: 1.5rem; }
    .bulk-marks .bme-header { padding-bottom: 1.5rem; }
    .bulk-marks .bme-filters { grid-template-columns: minmax(0, 1fr); }
    .bulk-marks .bme-ledger-heading { align-items: stretch; flex-direction: column; gap: 1rem; }
    .bulk-marks .bme-save { width: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .bulk-marks .bme-ledger, .bulk-marks .bme-spinner { animation: none; }
    .bulk-marks .bme-control, .bulk-marks .bme-button { transition: none; }
    .bulk-marks .bme-button:active:not(:disabled) { transform: none; }
  }
`;

export default function BulkMarkEntryPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const id = useId();
  const requestVersion = useRef(0);
  const mounted = useRef(false);

  const [exams, setExams] = useState<IExam[]>([]);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [studentMarks, setStudentMarks] = useState<IStudentMarkInput[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const t = (en: string, bn: string) => (isBn ? bn : en);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      requestVersion.current += 1;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchInitial = async () => {
      try {
        const [examRes, classRes] = await Promise.all([
          axiosInstance.get("/exams", { signal: controller.signal }),
          axiosInstance.get("/academic/classes", { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        setExams(examRes.data?.data || []);
        setClasses(classRes.data?.data || []);
      } catch {
        if (controller.signal.aborted) return;
        setMsg({
          type: "error",
          text: isBn
            ? "পরীক্ষা ও শ্রেণির তালিকা লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
            : "Could not load exams and classes. Please try refreshing.",
        });
      } finally {
        if (!controller.signal.aborted) setInitialLoading(false);
      }
    };

    setInitialLoading(true);
    void fetchInitial();
    return () => controller.abort();
  }, [isBn]);

  useEffect(() => {
    const controller = new AbortController();
    setSubjects([]);
    setSelectedSubjectId("");

    if (!selectedClassId) {
      setSubjectsLoading(false);
      return () => controller.abort();
    }

    setSubjectsLoading(true);
    axiosInstance
      .get(`/subjects/class/${selectedClassId}`, {
        signal: controller.signal,
      })
      .then((res) => {
        if (controller.signal.aborted) return;
        const subList: ISubject[] = res.data?.data || [];
        setSubjects(subList);
        setSelectedSubjectId(subList[0]?.id ?? "");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setMsg({
          type: "error",
          text: isBn
            ? "বিষয়ের তালিকা লোড করা যায়নি।"
            : "Could not load subjects for this class.",
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) setSubjectsLoading(false);
      });

    return () => controller.abort();
  }, [selectedClassId, isBn]);

  const clearRoster = () => {
    requestVersion.current += 1;
    setStudentMarks([]);
    setLoading(false);
    setMsg(null);
  };

  const handleLoadStudents = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading || submitting) return;

    if (!selectedExamId || !selectedClassId || !selectedSubjectId) {
      setMsg({
        type: "error",
        text: t(
          "Please select an exam, class, and subject.",
          "অনুগ্রহ করে পরীক্ষা, শ্রেণি ও বিষয় নির্বাচন করুন।"
        ),
      });
      return;
    }

    const version = ++requestVersion.current;
    setLoading(true);
    setMsg(null);

    try {
      const res = await axiosInstance.get(
        `/students?classId=${encodeURIComponent(selectedClassId)}`
      );
      if (!mounted.current || version !== requestVersion.current) return;
      const students: IStudent[] = res.data?.data || [];

      setStudentMarks(
        students.map((student) => ({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`.trim(),
          rollNo: student.rollNo,
          mtMarks: 0,
          terminal: 0,
        }))
      );

      if (students.length === 0) {
        setMsg({
          type: "error",
          text: t(
            "No students found in the selected class.",
            "এই শ্রেণিতে কোনো শিক্ষার্থী পাওয়া যায়নি।"
          ),
        });
      }
    } catch {
      if (!mounted.current || version !== requestVersion.current) return;
      setMsg({
        type: "error",
        text: t(
          "Failed to load students. Please try again.",
          "শিক্ষার্থীদের তালিকা লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
        ),
      });
    } finally {
      if (mounted.current && version === requestVersion.current) {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (
    studentId: string,
    field: "mtMarks" | "terminal",
    value: number
  ) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
    setMsg(null);
    setStudentMarks((previous) =>
      previous.map((student) =>
        student.studentId === studentId
          ? { ...student, [field]: safeValue }
          : student
      )
    );
  };

  const handleSubmitBulkMarks = async () => {
    if (
      submitting ||
      loading ||
      studentMarks.length === 0 ||
      !selectedExamId ||
      !selectedClassId ||
      !selectedSubjectId
    ) return;

    setSubmitting(true);
    setMsg(null);

    try {
      await axiosInstance.post("/marks/save-bulk-marks", {
        examId: selectedExamId,
        subjectId: selectedSubjectId,
        marks: studentMarks.map((student) => ({
          studentId: student.studentId,
          mtMarks: Number(student.mtMarks || 0),
          terminal: Number(student.terminal || 0),
        })),
      });
      if (!mounted.current) return;
      setMsg({
        type: "success",
        text: t(
          "All student marks saved successfully.",
          "সকল শিক্ষার্থীর নম্বর সফলভাবে সংরক্ষণ করা হয়েছে।"
        ),
      });
    } catch (error: unknown) {
      if (!mounted.current) return;
      const apiError = error as {
        response?: { data?: { message?: unknown } };
      };
      const serverMessage = apiError?.response?.data?.message;
      setMsg({
        type: "error",
        text:
          typeof serverMessage === "string" && serverMessage.trim()
            ? serverMessage
            : t(
                "Marks could not be saved. Your entries are still here.",
                "নম্বর সংরক্ষণ করা যায়নি। আপনার দেওয়া নম্বরগুলো অক্ষত রয়েছে।"
              ),
      });
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  };

  const canLoad =
    Boolean(selectedExamId && selectedClassId && selectedSubjectId) &&
    !initialLoading &&
    !subjectsLoading &&
    !loading &&
    !submitting;

  return (
    <div className="bulk-marks" lang={isBn ? "bn" : "en"}>
      <style>{componentStyles}</style>

      <header className="bme-header">
        <div className="bme-heading-line">
          <FaPen className="bme-heading-icon" aria-hidden="true" />
          <div>
            <h1>
              {t("Bulk Marks Entry", "পরীক্ষার নম্বর এন্ট্রি")}
            </h1>
            <p className="bme-subtitle">
              {t(
                "Enter and save marks for your class, organized by exam and subject.",
                "পরীক্ষা, শ্রেণি ও বিষয় অনুযায়ী পুরো ক্লাসের নম্বর প্রদান ও সংরক্ষণ করুন।"
              )}
            </p>
          </div>
        </div>
      </header>

      {msg && (
        <div
          className="bme-notice"
          data-type={msg.type}
          role={msg.type === "error" ? "alert" : "status"}
          aria-atomic="true"
        >
          {msg.type === "success" ? (
            <FaCheckCircle aria-hidden="true" />
          ) : (
            <FaExclamationTriangle aria-hidden="true" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <section className="bme-section" aria-labelledby={`${id}-filters`}>
        <h2 id={`${id}-filters`} className="bme-section-heading">
          <FaClipboardList aria-hidden="true" />
          {t("Exam details", "পরীক্ষার বিবরণ")}
        </h2>

        <form className="bme-filters" onSubmit={handleLoadStudents}>
          <div className="bme-field">
            <label className="bme-label" htmlFor={`${id}-exam`}>
              {t("Exam", "পরীক্ষা")} <span className="bme-required" aria-hidden="true">*</span>
            </label>
            <select
              id={`${id}-exam`}
              className="bme-control"
              required
              disabled={initialLoading || submitting}
              value={selectedExamId}
              onChange={(e) => {
                clearRoster();
                setSelectedExamId(e.target.value);
              }}
            >
              <option value="">
                {initialLoading
                  ? t("Loading exams…", "পরীক্ষা লোড হচ্ছে…")
                  : t("Select exam", "পরীক্ষা বেছে নিন")}
              </option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
          </div>

          <div className="bme-field">
            <label className="bme-label" htmlFor={`${id}-class`}>
              {t("Class", "শ্রেণি")} <span className="bme-required" aria-hidden="true">*</span>
            </label>
            <select
              id={`${id}-class`}
              className="bme-control"
              required
              disabled={initialLoading || submitting}
              value={selectedClassId}
              onChange={(e) => {
                clearRoster();
                setSubjects([]);
                setSelectedSubjectId("");
                setSelectedClassId(e.target.value);
              }}
            >
              <option value="">
                {initialLoading
                  ? t("Loading classes…", "শ্রেণি লোড হচ্ছে…")
                  : t("Select class", "শ্রেণি বেছে নিন")}
              </option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bme-field">
            <label className="bme-label" htmlFor={`${id}-subject`}>
              {t("Subject", "বিষয়")} <span className="bme-required" aria-hidden="true">*</span>
            </label>
            <select
              id={`${id}-subject`}
              className="bme-control"
              required
              value={selectedSubjectId}
              disabled={!selectedClassId || subjectsLoading || !subjects.length || submitting}
              onChange={(e) => {
                clearRoster();
                setSelectedSubjectId(e.target.value);
              }}
            >
              <option value="">
                {subjectsLoading
                  ? t("Loading subjects…", "বিষয় লোড হচ্ছে…")
                  : selectedClassId && !subjects.length
                  ? t("No subjects available", "কোনো বিষয় পাওয়া যায়নি")
                  : t("Select subject", "বিষয় বেছে নিন")}
              </option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} · {t("Full marks", "পূর্ণমান")}: {subject.fullMarks}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bme-button bme-load"
            disabled={!canLoad}
            aria-busy={loading}
          >
            {loading ? (
              <FaSpinner className="bme-spinner" aria-hidden="true" />
            ) : (
              <FaSearch aria-hidden="true" />
            )}
            <span>{loading ? t("Loading…", "লোড হচ্ছে…") : t("Load students", "শিক্ষার্থী লোড করুন")}</span>
          </button>
        </form>
      </section>

      {studentMarks.length > 0 && (
        <section
          className="bme-section bme-ledger"
          aria-labelledby={`${id}-marks`}
          aria-busy={submitting || loading}
        >
          <div className="bme-ledger-heading">
            <div>
              <h2 id={`${id}-marks`} className="bme-section-heading">
                <FaPen aria-hidden="true" />
                {t("Student marks", "শিক্ষার্থীদের নম্বর")}
              </h2>
              <p className="bme-caption">
                {t(
                  "Model Test and Terminal Exam",
                  "মডেল টেস্ট ও টার্মিনাল পরীক্ষা"
                )}
              </p>
            </div>
            <button
              type="button"
              className="bme-button bme-save"
              onClick={handleSubmitBulkMarks}
              disabled={submitting || loading}
              aria-busy={submitting}
            >
              {submitting ? (
                <FaSpinner className="bme-spinner" aria-hidden="true" />
              ) : (
                <FaSave aria-hidden="true" />
              )}
              <span>{submitting ? t("Saving…", "সংরক্ষণ হচ্ছে…") : t("Save all marks", "সব নম্বর সংরক্ষণ করুন")}</span>
            </button>
          </div>

          <div
            className="bme-table-scroll"
            role="region"
            aria-labelledby={`${id}-marks`}
            tabIndex={0}
          >
            <table aria-labelledby={`${id}-marks`}>
              <thead>
                <tr>
                  <th scope="col" className="bme-roll-column">{t("Roll no.", "রোল নং")}</th>
                  <th scope="col" className="bme-name-column">{t("Student", "শিক্ষার্থী")}</th>
                  <th scope="col" className="bme-mark-column">{t("Model Test", "মডেল টেস্ট")}</th>
                  <th scope="col" className="bme-mark-column">{t("Terminal", "টার্মিনাল")}</th>
                  <th scope="col" className="bme-total-column">{t("Total", "মোট")}</th>
                </tr>
              </thead>
              <tbody>
                {studentMarks.map((student) => (
                  <tr key={student.studentId}>
                    <td className="bme-roll">{student.rollNo ?? "—"}</td>
                    <td className="bme-student">{student.studentName}</td>
                    <td>
                      <input
                        className="bme-control bme-mark"
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        value={student.mtMarks}
                        disabled={submitting || loading}
                        aria-label={`${student.studentName}, ${t("Model Test marks", "মডেল টেস্টের নম্বর")}`}
                        onChange={(e) => handleInputChange(student.studentId, "mtMarks", e.target.valueAsNumber)}
                      />
                    </td>
                    <td>
                      <input
                        className="bme-control bme-mark"
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        value={student.terminal}
                        disabled={submitting || loading}
                        aria-label={`${student.studentName}, ${t("Terminal Exam marks", "টার্মিনাল পরীক্ষার নম্বর")}`}
                        onChange={(e) => handleInputChange(student.studentId, "terminal", e.target.valueAsNumber)}
                      />
                    </td>
                    <td className="bme-total">
                      {student.mtMarks + student.terminal}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="bme-summary">
            {new Intl.NumberFormat(isBn ? "bn-BD" : "en").format(studentMarks.length)}{" "}
            {t("students", "জন শিক্ষার্থী")}
          </p>
        </section>
      )}
    </div>
  );
}
