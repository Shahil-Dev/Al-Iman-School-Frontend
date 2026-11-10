"use client";

import React, { useRef, useState } from "react";
import {
  FaPrint,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaDownload,
  FaCheck,
} from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";

export interface ITranscriptMark {
  subjectId: string;
  subjectName: string;
  fullMarks: number;
  mtMarks: number;
  terminal: number;
  totalMarks: number;
  grade: string;
  gradePoint: number;
}

export interface ITranscriptProps {
  studentName: string;
  className?: string;
  sectionName?: string;
  rollNo?: string | number;
  studentCode?: string;
  yearSession?: string;
  examName: string;
  marks: ITranscriptMark[];
  onPrint?: () => void;
  hideHeader?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Design tokens                                                              */
/*  Plain hex values on purpose: html2canvas and print resolve them reliably.  */
/*  Accent identity: the school's amber, with charcoal ink.                    */
/* -------------------------------------------------------------------------- */
const INK = "#222222";
const AMBER = "#F3A900";

const TOKENS = {
  "--paper": "#FCFDF9",
  "--ink": INK,
  "--muted": "#65655D",
  "--hair": "#D8D8CF",
  "--wash": "#F3F3EC",
  "--amber": AMBER,
  "--amber-deep": "#8F5E00",
  "--fail": "#B42318",
} as React.CSSProperties;

/* One orchestrated entrance; everything else responds to the user. */
const CSS = `
@keyframes at-sheet{from{opacity:0;transform:translate3d(0,8px,0)}to{opacity:1;transform:none}}
@keyframes at-draw{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.at-sheet{animation:at-sheet .6s cubic-bezier(.22,1,.36,1) both}
.at-draw{transform-origin:left center;animation:at-draw .9s cubic-bezier(.22,1,.36,1) .15s both}
.at-draw[data-side="right"]{transform-origin:right center}
.at-btn{transition:transform .35s cubic-bezier(.22,1,.36,1),background-color .2s,border-color .2s}
.at-btn:hover:not(:disabled){transform:translate3d(0,-1px,0)}
.at-btn:active:not(:disabled){transform:scale(.98)}
@media (prefers-reduced-motion:reduce){
  .at-sheet,.at-draw{animation:none!important;opacity:1!important;transform:none!important}
  .at-btn{transition:none}
  .at-btn:hover:not(:disabled),.at-btn:active:not(:disabled){transform:none}
}
@media print{.at-sheet,.at-draw{animation:none!important;opacity:1!important;transform:none!important}}
`;

const GRADE_SCALE: [string, string, string, string][] = [
  ["A+", "80-100", "5", "Excellent"],
  ["A", "70-79", "4", "Very Good"],
  ["A-", "60-69", "3.5", "Good"],
  ["B", "50-59", "3", "Satisfactory"],
  ["C", "40-49", "2", "Pass"],
  ["F", "0-39", "0", "Fail"],
];

const RATINGS = ["Excellent", "Very Good", "Good"];

/* Shared class strings */
const LABEL = "text-[11px] font-medium text-[color:var(--muted)]";
const TH_TOP = "border-t-[1.5px] border-t-[color:var(--ink)]";
const TH_BASE =
  "bg-[color:var(--wash)] px-2.5 py-2 align-middle text-[11px] font-semibold leading-tight text-[color:var(--ink)]";
const TD = "px-2.5 py-2";
const BTN =
  "at-btn group inline-flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222] disabled:cursor-not-allowed disabled:opacity-60";

/* -------------------------------------------------------------------------- */
/*  Small internal pieces                                                      */
/* -------------------------------------------------------------------------- */

/** Thin brand strip. Top one anchors left, bottom one anchors right. */
function BrandStrip({ side }: { side: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 100 6"
      preserveAspectRatio="none"
      className="at-draw block h-1.5 w-full"
      data-side={side}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="100" height="6" fill={AMBER} />
      <polygon
        points={side === "left" ? "0,0 34,0 32.5,6 0,6" : "100,0 66,0 67.5,6 100,6"}
        fill={INK}
      />
    </svg>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className={LABEL}>{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold tabular-nums">{children}</dd>
    </div>
  );
}

/** Tick boxes. State lives in React so ticks are present in the PDF capture. */
function TickGroup({ label, options }: { label: string; options: string[] }) {
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (o: string) =>
    setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]));

  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-x-4 gap-y-1.5"
    >
      <span
        aria-hidden="true"
        className="w-full shrink-0 font-semibold sm:w-32"
      >
        {label}
      </span>
      {options.map((o) => {
        const on = picked.includes(o);
        return (
          <label key={o} className="group flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={on}
              onChange={() => toggle(o)}
            />
            <span className="grid h-3.5 w-3.5 place-items-center border border-[color:var(--ink)] bg-white transition-colors duration-200 group-hover:border-[color:var(--amber-deep)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#222222]">
              {on && (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden="true">
                  <path
                    d="M2.5 6.5l2.2 2.2L9.5 3.5"
                    fill="none"
                    stroke={INK}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span>{o}</span>
          </label>
        );
      })}
    </div>
  );
}

function SignLine({ label }: { label: string }) {
  return (
    <div className="w-44 text-center">
      <div className="h-10 border-b border-[color:var(--ink)]" />
      <p className="mt-1.5 text-[11px] font-medium">{label}</p>
    </div>
  );
}

function FieldLine({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <span className="shrink-0 font-medium">{label}</span>
      <span className="h-5 min-w-0 flex-1 border-b border-[color:var(--muted)]" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function AcademicTranscript({
  studentName,
  className = "N/A",
  sectionName,
  rollNo = "N/A",
  // `studentCode` stays in the public props but is not rendered (unchanged behaviour).
  yearSession = new Date().getFullYear().toString(),
  examName,
  marks,
  onPrint,
  hideHeader = false,
}: ITranscriptProps) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const t = (en: string, bn: string) => (isBn ? bn : en);

  // Ref for the transcript area captured in the PDF
  const transcriptRef = useRef<HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportOk, setExportOk] = useState(false);

  // Calculations (unchanged)
  const totalFullMarks = marks.reduce((acc, curr) => acc + curr.fullMarks, 0);
  const totalObtained = marks.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const totalGradePoints = marks.reduce((acc, curr) => acc + curr.gradePoint, 0);
  const gpa = marks.length > 0 ? (totalGradePoints / marks.length).toFixed(2) : "0.00";
  const failedCount = marks.filter((m) => m.grade === "F").length;
  const isPassed = marks.length > 0 && failedCount === 0;

  // Current date for the header
  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, " | ");
  const [dd, mm, yyyy] = today.split(" | ");

  // PDF download
  const handleDownloadPDF = async () => {
    if (!transcriptRef.current || isExporting) return;
    setIsExporting(true);
    setExportError("");
    setExportOk(false);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(transcriptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FCFDF9",
        logging: false,
        // Always capture the desktop layout, even when downloaded from a phone.
        windowWidth: 1100,
        // Never capture a half-faded frame.
        onclone: (doc) => {
          const s = doc.createElement("style");
          s.textContent =
            ".at-sheet,.at-draw{animation:none!important;opacity:1!important;transform:none!important}";
          doc.head.appendChild(s);
        },
      });

      // PNG keeps the type crisp. JPEG ringing is visible on small numerals.
      const imgData = canvas.toDataURL("image/png");

      // Fit the whole transcript on one A4 page.
      const pdf = new jsPDF("p", "mm", "a4", true);
      pdf.setProperties({
        title: `${studentName} — ${examName}`,
        subject: "Academic Transcript",
        author: "Al-Iman School & College",
        creator: "AcademicTranscript",
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      let w = pageW;
      let h = w * ratio;
      if (h > pageH) {
        h = pageH;
        w = h / ratio;
      }
      pdf.addImage(imgData, "PNG", (pageW - w) / 2, 0, w, h);

      const safeName = studentName.replace(/\s+/g, "_");
      const safeExam = examName.replace(/\s+/g, "_");
      pdf.save(`${safeName}_${safeExam}_Transcript.pdf`);

      setExportOk(true);
      window.setTimeout(() => setExportOk(false), 2200);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setExportError(
        t(
          "The PDF could not be created. Please try again.",
          "পিডিএফ তৈরি করা যায়নি। আবার চেষ্টা করুন।"
        )
      );
    } finally {
      setIsExporting(false);
    }
  };

  const summaryRows: [string, React.ReactNode][] = [
    [
      "Result Status",
      <span
        key="status"
        className={`inline-flex items-center gap-2 font-bold ${
          isPassed ? "" : "text-[color:var(--fail)]"
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${
            isPassed
              ? "bg-[color:var(--amber)] ring-2 ring-[color:var(--amber)]/25"
              : "bg-[color:var(--fail)]"
          }`}
        />
        {isPassed ? "Passed" : "Failed"}
      </span>,
    ],
    ["Section Position", "-"],
    ["GPA (without 5th)", gpa],
    ["Failed Subject", failedCount],
    ["Working Days", "-"],
    ["Total Presence", "-"],
    ["Total Absent", "-"],
  ];

  return (
    <div
      style={TOKENS}
      className="mx-auto w-full max-w-5xl bg-[#EDEDE6] p-2 font-sans text-[color:var(--ink)] sm:rounded-xl sm:p-6 print:m-0 print:rounded-none print:bg-white print:p-0"
    >
      <style>{CSS}</style>

      {/* Actions (screen only) */}
      {!hideHeader && (
        <div
          id="transcript-actions"
          className="mb-4 flex flex-wrap items-center justify-end gap-3 print:hidden"
        >
          <p
            role="status"
            aria-live="polite"
            className={`mr-auto text-xs font-medium ${
              exportError
                ? "text-[color:var(--fail)]"
                : "text-[color:var(--amber-deep)]"
            }`}
          >
            {exportError ||
              (exportOk ? t("PDF downloaded.", "পিডিএফ ডাউনলোড হয়েছে।") : "")}
          </p>

          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              disabled={isExporting}
              className={`${BTN} border border-[#222222]/25 bg-white text-[#222222] hover:border-[#222222]/60`}
            >
              <FaPrint aria-hidden="true" className="text-[13px]" />
              {t("Print Transcript", "প্রিন্ট করুন")}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            aria-busy={isExporting}
            className={`${BTN} bg-[#F3A900] text-[#222222] hover:bg-[#E09C00]`}
          >
            {isExporting ? (
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  opacity=".25"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            ) : exportOk ? (
              <FaCheck aria-hidden="true" className="text-[12px]" />
            ) : (
              <FaDownload
                aria-hidden="true"
                className="text-[13px] transition-transform duration-300 group-hover:translate-y-0.5 motion-reduce:transition-none"
              />
            )}
            {isExporting
              ? t("Preparing…", "প্রস্তুত হচ্ছে…")
              : exportOk
              ? t("Downloaded", "ডাউনলোড হয়েছে")
              : t("Download PDF", "পিডিএফ ডাউনলোড")}
          </button>
        </div>
      )}

      {/* --- OFFICIAL TRANSCRIPT (this area is captured in the PDF) --- */}
      <article
        ref={transcriptRef}
        aria-label={t("Academic transcript", "একাডেমিক ট্রান্সক্রিপ্ট")}
        aria-busy={isExporting || undefined}
        className={`at-sheet relative flex min-h-[1000px] flex-col overflow-hidden border border-[color:var(--hair)] bg-[color:var(--paper)] shadow-[0_1px_2px_rgba(34,34,34,0.06),0_18px_40px_-24px_rgba(34,34,34,0.3)] [-webkit-print-color-adjust:exact] [print-color-adjust:exact] print:min-h-[1050px] print:border-none print:shadow-none ${
          isExporting ? "pointer-events-none" : ""
        }`}
      >
        {/* Watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center pt-40 opacity-[0.05]"
        >
          <img
            src="/Image/logo aliman.jpg"
            alt=""
            className="h-auto w-[560px] max-w-[80%] select-none object-contain grayscale"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Letterhead */}
        <header className="relative z-10">
          <BrandStrip side="left" />

          <div className="px-6 pt-7 sm:px-10">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left print:flex-row print:items-start print:justify-between print:text-left">
              <div>
                <h1 className="text-[1.55rem] font-extrabold leading-[1.05] tracking-tight sm:text-[2rem]">
                  AL-IMAN SCHOOL &amp; COLLEGE
                </h1>
                <p className="mt-1.5 text-lg font-semibold leading-tight text-[color:var(--amber-deep)] sm:text-[1.25rem]">
                  আল-ঈমান স্কুল এন্ড কলেজ
                </p>
              </div>
              <p className="shrink-0 self-start border border-[color:var(--ink)] px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                স্থাপিত : ২০০৯ইং.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-1.5 border-y border-[color:var(--hair)] py-2.5 text-xs font-medium sm:flex-row sm:items-center sm:justify-between print:flex-row print:items-center print:justify-between">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt
                  aria-hidden="true"
                  className="shrink-0 text-[color:var(--amber-deep)]"
                />
                কুসুমবাগ(আয়েশা মসজিদ সংলগ্ন), খুলশী, চট্টগ্রাম
              </span>
              <span className="flex items-center gap-2 tabular-nums">
                <FaPhoneAlt
                  aria-hidden="true"
                  className="shrink-0 text-[color:var(--amber-deep)]"
                />
                01912-718343, 01328-211952
              </span>
            </div>

            <div className="flex items-end justify-between gap-6 pt-4 text-[13px] font-semibold">
              <div className="flex items-end gap-2">
                <span>Date :</span>
                <span suppressHydrationWarning className="tabular-nums">
                  {dd} / {mm} / {yyyy}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 pb-1 pt-6">
              <span className="h-px flex-1 bg-[color:var(--hair)]" />
              <h2 className="pl-[0.28em] text-center text-[13px] font-bold uppercase tracking-[0.28em] sm:text-sm">
                Academic Transcript
              </h2>
              <span className="h-px flex-1 bg-[color:var(--hair)]" />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="relative z-10 flex flex-1 flex-col px-6 pb-2 pt-6 sm:px-10">
          {/* Identity (light, left) + grading scale (dense, right) */}
          <section className="mb-7 flex flex-col items-start justify-between gap-6 lg:flex-row print:flex-row">
            <dl className="w-full lg:max-w-[48%] print:max-w-[48%]">
              <div>
                <dt className={LABEL}>Student Name</dt>
                <dd className="mt-0.5 text-xl font-extrabold uppercase leading-tight tracking-tight sm:text-2xl">
                  {studentName}
                </dd>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 print:grid-cols-3">
                <Fact label="Class">
                  {className}
                  {sectionName ? ` (${sectionName})` : ""}
                </Fact>
                <Fact label="Student Roll">{rollNo}</Fact>
                <Fact label="Year session">{yearSession}</Fact>
              </div>
            </dl>

            <div className="w-full lg:w-auto lg:min-w-[330px] print:w-auto print:min-w-[330px]">
              <table className="w-full border-collapse text-center text-[11px] tabular-nums">
                <caption className="sr-only">Grading scale</caption>
                <thead>
                  <tr className="border-y-[1.5px] border-[color:var(--ink)] bg-[color:var(--wash)]">
                    {[
                      "Letter Grade",
                      "Class Interval",
                      "Grade point",
                      "Remarks (School)",
                    ].map((h) => (
                      <th key={h} scope="col" className="px-2 py-1.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="border-b-[1.5px] border-[color:var(--ink)]">
                  {GRADE_SCALE.map(([g, range, point, remark]) => (
                    <tr
                      key={g}
                      className="border-b border-[color:var(--hair)] last:border-b-0"
                    >
                      <th scope="row" className="px-2 py-1 font-bold">
                        {g}
                      </th>
                      <td className="px-2 py-1">{range}</td>
                      <td className="px-2 py-1">{point}</td>
                      <td className="px-2 py-1">{remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Marks */}
          <section>
            <div className="mb-3 border-l-[3px] border-[color:var(--amber)] pl-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--amber-deep)]">
                {t("Examination", "পরীক্ষা")}
              </p>
              <h3 className="text-base font-bold leading-tight sm:text-lg">
                {examName}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-center text-[11px] tabular-nums sm:text-xs">
                <caption className="sr-only">{examName}</caption>
                <thead>
                  <tr>
                    <th
                      rowSpan={2}
                      scope="col"
                      className={`${TH_BASE} ${TH_TOP} w-[30%] border-b border-b-[color:var(--ink)] text-left`}
                    >
                      Name of Subjects
                    </th>
                    <th
                      rowSpan={2}
                      scope="col"
                      className={`${TH_BASE} ${TH_TOP} w-20 border-b border-b-[color:var(--ink)]`}
                    >
                      Full Marks
                    </th>
                    <th
                      colSpan={4}
                      scope="colgroup"
                      className={`${TH_BASE} ${TH_TOP} border-b border-b-[color:var(--hair)]`}
                    >
                      Obtained Details
                    </th>
                    <th
                      rowSpan={2}
                      scope="col"
                      className={`${TH_BASE} ${TH_TOP} w-24 border-b border-b-[color:var(--ink)]`}
                    >
                      Letter Grade
                    </th>
                    <th
                      rowSpan={2}
                      scope="col"
                      className={`${TH_BASE} ${TH_TOP} w-20 border-b border-b-[color:var(--ink)]`}
                    >
                      Grade Point
                    </th>
                    <th
                      rowSpan={2}
                      scope="col"
                      className={`${TH_BASE} ${TH_TOP} w-24 border-b border-b-[color:var(--ink)]`}
                    >
                      Grade point Average (GPA)
                    </th>
                  </tr>
                  <tr>
                    {[
                      ["MT", "w-14"],
                      ["Terminal", "w-20"],
                      ["Total", "w-16"],
                      ["Highest", "w-16"],
                    ].map(([h, w]) => (
                      <th
                        key={h}
                        scope="col"
                        className={`${TH_BASE} ${w} border-b border-b-[color:var(--ink)] py-1.5`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {marks.map((mark, idx) => {
                    const failed = mark.grade === "F";
                    return (
                      <tr
                        key={`${mark.subjectId}-${idx}`}
                        className="border-b border-[color:var(--hair)] transition-colors duration-200 hover:bg-[color:var(--wash)]"
                      >
                        <th scope="row" className={`${TD} text-left font-medium`}>
                          {mark.subjectName}
                        </th>
                        <td className={TD}>{mark.fullMarks}</td>
                        <td className={TD}>{mark.mtMarks}</td>
                        <td className={TD}>{mark.terminal}</td>
                        <td className={`${TD} font-semibold`}>{mark.totalMarks}</td>
                        <td className={`${TD} text-[color:var(--muted)]`}>-</td>
                        <td
                          className={`${TD} font-bold ${
                            failed ? "text-[color:var(--fail)]" : ""
                          }`}
                        >
                          {mark.grade}
                        </td>
                        <td className={TD}>{mark.gradePoint}</td>
                        {idx === 0 && (
                          <td
                            rowSpan={marks.length}
                            className="border-l border-[color:var(--hair)] bg-[color:var(--wash)] px-3 align-middle text-4xl font-extrabold tracking-tight"
                          >
                            {gpa}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {marks.length === 0 && (
                    <tr className="border-b border-[color:var(--hair)]">
                      <td colSpan={9} className="py-6 text-center text-[color:var(--muted)]">
                        No marks found for this exam.
                      </td>
                    </tr>
                  )}
                </tbody>

                <tfoot>
                  <tr className="border-y-[1.5px] border-[color:var(--ink)] bg-[color:var(--wash)] font-bold">
                    <th scope="row" className={`${TD} text-left`}>
                      Total Marks
                    </th>
                    <td className={TD}>{totalFullMarks}</td>
                    <td
                      colSpan={2}
                      className={`${TD} text-right font-semibold text-[color:var(--muted)]`}
                    >
                      Obtained marks &amp; GPA
                    </td>
                    <td className={TD}>{totalObtained}</td>
                    <td colSpan={4} className={TD} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Result summary (dense, left) + conduct and remarks (light, right) */}
          <section className="mt-7 grid items-start gap-7 text-[11px] sm:text-xs md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] print:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Result summary</caption>
              <tbody className="border-y-[1.5px] border-[color:var(--ink)]">
                {summaryRows.map(([label, value], i) => (
                  <tr
                    key={label}
                    className={`border-b border-[color:var(--hair)] last:border-b-0 ${
                      i === 0 ? "bg-[color:var(--wash)]" : ""
                    }`}
                  >
                    <th
                      scope="row"
                      className="w-1/2 px-2.5 py-1.5 font-medium text-[color:var(--muted)]"
                    >
                      {label}
                    </th>
                    <td className="px-2.5 py-1.5 font-semibold tabular-nums">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-4 md:pl-4 print:pl-4">
              <TickGroup label="School behavior" options={RATINGS} />
              <TickGroup label="Personal & Social" options={RATINGS} />
              <div className="min-h-[4.75rem] border border-[color:var(--hair)] bg-white/60 p-2.5">
                <span className={LABEL}>Remarks</span>
              </div>
            </div>
          </section>

          {/* Signatures */}
          <div className="mt-12 flex flex-col items-center justify-between gap-10 text-[11px] sm:flex-row sm:items-end sm:text-xs print:flex-row print:items-end">
            <SignLine label="Class Teacher's Signature" />
            <SignLine label="Principal" />
          </div>

          {/* Publication & guardian */}
          <div className="mb-5 mt-9 flex flex-col gap-5 text-[11px] sm:flex-row sm:items-end sm:justify-between sm:text-xs print:flex-row print:items-end print:justify-between">
            <FieldLine label="Date of publication" className="sm:w-64 print:w-64" />
            <FieldLine label="Guardian's Signature" className="sm:w-72 print:w-72" />
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-auto">
          <BrandStrip side="right" />
          <p className="bg-[color:var(--amber)] py-2 text-center text-[11px] font-semibold text-[color:var(--ink)]">
            www.facebook.com/Al-Iman School &amp; College
          </p>
        </footer>
      </article>
    </div>
  );
}