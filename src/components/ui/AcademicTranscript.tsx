"use client";

import React, { useMemo } from "react";
import { FaPrint } from "react-icons/fa";
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
  fatherName?: string;
  motherName?: string;
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

export default function AcademicTranscript({
  studentName,
  fatherName = "N/A",
  motherName = "N/A",
  className = "N/A",
  sectionName,
  rollNo = "N/A",
  studentCode = "N/A",
  yearSession = new Date().getFullYear().toString(),
  examName,
  marks,
  onPrint,
  hideHeader = false,
}: ITranscriptProps) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const t = (en: string, bn: string) => (isBn ? bn : en);

  // Calculations
  const totalFullMarks = marks.reduce((acc, curr) => acc + curr.fullMarks, 0);
  const totalObtained = marks.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const totalGradePoints = marks.reduce((acc, curr) => acc + curr.gradePoint, 0);
  
  // GPA Calculation (Average of grade points)
  const gpa = marks.length > 0 ? (totalGradePoints / marks.length).toFixed(2) : "0.00";
  const failedCount = marks.filter((m) => m.grade === "F").length;
  const isPassed = marks.length > 0 && failedCount === 0;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-black p-8 print:p-0 print:m-0 font-sans border border-gray-300 print:border-none shadow-xl print:shadow-none">
      
      {/* Top Controls */}
      {!hideHeader && onPrint && (
        <div className="flex justify-end mb-4 print:hidden">
          <button
            onClick={onPrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-sm font-semibold"
          >
            <FaPrint /> {t("Print", "প্রিন্ট করুন")}
          </button>
        </div>
      )}

      {/* --- OFFICIAL TRANSCRIPT START --- */}
      <div className="border-2 border-black p-6 sm:p-8">
        
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-extrabold uppercase tracking-wide">
            Al-Iman School and College
          </h1>
          <h2 className="text-xl font-bold mt-1 tracking-wider underline underline-offset-4">
            ACADEMIC TRANSCRIPT
          </h2>
        </div>

        {/* Student Details & Grading Legend */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-6">
          {/* Left: Student Info */}
          <div className="space-y-1.5 text-sm w-full sm:w-1/2">
            <div className="flex">
              <span className="w-28 font-semibold italic">Student Name</span>
              <span className="w-4 font-bold">:</span>
              <span className="font-bold flex-1">{studentName}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold italic">Father Name</span>
              <span className="w-4 font-bold">:</span>
              <span className="flex-1">{fatherName}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold italic">Mother Name</span>
              <span className="w-4 font-bold">:</span>
              <span className="flex-1">{motherName}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold italic">Class</span>
              <span className="w-4 font-bold">:</span>
              <span className="font-semibold flex-1">
                {className} {sectionName ? `(${sectionName})` : ""}
              </span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold italic">Student Roll</span>
              <span className="w-4 font-bold">:</span>
              <span className="flex-1">{rollNo}</span>
            </div>
            <div className="flex">
              <span className="w-28 font-semibold italic">Year session</span>
              <span className="w-4 font-bold">:</span>
              <span className="flex-1">{yearSession}</span>
            </div>
          </div>

          {/* Right: Grading Legend */}
          <div className="w-full sm:w-auto">
            <table className="border-collapse border border-black text-xs text-center w-full sm:w-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black px-3 py-1 font-bold">
                    Letter Grade
                  </th>
                  <th className="border border-black px-3 py-1 font-bold">
                    Class Interval
                  </th>
                  <th className="border border-black px-3 py-1 font-bold">
                    Grade point
                  </th>
                  <th className="border border-black px-3 py-1 font-bold">
                    Remarks (School)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-black py-0.5">A+</td><td className="border border-black py-0.5">80-100</td><td className="border border-black py-0.5">5</td><td className="border border-black py-0.5">Excellent</td></tr>
                <tr><td className="border border-black py-0.5">A</td><td className="border border-black py-0.5">70-79</td><td className="border border-black py-0.5">4</td><td className="border border-black py-0.5">Very Good</td></tr>
                <tr><td className="border border-black py-0.5">A-</td><td className="border border-black py-0.5">60-69</td><td className="border border-black py-0.5">3.5</td><td className="border border-black py-0.5">Good</td></tr>
                <tr><td className="border border-black py-0.5">B</td><td className="border border-black py-0.5">50-59</td><td className="border border-black py-0.5">3</td><td className="border border-black py-0.5">Satisfactory</td></tr>
                <tr><td className="border border-black py-0.5">C</td><td className="border border-black py-0.5">40-49</td><td className="border border-black py-0.5">2</td><td className="border border-black py-0.5">Pass</td></tr>
                <tr><td className="border border-black py-0.5">F</td><td className="border border-black py-0.5">0-39</td><td className="border border-black py-0.5">0</td><td className="border border-black py-0.5">Fail</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Exam Title */}
        <div className="text-center font-bold text-sm mb-2">
          {examName}
        </div>

        {/* Main Marks Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-xs text-center">
            <thead>
              <tr className="bg-gray-300">
                <th rowSpan={2} className="border border-black px-2 py-1 font-bold text-left w-1/3">
                  Name of Subjects
                </th>
                <th rowSpan={2} className="border border-black px-2 py-1 font-bold">
                  Full Marks
                </th>
                <th colSpan={4} className="border border-black px-2 py-1 font-bold">
                  Obtained Details
                </th>
                <th rowSpan={2} className="border border-black px-2 py-1 font-bold">
                  Letter Grade
                </th>
                <th rowSpan={2} className="border border-black px-2 py-1 font-bold">
                  Grad point
                </th>
                <th rowSpan={2} className="border border-black px-2 py-1 font-bold w-24">
                  Grade point Average (GPA)
                </th>
              </tr>
              <tr className="bg-gray-200">
                <th className="border border-black px-2 py-1 font-bold">MT</th>
                <th className="border border-black px-2 py-1 font-bold">Terminal</th>
                <th className="border border-black px-2 py-1 font-bold">Total</th>
                <th className="border border-black px-2 py-1 font-bold">Highest</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark, idx) => (
                <tr key={idx}>
                  <td className="border border-black px-2 py-1 text-left font-medium">
                    {mark.subjectName}
                  </td>
                  <td className="border border-black px-2 py-1">{mark.fullMarks}</td>
                  <td className="border border-black px-2 py-1">{mark.mtMarks}</td>
                  <td className="border border-black px-2 py-1">{mark.terminal}</td>
                  <td className="border border-black px-2 py-1">{mark.totalMarks}</td>
                  <td className="border border-black px-2 py-1 text-gray-500">
                    {/* Highest is not in DB, showing placeholder or N/A */}
                    -
                  </td>
                  <td className="border border-black px-2 py-1 font-bold">{mark.grade}</td>
                  <td className="border border-black px-2 py-1">{mark.gradePoint}</td>
                  {idx === 0 && (
                    <td rowSpan={marks.length} className="border border-black px-2 py-1 text-2xl font-bold">
                      {gpa}
                    </td>
                  )}
                </tr>
              ))}
              {/* Fallback if no marks */}
              {marks.length === 0 && (
                <tr>
                  <td colSpan={9} className="border border-black py-4 text-center text-gray-500">
                    No marks found for this exam.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td className="border border-black px-2 py-1 text-center">Total Marks</td>
                <td className="border border-black px-2 py-1">{totalFullMarks}</td>
                <td colSpan={2} className="border border-black px-2 py-1 text-right">Obtained marks & GPA</td>
                <td className="border border-black px-2 py-1">{totalObtained}</td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
                <td className="border border-black px-2 py-1"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Lower Section: Summary & Remarks */}
        <div className="mt-4 flex flex-col md:flex-row gap-4 justify-between items-start text-xs">
          
          {/* Result Summary Table */}
          <table className="border-collapse border border-black text-left w-full md:w-1/2">
            <tbody>
              <tr>
                <th className="border border-black px-2 py-1 bg-gray-200 w-1/2">Result Status</th>
                <td className="border border-black px-2 py-1 font-bold">{isPassed ? "Passed" : "Failed"}</td>
              </tr>
              <tr>
                <th className="border border-black px-2 py-1 bg-gray-200">Section Position</th>
                <td className="border border-black px-2 py-1">-</td>
              </tr>
              <tr>
                <th className="border border-black px-2 py-1 bg-gray-200">GPA (without 5th)</th>
                <td className="border border-black px-2 py-1">{gpa}</td>
              </tr>
              <tr>
                <th className="border border-black px-2 py-1 bg-gray-200">Failed Subject</th>
                <td className="border border-black px-2 py-1">{failedCount}</td>
              </tr>
              <tr>
                <th className="border border-black px-2 py-1 bg-gray-200">Working Days</th>
                <td className="border border-black px-2 py-1">-</td>
              </tr>
              <tr>
                <th className="border border-black px-2 py-1 bg-gray-200">Total Presence</th>
                <td className="border border-black px-2 py-1">-</td>
              </tr>
              <tr>
                <th className="border border-black px-2 py-1 bg-gray-200">Total Absent</th>
                <td className="border border-black px-2 py-1">-</td>
              </tr>
            </tbody>
          </table>

          {/* Behavior / Remarks Checkbox Area */}
          <div className="w-full md:w-1/2 space-y-3 pl-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold w-32">School behavior</span>
              <span>:</span>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Excellent</label>
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Very Good</label>
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Good</label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold w-32">Personal & Social</span>
              <span>:</span>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Excellent</label>
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Very Good</label>
                <label className="flex items-center gap-1"><input type="checkbox" className="w-3 h-3" /> Good</label>
              </div>
            </div>

            <div className="mt-8">
              <div className="border border-black p-2 h-16 w-full flex items-end justify-center pb-2">
                Remarks
              </div>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-8 flex justify-between items-end text-xs">
          <div className="text-center">
            <div className="w-32 border-b border-black mb-1"></div>
            <p className="font-semibold">Class Teacher's Signature</p>
          </div>
          <div className="text-center">
            <div className="w-32 border-b border-black mb-1"></div>
            <p className="font-semibold">Principal</p>
          </div>
        </div>

        {/* Footer Dates */}
        <div className="mt-8 flex justify-between items-end text-xs">
          <div className="flex items-center gap-2">
            <span>Date of publication</span>
            <div className="border border-black w-24 h-6"></div>
          </div>
          <div className="flex items-center gap-2">
            <span>Guardian's Signature</span>
            <div className="border border-black w-32 h-6"></div>
          </div>
        </div>

      </div>
    </div>
  );
}