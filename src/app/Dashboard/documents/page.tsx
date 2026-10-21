"use client";

import React, { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FaIdCard,
  FaAward,
  FaSearch,
  FaPrint,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
  FaUniversity,
  FaEdit,
  FaSpinner,
} from "react-icons/fa";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

interface IClass {
  id: string;
  name: string;
}

interface IStudent {
  id: string;
  firstName: string;
  lastName: string;
  studentIdNo: string;
}

interface IIdCardData {
  studentId: string;
  studentIdNo: string;
  rollNo?: number;
  fullName: string;
  gender: string;
  dob?: string;
  phone: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  className?: string;
  sectionName?: string;
  profileImage?: string | null;
  qrCode: string;
}

interface ITestimonialData {
  studentName: string;
  studentIdNo: string;
  fatherName: string;
  motherName: string;
  rollNo?: number;
  className?: string;
  session: string;
  dateOfBirth?: string;
  issueDate: string;
  status: string;
}

type Tab = "id_card" | "testimonial";

const EASE = [0.22, 1, 0.36, 1] as const;
const INSTITUTION = "Al-Iman School and Collage";
const INSTITUTION_FULL = "Al-Iman School and Collage";
const SESSION_LABEL = "Academic Session 2026";

/* Shared field styling: one rhythm for every control */
const controlClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50";
const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
const keepColors: React.CSSProperties = {
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
};

const formatDate = (value?: string) =>
  new Date(value || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default function StudentDocumentsPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const reduce = useReducedMotion();
  const uid = useId();

  const [activeTab, setActiveTab] = useState<Tab>("id_card");

  const [classes, setClasses] = useState<IClass[]>([]);
  const [students, setStudents] = useState<IStudent[]>([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [idCardInfo, setIdCardInfo] = useState<IIdCardData | null>(null);
  const [testimonial, setTestimonial] = useState<ITestimonialData | null>(null);

  const [fatherNameInput, setFatherNameInput] = useState("");
  const [motherNameInput, setMotherNameInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axiosInstance
      .get("/academic/classes")
      .then((res) => setClasses(res.data?.data || []))
      .catch((err) => console.error("Failed to load classes", err));
  }, []);

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

  const handleClassChange = (id: string) => {
    setSelectedClassId(id);
    setSelectedStudentId(""); // a student from the previous class must not stay selected
  };

  const handleTab = (tab: Tab) => {
    setActiveTab(tab);
    setError(null);
  };

  const handleGenerateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError(
        isBn
          ? "অনুগ্রহ করে একজন শিক্ষার্থী নির্বাচন করুন।"
          : "Please select a student."
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (activeTab === "id_card") {
        setIdCardInfo(null);
        const res = await axiosInstance.get(`/documents/id_card/${selectedStudentId}`);
        const data = res.data?.data?.idCardInfo || res.data?.idCardInfo;
        setIdCardInfo(data);
      } else {
        setTestimonial(null);
        const res = await axiosInstance.get(`/documents/testimonial/${selectedStudentId}`);
        const data: ITestimonialData = res.data?.data || res.data;
        setTestimonial(data);

        setFatherNameInput(data.fatherName && data.fatherName !== "N/A" ? data.fatherName : "");
        setMotherNameInput(data.motherName && data.motherName !== "N/A" ? data.motherName : "");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (isBn ? "নথি তৈরির সময় সমস্যা হয়েছে।" : "Failed to generate document.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const hasDocument =
    (activeTab === "id_card" && !!idCardInfo) ||
    (activeTab === "testimonial" && !!testimonial);

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "id_card", icon: <FaIdCard aria-hidden />, label: isBn ? "আইডি কার্ড" : "ID Card" },
    { id: "testimonial", icon: <FaAward aria-hidden />, label: isBn ? "প্রশংসাপত্র" : "Testimonial" },
  ];

  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tabs[(index + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    handleTab(next.id);
    document.getElementById(`${uid}-tab-${next.id}`)?.focus();
  };

  // One quiet reveal when a document arrives; nothing else moves on its own.
  const reveal = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14, filter: "blur(4px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  return (
    <div className="space-y-8">
      {/* ───────── Header + tabs (hidden in print) ───────── */}
      <header className="flex flex-col justify-between gap-5 print:hidden md:flex-row md:items-end">
        <div className="max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {isBn ? "শিক্ষার্থী ডক্যুমেন্ট সেন্টার" : "Student Document Center"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isBn
              ? "একই জায়গা থেকে ডিজিটাল আইডি কার্ড এবং প্রাতিষ্ঠানিক প্রশংসাপত্র তৈরি করুন।"
              : "Generate digital ID cards and official academic testimonials in one place."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="tablist"
            aria-label={isBn ? "নথির ধরন" : "Document type"}
            className="flex rounded-xl border border-border bg-muted/50 p-1"
          >
            {tabs.map((tab, i) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`${uid}-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  aria-controls={`${uid}-panel`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => handleTab(tab.id)}
                  onKeyDown={(e) => onTabKeyDown(e, i)}
                  className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={`${uid}-pill`}
                      aria-hidden
                      className="absolute inset-0 rounded-lg border border-border bg-card shadow-sm"
                      transition={
                        reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }
                      }
                    />
                  )}
                  <span className={`relative text-primary ${active ? "" : "opacity-60"}`}>
                    {tab.icon}
                  </span>
                  <span className="relative">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {hasDocument && (
            <button
              type="button"
              onClick={handlePrint}
              className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] motion-reduce:transition-none"
            >
              <FaPrint aria-hidden />
              <span>{isBn ? "প্রিন্ট করুন" : "Print Document"}</span>
            </button>
          )}
        </div>
      </header>

      {/* ───────── Selection form (hidden in print) ───────── */}
      <form
        onSubmit={handleGenerateDocument}
        className="grid grid-cols-1 items-end gap-4 rounded-xl border border-border bg-card p-5 print:hidden md:grid-cols-[1fr_1fr_auto] md:p-6"
      >
        <div>
          <label htmlFor={`${uid}-class`} className={labelClass}>
            {isBn ? "শ্রেণি (Class)" : "Filter Class"}
          </label>
          <select
            id={`${uid}-class`}
            value={selectedClassId}
            onChange={(e) => handleClassChange(e.target.value)}
            className={controlClass}
          >
            <option value="">{isBn ? "-- শ্রেণি সিলেক্ট করুন --" : "-- Select Class --"}</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${uid}-student`} className={labelClass}>
            {isBn ? "শিক্ষার্থী (Student)" : "Select Student"}
          </label>
          <select
            id={`${uid}-student`}
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            disabled={!selectedClassId}
            className={controlClass}
          >
            <option value="">
              {isBn ? "-- শিক্ষার্থী সিলেক্ট করুন --" : "-- Select Student --"}
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
          aria-busy={loading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:opacity-60 motion-reduce:transition-none"
        >
          {loading ? (
            <FaSpinner aria-hidden className="animate-spin motion-reduce:animate-none" />
          ) : (
            <FaSearch aria-hidden />
          )}
          <span>
            {loading
              ? isBn
                ? "তৈরি হচ্ছে..."
                : "Generating..."
              : activeTab === "id_card"
              ? isBn
                ? "আইডি কার্ড তৈরি করুন"
                : "Generate ID Card"
              : isBn
              ? "প্রশংসাপত্র তৈরি করুন"
              : "Generate Testimonial"}
          </span>
        </button>
      </form>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive print:hidden"
        >
          {error}
        </div>
      )}

      {/* ───────── Document stage ───────── */}
      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${activeTab}`}>
        {!hasDocument && !loading && !error && (
          <p className="rounded-xl border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground print:hidden">
            {activeTab === "id_card"
              ? isBn
                ? "শ্রেণি ও শিক্ষার্থী নির্বাচন করে আইডি কার্ড তৈরি করুন।"
                : "Choose a class and student to generate an ID card."
              : isBn
              ? "শ্রেণি ও শিক্ষার্থী নির্বাচন করে প্রশংসাপত্র তৈরি করুন।"
              : "Choose a class and student to generate a testimonial."}
          </p>
        )}

        <AnimatePresence mode="wait">
          {/* ───── ID CARD ───── */}
          {activeTab === "id_card" && idCardInfo && (
            <motion.div
              key="id"
              className="flex flex-col items-center justify-center gap-8 py-4 md:flex-row md:items-start print:gap-4 print:py-0"
            >
              {/* Front */}
              <motion.article
                {...reveal(0)}
                style={keepColors}
                aria-label={isBn ? "আইডি কার্ডের সামনের পাশ" : "ID card front"}
                className="relative flex h-[480px] w-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5 print:border-black print:shadow-none"
              >
                <div className="bg-emerald-900 px-5 pb-14 pt-5 text-white">
                  <div className="flex items-center gap-2.5">
                    <FaUniversity aria-hidden className="text-emerald-300" />
                    <span className="text-base font-semibold tracking-wide">{INSTITUTION}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-200/90">Official student ID card</p>
                </div>

                {/* Portrait overlaps the band: the one deliberate move on this card */}
                <div className="-mt-12 flex flex-col items-center px-5">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-4 border-card bg-muted ring-1 ring-border">
                    {idCardInfo.profileImage ? (
                      <img
                        src={idCardInfo.profileImage}
                        alt={idCardInfo.fullName || "Student"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FaUser aria-hidden className="text-3xl text-muted-foreground/60" />
                    )}
                  </div>
                  <h2 className="mt-3 max-w-[270px] truncate text-lg font-semibold leading-tight text-foreground">
                    {idCardInfo.fullName || "N/A"}
                  </h2>
                  <p className="mt-1 font-mono text-xs font-medium tracking-wide text-emerald-700 dark:text-emerald-400">
                    ID {idCardInfo.studentIdNo || "N/A"}
                  </p>
                </div>

                <dl className="mt-auto space-y-0 px-6 pb-4 text-[13px]">
                  {[
                    [
                      "Class",
                      `${idCardInfo.className || "N/A"}${
                        idCardInfo.sectionName ? ` (${idCardInfo.sectionName})` : ""
                      }`,
                    ],
                    ["Roll No", String(idCardInfo.rollNo || "N/A")],
                    ["Guardian", idCardInfo.guardianName || "N/A"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-b-0"
                    >
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="max-w-[170px] truncate text-right font-medium text-foreground">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>

                <footer className="border-t border-border/70 bg-muted/40 px-4 py-2.5 text-center text-[11px] text-muted-foreground">
                  {SESSION_LABEL}
                </footer>
              </motion.article>

              {/* Back */}
              <motion.article
                {...reveal(0.12)}
                style={keepColors}
                aria-label={isBn ? "আইডি কার্ডের পেছনের পাশ" : "ID card back"}
                className="flex h-[480px] w-[320px] flex-col rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 print:border-black print:shadow-none md:mt-8"
              >
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Emergency &amp; verification
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    If found, please return to school administration.
                  </p>
                </div>

                <div className="my-auto flex flex-col items-center gap-3">
                  <div className="rounded-lg border border-border bg-white p-2">
                    {idCardInfo.qrCode ? (
                      <img
                        src={idCardInfo.qrCode}
                        alt="Student Verification QR Code"
                        className="h-28 w-28 object-contain"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center text-center text-[11px] text-neutral-500">
                        QR Not Available
                      </div>
                    )}
                  </div>
                  <p className="max-w-[200px] text-center text-[11px] leading-4 text-muted-foreground">
                    Scan the QR code for official student authentication.
                  </p>
                </div>

                <dl className="space-y-2.5 border-t border-border/70 pt-4 text-[13px]">
                  <div className="flex items-start gap-2.5">
                    <FaPhone aria-hidden className="mt-1 shrink-0 text-[11px] text-emerald-600" />
                    <div className="min-w-0">
                      <dt className="text-[11px] text-muted-foreground">Emergency</dt>
                      <dd className="truncate font-medium text-foreground">
                        {idCardInfo.guardianPhone || "N/A"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <FaMapMarkerAlt aria-hidden className="mt-1 shrink-0 text-[11px] text-emerald-600" />
                    <div className="min-w-0">
                      <dt className="text-[11px] text-muted-foreground">Address</dt>
                      <dd className="line-clamp-2 font-medium text-foreground">
                        {idCardInfo.address || "N/A"}
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-5 text-center">
                  <div className="mx-auto mb-1.5 w-32 border-b border-foreground/40" />
                  <p className="text-[11px] font-medium text-foreground">Authorized signature</p>
                </div>
              </motion.article>
            </motion.div>
          )}

          {/* ───── TESTIMONIAL ───── */}
          {activeTab === "testimonial" && testimonial && (
            <motion.div key="testimonial" className="space-y-6">
              {/* Parent names: a plain inline step, not a second card */}
              <fieldset className="mx-auto max-w-4xl rounded-xl border border-border bg-muted/20 p-5 print:hidden">
                <legend className="flex items-center gap-2 px-2 text-sm font-medium text-foreground">
                  <FaEdit aria-hidden className="text-primary" />
                  {isBn
                    ? "পিতা ও মাতার নাম যাচাই / সম্পাদন করুন"
                    : "Verify or edit parents' names"}
                </legend>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${uid}-father`} className={labelClass}>
                      {isBn ? "পিতার নাম (Father's Name)" : "Father's Name"}
                    </label>
                    <input
                      id={`${uid}-father`}
                      type="text"
                      value={fatherNameInput}
                      onChange={(e) => setFatherNameInput(e.target.value)}
                      placeholder="Enter father's name"
                      className={controlClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-mother`} className={labelClass}>
                      {isBn ? "মাতার নাম (Mother's Name)" : "Mother's Name"}
                    </label>
                    <input
                      id={`${uid}-mother`}
                      type="text"
                      value={motherNameInput}
                      onChange={(e) => setMotherNameInput(e.target.value)}
                      placeholder="Enter mother's name"
                      className={controlClass}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Certificate: paper, an inset hairline frame, serif type */}
              <motion.article
                {...reveal(0)}
                style={keepColors}
                aria-label="Academic testimonial"
                className="mx-auto max-w-4xl rounded-md border border-border bg-card p-3 shadow-xl shadow-black/5 sm:p-4 print:m-0 print:max-w-none print:border-black print:shadow-none"
              >
                <div className="border border-emerald-800/30 px-6 py-10 sm:px-14 sm:py-14 dark:border-emerald-400/25">
                  <header className="border-b border-border pb-8 text-center">
                    <FaUniversity
                      aria-hidden
                      className="mx-auto text-2xl text-emerald-800 dark:text-emerald-400"
                    />
                    <h2 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
                      {INSTITUTION_FULL}
                    </h2>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Estd. 2015 &middot; Government recognized educational institution
                    </p>
                    <p className="mt-8 font-serif text-lg italic text-emerald-800 dark:text-emerald-400 sm:text-xl">
                      Academic Testimonial Certificate
                    </p>
                  </header>

                  <div className="mx-auto mt-10 max-w-[62ch] space-y-6 font-serif text-base leading-8 text-foreground/90 sm:text-lg sm:leading-9">
                    <p>
                      This is to certify that{" "}
                      <strong className="px-1 font-semibold text-foreground underline decoration-foreground/30 underline-offset-4">
                        {testimonial.studentName || "N/A"}
                      </strong>
                      , son/daughter of{" "}
                      <strong className="px-1 font-semibold text-foreground underline decoration-foreground/30 underline-offset-4">
                        {fatherNameInput || testimonial.fatherName || "_________________"}
                      </strong>{" "}
                      (Father) and{" "}
                      <strong className="px-1 font-semibold text-foreground underline decoration-foreground/30 underline-offset-4">
                        {motherNameInput || testimonial.motherName || "_________________"}
                      </strong>{" "}
                      (Mother), bearing Student ID No{" "}
                      <strong className="font-sans font-semibold text-emerald-700 dark:text-emerald-400">
                        {testimonial.studentIdNo || "N/A"}
                      </strong>
                      , was a regular student of Class{" "}
                      <strong className="font-semibold">{testimonial.className || "N/A"}</strong> (Roll
                      No <strong className="font-semibold">{testimonial.rollNo || "N/A"}</strong>) in
                      the academic session{" "}
                      <strong className="font-semibold">{testimonial.session || "2026"}</strong>.
                    </p>

                    <p>
                      To the best of my knowledge and belief, he/she bears a good moral character and
                      demonstrated commendable academic discipline, sincerity, and moral conduct
                      throughout his/her tenure at this institution. He/she has{" "}
                      <strong className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {testimonial.status || "Passed with distinction"}
                      </strong>
                      .
                    </p>

                    <p>
                      I wish him/her every success, good health, and a bright, prosperous future in
                      life.
                    </p>
                  </div>

                  <footer className="mt-16 flex flex-wrap items-end justify-between gap-8 text-sm sm:mt-20">
                    <p className="text-muted-foreground">
                      Date of issue{" "}
                      <span className="block pt-0.5 font-semibold text-foreground sm:inline sm:pt-0">
                        {formatDate(testimonial.issueDate)}
                      </span>
                    </p>

                    <div className="ml-auto text-center">
                      <div className="mx-auto mb-2 w-52 border-b border-foreground/50" />
                      <p className="font-semibold text-foreground">Headmaster / Principal</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{INSTITUTION_FULL}</p>
                    </div>
                  </footer>
                </div>
              </motion.article>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}