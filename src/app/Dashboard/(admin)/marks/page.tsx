"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const springSoft = { type: "spring" as const, stiffness: 380, damping: 32 };
const springGentle = { type: "spring" as const, stiffness: 260, damping: 28 };

export default function MarkEntryPage() {
  const shouldReduceMotion = useReducedMotion();

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  const [students, setStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<{
    [studentId: string]: { mtMarks: number; terminal: number };
  }>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getAuthHeaders = () => {
    let token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("auth_token");

    if (!token && typeof document !== "undefined") {
      const match = document.cookie.match(
        new RegExp("(^| )accessToken=([^;]+)")
      );
      if (match) token = match[2];
    }

    if (!token) {
      console.warn(
        "⚠️ No Access Token found! Please log in as SUPER_ADMIN or TEACHER."
      );
      return { headers: {} };
    }

    const cleanToken = token.replace(/^Bearer\s+/i, "");

    return {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
    };
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const config = getAuthHeaders();

        const [classRes, examRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/academic/classes`, config),
          axios.get(`${API_BASE_URL}/exams`, config),
        ]);

        setClasses(classRes.data.data || []);
        setExams(examRes.data.data || []);
      } catch (err: any) {
        console.error("Error fetching initial dropdown data:", err);
        if (err.response?.status === 401) {
          toast.error(
            "Session expired or Unauthorized! Make sure you are logged in as SUPER_ADMIN or TEACHER."
          );
        }
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const fetchClassDetails = async () => {
      try {
        const config = getAuthHeaders();

        const [secRes, subRes] = await Promise.all([
          axios.get(
            `${API_BASE_URL}/academic/sections?classId=${selectedClass}`,
            config
          ),
          axios.get(
            `${API_BASE_URL}/subjects?classId=${selectedClass}`,
            config
          ),
        ]);

        setSections(secRes.data.data || []);
        setSubjects(subRes.data.data || []);
      } catch (err) {
        console.error("Error fetching sections/subjects:", err);
      }
    };
    fetchClassDetails();
  }, [selectedClass]);

  const handleLoadStudents = async () => {
    if (
      !selectedClass ||
      !selectedSection ||
      !selectedSubject ||
      !selectedExam
    ) {
      toast.error("Please select Class, Section, Subject, and Exam Term!");
      return;
    }

    setLoading(true);
    try {
      const config = getAuthHeaders();

      const studentRes = await axios.get(
        `${API_BASE_URL}/students?classId=${selectedClass}&sectionId=${selectedSection}`,
        config
      );

      const fetchedStudents = studentRes.data.data || [];
      setStudents(fetchedStudents);

      const initialMarks: any = {};
      fetchedStudents.forEach((st: any) => {
        initialMarks[st.id] = { mtMarks: 0, terminal: 0 };
      });
      setMarksData(initialMarks);
    } catch (err) {
      toast.error("Failed to load students list!");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    studentId: string,
    field: "mtMarks" | "terminal",
    value: string
  ) => {
    const numVal = Math.max(0, Number(value) || 0);
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numVal,
      },
    }));
  };

  const handleSubmitMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) return;

    setSubmitting(true);
    try {
      const config = getAuthHeaders();

      const payload = {
        examId: selectedExam,
        subjectId: selectedSubject,
        marks: students.map((st) => ({
          studentId: st.id,
          mtMarks: marksData[st.id]?.mtMarks || 0,
          terminal: marksData[st.id]?.terminal || 0,
        })),
      };

      await axios.post(
        `${API_BASE_URL}/marks/save-bulk-marks`,
        payload,
        config
      );
      toast.success("Marks saved and GPA calculated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save marks!");
    } finally {
      setSubmitting(false);
    }
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubject);
  const showMT = currentSubject?.hasMT !== false;

  const fadeUp = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.12 },
      }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: springGentle,
      };

  return (
    <div className="relative min-h-[60vh] p-4 sm:p-6 max-w-7xl mx-auto space-y-7 font-sans text-foreground">
      {/* Header */}
      <motion.header {...fadeUp} className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Results
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.7rem]">
          Exam & Result Entry
        </h1>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
          Select class, section, subject and exam, then enter marks for the
          class.
        </p>
      </motion.header>

      {/* Filters */}
      <motion.div
        {...fadeUp}
        transition={{ ...springGentle, delay: shouldReduceMotion ? 0 : 0.03 }}
        className="rounded-lg border border-border/80 bg-card p-5 sm:p-6"
      >
        <div className="mb-5">
          <h2 className="text-sm font-medium text-foreground">Filters</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            All fields required before loading students
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label
              htmlFor="class-select"
              className="block text-xs font-medium text-muted-foreground"
            >
              Class
            </label>
            <select
              id="class-select"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/20"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection("");
                setSelectedSubject("");
              }}
            >
              <option value="">— Choose Class —</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="section-select"
              className="block text-xs font-medium text-muted-foreground"
            >
              Section
            </label>
            <select
              id="section-select"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/20 disabled:opacity-50"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">— Choose Section —</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="subject-select"
              className="block text-xs font-medium text-muted-foreground"
            >
              Subject
            </label>
            <select
              id="subject-select"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/20 disabled:opacity-50"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={!selectedClass}
            >
              <option value="">— Choose Subject —</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} (Full Marks: {sub.fullMarks})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="exam-select"
              className="block text-xs font-medium text-muted-foreground"
            >
              Exam Term
            </label>
            <select
              id="exam-select"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/20"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="">— Choose Exam —</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleLoadStudents}
            disabled={loading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30 disabled:pointer-events-none disabled:opacity-40"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                Loading…
              </>
            ) : (
              "Load Student List"
            )}
          </button>
        </div>
      </motion.div>

      {/* Marks table */}
      <AnimatePresence>
        {students.length > 0 && (
          <motion.form
            onSubmit={handleSubmitMarks}
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={shouldReduceMotion ? { duration: 0.12 } : springGentle}
            className="overflow-hidden rounded-lg border border-border/80 bg-card"
          >
            <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="space-y-0.5">
                <h2 className="text-sm font-medium text-foreground">
                  Enter marks
                </h2>
                <p className="text-xs text-muted-foreground">
                  {currentSubject?.name}
                  {currentSubject?.fullMarks != null && (
                    <> · Full marks {currentSubject.fullMarks}</>
                  )}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/30 disabled:pointer-events-none disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
                    Saving…
                  </>
                ) : (
                  "Save All Marks & Calculate GPA"
                )}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/20">
                    <th className="px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:px-6">
                      Roll
                    </th>
                    <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Student Name
                    </th>
                    <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Student ID
                    </th>
                    {showMT && (
                      <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        MT Marks
                      </th>
                    )}
                    <th className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Terminal
                    </th>
                    <th className="px-5 py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:px-6">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {students.map((st, index) => {
                    const mt = marksData[st.id]?.mtMarks || 0;
                    const term = marksData[st.id]?.terminal || 0;
                    const total = mt + term;

                    return (
                      <motion.tr
                        key={st.id}
                        initial={
                          shouldReduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, y: 4 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        transition={
                          shouldReduceMotion
                            ? { duration: 0.08 }
                            : {
                                ...springSoft,
                                delay: Math.min(index * 0.015, 0.28),
                              }
                        }
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-2.5 font-medium tabular-nums text-foreground sm:px-6">
                          {st.rollNo ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-foreground">
                          {st.firstName} {st.lastName}
                        </td>
                        <td className="px-3 py-2.5 text-sm text-muted-foreground">
                          {st.studentIdNo}
                        </td>
                        {showMT && (
                          <td className="px-3 py-2.5">
                            <input
                              type="number"
                              min={0}
                              className="h-8 w-[5.25rem] rounded-md border border-input bg-background px-2.5 font-mono text-sm tabular-nums text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/20"
                              value={marksData[st.id]?.mtMarks || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  st.id,
                                  "mtMarks",
                                  e.target.value
                                )
                              }
                              aria-label={`MT marks for ${st.firstName} ${st.lastName}`}
                            />
                          </td>
                        )}
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min={0}
                            required
                            className="h-8 w-[5.5rem] rounded-md border border-input bg-background px-2.5 font-mono text-sm tabular-nums text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-foreground/20"
                            value={marksData[st.id]?.terminal || ""}
                            onChange={(e) =>
                              handleInputChange(
                                st.id,
                                "terminal",
                                e.target.value
                              )
                            }
                            aria-label={`Terminal marks for ${st.firstName} ${st.lastName}`}
                          />
                        </td>
                        <td className="px-5 py-2.5 text-center sm:px-6">
                          <span className="inline-block min-w-[2.25rem] font-mono text-sm font-semibold tabular-nums text-foreground">
                            {total}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}