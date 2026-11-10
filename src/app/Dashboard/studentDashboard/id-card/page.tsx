"use client";

import React, { useEffect, useState } from "react";
import {
  FaIdCard,
  FaSpinner,
  FaPrint,
} from "react-icons/fa";
import { Card } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";

export default function StudentIdCardPage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const isBn = language === "bn";

  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      setLoading(true);
      try {
        const studentId = user?.studentId || user?.id;
        if (!studentId) return;

        const res = await axiosInstance.get(`/students/${studentId}`);
        const profile = res.data?.data || res.data;
        setStudent(profile);
      } catch (err) {
        console.error("Failed to load student ID card data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header (Hidden on Print) */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "ডিজিটাল আইডি কার্ড" : "Digital ID Card"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaIdCard className="text-primary text-lg" />
            <span>{isBn ? "স্টুডেন্ট আইডি কার্ড" : "Student Identity Card"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "তোমার অফিসিয়াল ডিজিটাল স্টুডেন্ট আইডি কার্ড দেখো ও পিন্ট করো।"
              : "View and print your official digital student identification card."}
          </p>
        </div>

        {student && (
          <button
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-2 shrink-0 print:hidden"
          >
            <FaPrint />
            <span>{isBn ? "আইডি কার্ড প্রিন্ট করুন" : "Print ID Card"}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-primary text-lg" />
          <span>{isBn ? "আইডি কার্ড লোড হচ্ছে..." : "Loading ID Card..."}</span>
        </div>
      ) : !student ? (
        <Card className="p-8 text-center text-xs text-muted-foreground rounded-2xl border border-border">
          {isBn ? "প্রোফাইল তথ্য পাওয়া যায়নি।" : "Student profile not found."}
        </Card>
      ) : (
        /* ID Card Display Container - Front & Back Side by Side */
        <div className="flex flex-col lg:flex-row justify-center items-center gap-8 py-6 print:flex-row print:gap-4 print:py-0">
          
          {/* ================= FRONT SIDE ================= */}
          <div className="w-[340px] h-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden relative print:shadow-none print:border print:border-gray-300 flex flex-col">
            
            {/* Top Wave Section */}
            <div className="relative w-full h-[160px] bg-[#3f9b53] shrink-0">
              {/* School Name / Logo Area */}
              <div className="absolute top-4 left-5 text-white z-10">
                <h2 className="text-lg font-extrabold uppercase tracking-wide leading-tight">
                  Al-Iman School
                </h2>
                <p className="text-[9px] opacity-90 tracking-widest font-medium">AND COLLEGE</p>
              </div>

              {/* SVG Waves */}
              <svg className="absolute bottom-0 w-full h-[80px]" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,50 Q25,100 50,50 T100,50 L100,100 L0,100 Z" fill="#7dc576" opacity="0.6" />
                <path d="M0,70 Q25,20 50,70 T100,70 L100,100 L0,100 Z" fill="#fff" />
              </svg>
            </div>

            {/* Circular Profile Photo */}
            <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-20">
              <div className="w-[120px] h-[120px] rounded-full border-4 border-white bg-gray-200 shadow-lg overflow-hidden flex items-center justify-center">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-extrabold text-[#3f9b53]">
                    {student.firstName?.charAt(0) || "S"}
                  </span>
                )}
              </div>
            </div>

            {/* Student Info Section */}
            <div className="flex-1 pt-[70px] px-6 flex flex-col text-center">
              <h3 className="text-[22px] font-extrabold text-gray-900 tracking-wide uppercase leading-tight">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-gray-500 font-medium text-sm mt-1">
                Student ID: <span className="font-bold text-gray-800">{student.studentCode || student.studentIdNo}</span>
              </p>

              {/* Details Grid */}
              <div className="mt-6 text-left space-y-2.5 text-[12px]">
                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 font-semibold uppercase">Class</span>
                  <span className="font-bold text-gray-900">{student.class?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 font-semibold uppercase">Section</span>
                  <span className="font-bold text-gray-900">{student.section?.name || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 font-semibold uppercase">Roll</span>
                  <span className="font-bold text-gray-900">{student.rollNo || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 font-semibold uppercase">Parents Name</span>
                  <span className="font-bold text-gray-900 truncate max-w-[150px]">{student.fatherName || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                  <span className="text-gray-500 font-semibold uppercase">Contact</span>
                  <span className="font-bold text-gray-900 font-mono">{student.phone || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Bottom Wave Section */}
            <div className="relative w-full h-[90px] shrink-0 mt-auto">
              <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,100 L0,40 Q25,-10 50,40 T100,40 L100,100 Z" fill="#7dc576" opacity="0.8" />
                <path d="M0,100 L0,60 Q25,110 50,60 T100,60 L100,100 Z" fill="#3f9b53" />
              </svg>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div className="w-[340px] h-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden relative print:shadow-none print:border print:border-gray-300 flex flex-col">
            
            {/* Top Wave Section */}
            <div className="relative w-full h-[140px] bg-[#3f9b53] shrink-0">
              <div className="absolute top-4 left-5 text-white z-10">
                <h2 className="text-lg font-extrabold uppercase tracking-wide leading-tight">
                  Al-Iman School
                </h2>
                <p className="text-[9px] opacity-90 tracking-widest font-medium">AND COLLEGE</p>
              </div>
              <svg className="absolute bottom-0 w-full h-[60px]" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,50 Q25,100 50,50 T100,50 L100,100 L0,100 Z" fill="#7dc576" opacity="0.6" />
                <path d="M0,70 Q25,20 50,70 T100,70 L100,100 L0,100 Z" fill="#fff" />
              </svg>
            </div>

            {/* Terms & Conditions Content */}
            <div className="flex-1 px-6 pt-6 flex flex-col">
              <h4 className="text-[14px] font-extrabold text-[#3f9b53] uppercase tracking-wide mb-4">
                Terms & Conditions :
              </h4>
              
              <ul className="space-y-3 text-[11px] text-gray-600">
                <li className="flex gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3f9b53] shrink-0 mt-0.5" />
                  <span>This card is the property of Al-Iman School and College and must be returned upon request.</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3f9b53] shrink-0 mt-0.5" />
                  <span>If found, please return to the school office immediately.</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3f9b53] shrink-0 mt-0.5" />
                  <span>The card is non-transferable and must be carried within the campus at all times.</span>
                </li>
                <li className="flex gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#3f9b53] shrink-0 mt-0.5" />
                  <span>Any misuse or tampering will result in disciplinary action.</span>
                </li>
              </ul>

              {/* Dates & Info */}
              <div className="mt-6 space-y-2 text-[12px] font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-24">Join Date</span>
                  <span>: {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-GB') : "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24">Session</span>
                  <span>: {student.class?.academicYear?.year || new Date().getFullYear()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24">Date of Birth</span>
                  <span>: {student.dob ? new Date(student.dob).toLocaleDateString('en-GB') : "N/A"}</span>
                </div>
              </div>

              {/* Signature */}
              <div className="mt-8 text-center">
                <div className="w-32 border-b border-gray-400 mx-auto mb-1"></div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Authorised Signature</p>
              </div>
            </div>

            {/* Bottom Wave Section */}
            <div className="relative w-full h-[90px] shrink-0 mt-auto">
              <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,100 L0,40 Q25,-10 50,40 T100,40 L100,100 Z" fill="#7dc576" opacity="0.8" />
                <path d="M0,100 L0,60 Q25,110 50,60 T100,60 L100,100 Z" fill="#3f9b53" />
              </svg>
              <div className="absolute bottom-2 w-full text-center z-10">
                <p className="text-[9px] text-white font-medium">
                  www.alimanschool.edu.bd
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}