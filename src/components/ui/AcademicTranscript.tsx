"use client";

import React from "react";
import { FaPrint, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
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

// Custom SVG Logo matching the image
const SchoolLogo = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#0B4F8A" />
    <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" strokeWidth="1" />
    <circle cx="50" cy="50" r="38" fill="#fff" />
    <path id="curve" d="M 20 50 A 30 30 0 0 1 80 50" fill="transparent" />
    <text fontSize="8" fill="#0B4F8A" fontWeight="bold">
      <textPath href="#curve" startOffset="50%" textAnchor="middle">
        AL-IMAN SCHOOL & COLLEGE
      </textPath>
    </text>
    <rect x="35" y="45" width="30" height="20" fill="#0B4F8A" rx="2" />
    <text x="50" y="58" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="bold">AL-IMAN</text>
    <text x="50" y="85" fill="#0B4F8A" fontSize="7" textAnchor="middle" fontWeight="bold">ESTD - 2009</text>
  </svg>
);

export default function AcademicTranscript({
  studentName,
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

  // Current Date for the top right header
  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, " | ");

  return (
    <div className="w-full max-w-5xl mx-auto bg-white text-black p-2 sm:p-6 print:p-0 print:m-0 font-sans">
      
      {/* Print Button */}
      {!hideHeader && onPrint && (
        <div className="flex justify-end mb-4 print:hidden">
          <button
            onClick={onPrint}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 text-sm font-semibold transition-all"
          >
            <FaPrint /> {t("Print Transcript", "প্রিন্ট করুন")}
          </button>
        </div>
      )}

      {/* --- OFFICIAL TRANSCRIPT START --- */}
      <div className="relative bg-[#FCFDF9] border-[1.5px] border-black overflow-hidden flex flex-col min-h-[1000px] print:min-h-[1050px] print:border-none">
        
        {/* WATERMARK (Background) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 mt-32 opacity-[0.05]">
          <div className="relative flex items-center justify-center w-[600px] h-[600px]">
            {/* Circular Text Watermark */}
            <svg viewBox="0 0 200 200" className="w-full h-full text-black">
              <path id="circlePath" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" fill="transparent" />
              <text className="font-bold text-[14px] tracking-[0.2em] uppercase" fill="currentColor">
                <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                  AL-IMAN SCHOOL & COLLEGE • ESTD - 2009 •
                </textPath>
              </text>
            </svg>
            {/* Central Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <SchoolLogo className="w-48 h-48 text-black" />
            </div>
          </div>
        </div>

        {/* HEADER SECTION */}
        <div className="relative z-10">
          {/* Top Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 pt-6 pb-2">
            <div className="flex items-center gap-4">
              <SchoolLogo className="w-20 h-20 shrink-0" />
              <div className="text-center sm:text-left">
                <h1 className="text-[#F3A900] text-2xl md:text-3xl font-black tracking-tight uppercase">
                  AL-IMAN SCHOOL & COLLEGE
                </h1>
                <h2 className="text-black text-xl md:text-2xl font-extrabold mt-1">
                  আল-ঈমান স্কুল এন্ড কলেজ
                </h2>
              </div>
            </div>
            {/* Right Side Stripes */}
            <div className="hidden sm:flex flex-col gap-1 mt-4 sm:mt-0">
              <div className="w-24 h-2 bg-[#F3A900]"></div>
              <div className="w-32 h-2 bg-[#222222]"></div>
              <div className="w-20 h-2 bg-[#F3A900]"></div>
            </div>
          </div>

          {/* Yellow Address Bar */}
          <div className="bg-[#F3A900] flex flex-col sm:flex-row justify-between items-center px-4 py-2 text-white text-xs sm:text-sm font-semibold">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-black" />
              <span className="text-black">কুমুমবাগ (আয়েশা মসজিদ সংলগ্ন), খুলনা, চট্টগ্রাম</span>
            </div>
            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <FaPhoneAlt className="text-black" />
              <span className="text-black">01912-718343, 01328-211952</span>
            </div>
            <div className="mt-1 sm:mt-0 bg-[#222222] text-white px-3 py-0.5 rounded-sm">
              স্থাপিত : ২০০৯ইং.
            </div>
          </div>

          {/* Black and Yellow Decorative Strip */}
          <div className="flex h-3">
            <div className="w-1/3 bg-[#222222]"></div>
            <div className="w-1/4 bg-[#222222]" style={{ clipPath: "polygon(20% 0, 100% 0, 80% 100%, 0% 100%)" }}></div>
            <div className="flex-1 bg-[#F3A900]"></div>
          </div>

          {/* Source & Date Row */}
          <div className="flex justify-between items-center px-6 py-3 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <span>সূত্র:</span>
              <div className="border border-black w-40 h-6"></div>
            </div>
            <div className="flex items-center gap-2">
              <span>তারিখ :</span>
              <div className="flex gap-1">
                <div className="border border-black w-8 h-6 flex items-center justify-center font-mono">{today.split(" | ")[0]}</div>
                <div className="border border-black w-8 h-6 flex items-center justify-center font-mono">{today.split(" | ")[1]}</div>
                <div className="border border-black w-16 h-6 flex items-center justify-center font-mono">{today.split(" | ")[2]}</div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4">
            <h3 className="inline-block text-lg sm:text-xl font-bold uppercase tracking-widest border-b-2 border-black pb-1">
              ACADEMIC TRANSCRIPT
            </h3>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="relative z-10 px-6 flex-1 flex flex-col">
          
          {/* Student Info & Grading Legend */}
          <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-6">
            
            {/* Left: Student Info */}
            <div className="space-y-1.5 text-sm w-full lg:w-1/2">
              <div className="flex">
                <span className="w-32 font-semibold italic">Student Name</span>
                <span className="w-4 font-bold">:</span>
                <span className="font-bold flex-1 uppercase">{studentName}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold italic">Class</span>
                <span className="w-4 font-bold">:</span>
                <span className="font-semibold flex-1">
                  {className} {sectionName ? `(${sectionName})` : ""}
                </span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold italic">Student Roll</span>
                <span className="w-4 font-bold">:</span>
                <span className="flex-1">{rollNo}</span>
              </div>
              <div className="flex">
                <span className="w-32 font-semibold italic">Year session</span>
                <span className="w-4 font-bold">:</span>
                <span className="flex-1">{yearSession}</span>
              </div>
            </div>

            {/* Right: Grading Legend */}
            <div className="w-full lg:w-auto">
              <table className="border-collapse border border-black text-xs text-center w-full min-w-[300px]">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-black px-3 py-1 font-bold">Letter Grade</th>
                    <th className="border border-black px-3 py-1 font-bold">Class Interval</th>
                    <th className="border border-black px-3 py-1 font-bold">Grade point</th>
                    <th className="border border-black px-3 py-1 font-bold">Remarks (School)</th>
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
          <div className="text-center font-bold text-sm mb-2">{examName}</div>

          {/* Main Marks Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-black text-[11px] sm:text-xs text-center">
              <thead>
                <tr className="bg-gray-300">
                  <th rowSpan={2} className="border border-black px-2 py-1 font-bold text-left w-[30%]">
                    Name of Subjects
                  </th>
                  <th rowSpan={2} className="border border-black px-2 py-1 font-bold w-20">
                    Full Marks
                  </th>
                  <th colSpan={4} className="border border-black px-2 py-1 font-bold">
                    Obtained Details
                  </th>
                  <th rowSpan={2} className="border border-black px-2 py-1 font-bold w-24">
                    Letter Grade
                  </th>
                  <th rowSpan={2} className="border border-black px-2 py-1 font-bold w-20">
                    Grade Point
                  </th>
                  <th rowSpan={2} className="border border-black px-2 py-1 font-bold w-24">
                    Grade point Average (GPA)
                  </th>
                </tr>
                <tr className="bg-gray-200">
                  <th className="border border-black px-2 py-1 font-bold w-14">MT</th>
                  <th className="border border-black px-2 py-1 font-bold w-20">Terminal</th>
                  <th className="border border-black px-2 py-1 font-bold w-16">Total</th>
                  <th className="border border-black px-2 py-1 font-bold w-16">Highest</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((mark, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border border-black px-2 py-1 text-left font-medium">
                      {mark.subjectName}
                    </td>
                    <td className="border border-black px-2 py-1">{mark.fullMarks}</td>
                    <td className="border border-black px-2 py-1">{mark.mtMarks}</td>
                    <td className="border border-black px-2 py-1">{mark.terminal}</td>
                    <td className="border border-black px-2 py-1">{mark.totalMarks}</td>
                    <td className="border border-black px-2 py-1 text-gray-500">-</td>
                    <td className="border border-black px-2 py-1 font-bold">{mark.grade}</td>
                    <td className="border border-black px-2 py-1">{mark.gradePoint}</td>
                    {idx === 0 && (
                      <td rowSpan={marks.length} className="border border-black px-2 py-1 text-3xl font-bold">
                        {gpa}
                      </td>
                    )}
                  </tr>
                ))}
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
          <div className="mt-4 flex flex-col md:flex-row gap-4 justify-between items-start text-[11px] sm:text-xs">
            {/* Result Summary Table */}
            <table className="border-collapse border border-black text-left w-full md:w-[45%]">
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
            <div className="w-full md:w-[50%] space-y-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold w-32 shrink-0">School behavior</span>
                <span className="hidden sm:inline">:</span>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="w-3 h-3 accent-black" /> Excellent</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="w-3 h-3 accent-black" /> Very Good</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="w-3 h-3 accent-black" /> Good</label>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold w-32 shrink-0">Personal & Social</span>
                <span className="hidden sm:inline">:</span>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="w-3 h-3 accent-black" /> Excellent</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="w-3 h-3 accent-black" /> Very Good</label>
                  <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="w-3 h-3 accent-black" /> Good</label>
                </div>
              </div>

              <div className="mt-6 sm:mt-8">
                <div className="border border-black p-2 h-16 w-full flex items-end justify-center pb-2 font-semibold text-gray-500">
                  Remarks
                </div>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-12 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-8 text-[11px] sm:text-xs">
            <div className="text-center">
              <div className="w-40 border-b border-black mb-1"></div>
              <p className="font-semibold">Class Teacher's Signature</p>
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-black mb-1"></div>
              <p className="font-semibold">Principal</p>
            </div>
          </div>

          {/* Footer Dates */}
          <div className="mt-8 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-[11px] sm:text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="shrink-0">Date of publication</span>
              <div className="border border-black w-full sm:w-32 h-6"></div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="shrink-0">Guardian's Signature</span>
              <div className="border border-black w-full sm:w-40 h-6"></div>
            </div>
          </div>

        </div>

        {/* BOTTOM BLACK/YELLOW FOOTER */}
        <div className="relative z-10 mt-auto">
          <div className="flex h-4">
            <div className="w-1/4 bg-[#222222]"></div>
            <div className="w-[15%] bg-[#222222]" style={{ clipPath: "polygon(0 0, 100% 0, 80% 100%, 20% 100%)" }}></div>
            <div className="flex-1 bg-[#F3A900]"></div>
          </div>
          <div className="bg-[#F3A900] text-black font-semibold text-xs text-center py-1.5">
            www.facebook.com/Al-Iman School & College
          </div>
        </div>
        
      </div>
    </div>
  );
}