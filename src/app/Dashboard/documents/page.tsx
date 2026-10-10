"use client";

import React, { useEffect, useState } from "react";
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
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
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

export default function StudentDocumentsPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  // Active Tab Toggle State ("id_card" | "testimonial")
  const [activeTab, setActiveTab] = useState<"id_card" | "testimonial">("id_card");

  const [classes, setClasses] = useState<IClass[]>([]);
  const [students, setStudents] = useState<IStudent[]>([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [idCardInfo, setIdCardInfo] = useState<IIdCardData | null>(null);
  const [testimonial, setTestimonial] = useState<ITestimonialData | null>(null);

  // Editable Parents Name State for Testimonial
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
        
        // Auto-fill parent inputs from fetched data
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

  return (
    <div className="space-y-6">
      {/* Top Header & Interactive Tab Toggle */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            {isBn ? "শিক্ষার্থী ডক্যুমেন্ট সেন্টার" : "Student Document Center"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "একই জায়গা থেকে ডিজিটাল আইডি কার্ড এবং প্রাতিষ্ঠানিক প্রশংসাপত্র তৈরি করুন।"
              : "Generate digital ID cards and official academic testimonials in one place."}
          </p>
        </div>

        {/* Right Toggle Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-2xl bg-muted/60 border border-border shadow-inner">
            <button
              onClick={() => {
                setActiveTab("id_card");
                setError(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "id_card"
                  ? "bg-card text-primary shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FaIdCard />
              <span>{isBn ? "আইডি কার্ড" : "ID Card"}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("testimonial");
                setError(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "testimonial"
                  ? "bg-card text-primary shadow-sm border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FaAward />
              <span>{isBn ? "প্রশংসাপত্র" : "Testimonial"}</span>
            </button>
          </div>

          {((activeTab === "id_card" && idCardInfo) ||
            (activeTab === "testimonial" && testimonial)) && (
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
            >
              <FaPrint />
              <span>{isBn ? "প্রিন্ট করুন" : "Print Document"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Selection Card (Hidden in Print) */}
      <Card className="print:hidden border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <form
            onSubmit={handleGenerateDocument}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {isBn ? "শ্রেণি (Class)" : "Filter Class"}
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">
                  {isBn ? "-- শ্রেণি সিলেক্ট করুন --" : "-- Select Class --"}
                </option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                {isBn ? "শিক্ষার্থী (Student)" : "Select Student"}
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">
                  {isBn
                    ? "-- শিক্ষার্থী সিলেক্ট করুন --"
                    : "-- Select Student --"}
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
              className="py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FaSearch />
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
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
          {error}
        </div>
      )}

      {/* VIEW 1: PROFESSIONAL ID CARD TAB CONTENT */}
      {activeTab === "id_card" && idCardInfo && (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6 print:py-0 print:gap-4">
          {/* ID Card Front */}
          <div className="w-[320px] h-[480px] bg-gradient-to-b from-card via-card to-muted/30 border border-border rounded-2xl shadow-2xl overflow-hidden relative flex flex-col justify-between print:border-black print:shadow-none">
            {/* Header / Brand */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-4 text-center space-y-1 relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:8px_8px]" />
              <div className="flex items-center justify-center gap-2 font-bold text-sm tracking-wide">
                <FaUniversity className="text-amber-400" />
                <span>Al-Iman Academy</span>
              </div>
              <p className="text-[9px] text-emerald-200 uppercase tracking-widest font-semibold">
                OFFICIAL STUDENT ID CARD
              </p>
            </div>

            {/* Profile Avatar & Name */}
            <div className="flex flex-col items-center mt-3">
              <div className="w-24 h-24 rounded-2xl border-4 border-amber-400/80 overflow-hidden bg-muted flex items-center justify-center shadow-lg relative">
                {idCardInfo.profileImage ? (
                  <img
                    src={idCardInfo.profileImage}
                    alt={idCardInfo.fullName || "Student"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-3xl text-muted-foreground/60" />
                )}
              </div>
              <h2 className="text-sm font-extrabold text-foreground mt-2 text-center px-3 truncate max-w-[280px]">
                {idCardInfo.fullName || "N/A"}
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px] mt-1 border border-emerald-500/20">
                ID: {idCardInfo.studentIdNo || "N/A"}
              </span>
            </div>

            {/* Details Section */}
            <div className="px-6 text-xs space-y-2 text-foreground/90">
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="font-semibold text-muted-foreground">Class:</span>
                <span className="font-bold text-foreground">
                  {idCardInfo.className || "N/A"}{" "}
                  {idCardInfo.sectionName ? `(${idCardInfo.sectionName})` : ""}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="font-semibold text-muted-foreground">Roll No:</span>
                <span className="font-bold text-foreground">
                  {idCardInfo.rollNo || "N/A"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-1.5">
                <span className="font-semibold text-muted-foreground">Guardian:</span>
                <span className="font-semibold text-foreground truncate max-w-[150px]">
                  {idCardInfo.guardianName || "N/A"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-emerald-950/5 dark:bg-emerald-950/30 px-4 py-2.5 text-center text-[10px] text-muted-foreground font-semibold border-t border-border/60">
              Academic Session 2026 • Valid ID
            </div>
          </div>

          {/* ID Card Back */}
          <div className="w-[320px] h-[480px] bg-gradient-to-b from-card via-card to-muted/30 border border-border rounded-2xl shadow-2xl overflow-hidden relative flex flex-col justify-between p-5 print:border-black print:shadow-none">
            <div className="text-center space-y-1 border-b border-border/60 pb-3">
              <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                Emergency & Verification
              </h3>
              <p className="text-[10px] text-muted-foreground">
                If found, please return to school administration.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center my-2 space-y-2">
              <div className="p-2 bg-white rounded-xl shadow-md border border-border/80">
                {idCardInfo.qrCode ? (
                  <img
                    src={idCardInfo.qrCode}
                    alt="Student Verification QR Code"
                    className="w-24 h-24 object-contain"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center text-[10px] text-muted-foreground">
                    QR Not Available
                  </div>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground font-semibold text-center">
                Scan QR code for official student authentication
              </p>
            </div>

            <div className="space-y-2 text-[11px] bg-muted/50 p-3 rounded-xl border border-border/60 shadow-inner">
              <div className="flex items-center gap-2 text-foreground">
                <FaPhone className="text-emerald-600 text-[10px] shrink-0" />
                <span className="truncate">
                  <strong>Emergency:</strong> {idCardInfo.guardianPhone || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <FaMapMarkerAlt className="text-emerald-600 text-[10px] shrink-0" />
                <span className="truncate">
                  <strong>Address:</strong> {idCardInfo.address || "N/A"}
                </span>
              </div>
            </div>

            <div className="pt-3 text-center border-t border-border/60">
              <div className="w-32 border-b border-foreground/40 mx-auto mb-1"></div>
              <p className="text-[10px] font-bold text-foreground">
                Authorized Signature
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PROFESSIONAL TESTIMONIAL TAB CONTENT */}
      {activeTab === "testimonial" && testimonial && (
        <div className="space-y-4">
          {/* Quick Parental Name Editing Box for Testimonial */}
          <Card className="print:hidden border-border/60 bg-muted/20">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                <FaEdit className="text-primary" />
                <span>
                  {isBn
                    ? "পিতা ও মাতার নাম যাচাই / সম্পাদন করুন:"
                    : "Verify / Modify Parents' Names for Testimonial:"}
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isBn ? "পিতার নাম (Father's Name)" : "Father's Name"}
                  </label>
                  <input
                    type="text"
                    value={fatherNameInput}
                    onChange={(e) => setFatherNameInput(e.target.value)}
                    placeholder="Enter father's name"
                    className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    {isBn ? "মাতার নাম (Mother's Name)" : "Mother's Name"}
                  </label>
                  <input
                    type="text"
                    value={motherNameInput}
                    onChange={(e) => setMotherNameInput(e.target.value)}
                    placeholder="Enter mother's name"
                    className="w-full px-3 py-1.5 rounded-lg bg-card border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Printable Testimonial View */}
          <Card className="border-[6px] border-double border-emerald-800/40 shadow-2xl rounded-3xl bg-card overflow-hidden p-8 sm:p-12 max-w-4xl mx-auto print:border-black print:shadow-none print:max-w-none print:m-0">
            <CardContent className="space-y-8 py-4">
              {/* Header */}
              <div className="text-center space-y-2 border-b-2 border-emerald-800/20 pb-6">
                <div className="flex items-center justify-center gap-2.5 text-emerald-900 dark:text-emerald-400 font-extrabold text-2xl sm:text-3xl">
                  <FaUniversity />
                  <span>Al-Iman Academy & High School</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium tracking-wide">
                  ESTD: 2015 • Government Recognized Educational Institution
                </p>
                <div className="pt-3">
                  <span className="px-8 py-2 rounded-full bg-emerald-900 text-white dark:bg-emerald-800 font-extrabold text-xs sm:text-sm tracking-widest uppercase shadow-sm">
                    ACADEMIC TESTIMONIAL CERTIFICATE
                  </span>
                </div>
              </div>

              {/* Certificate Body Content */}
              <div className="text-sm sm:text-base text-foreground/90 leading-relaxed space-y-6 font-serif px-4 sm:px-8">
                <p className="text-justify">
                  This is to certify that{" "}
                  <strong className="text-foreground text-base sm:text-lg border-b-2 border-foreground/40 px-2.5 font-bold">
                    {testimonial.studentName || "N/A"}
                  </strong>
                  , son/daughter of{" "}
                  <strong className="text-foreground border-b border-foreground/40 px-2 font-bold">
                    {fatherNameInput || testimonial.fatherName || "_________________"}
                  </strong>{" "}
                  (Father) and{" "}
                  <strong className="text-foreground border-b border-foreground/40 px-2 font-bold">
                    {motherNameInput || testimonial.motherName || "_________________"}
                  </strong>{" "}
                  (Mother), bearing Student ID No:{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400 font-sans font-bold">
                    {testimonial.studentIdNo || "N/A"}
                  </strong>
                  , was a regular student of Class{" "}
                  <strong className="font-bold">{testimonial.className || "N/A"}</strong> (Roll No:{" "}
                  <strong className="font-bold">{testimonial.rollNo || "N/A"}</strong>) in the academic
                  session <strong className="font-bold">{testimonial.session || "2026"}</strong>.
                </p>

                <p className="text-justify">
                  To the best of my knowledge and belief, he/she bears a good
                  moral character and demonstrated commendable academic discipline,
                  sincerity, and moral conduct throughout his/her tenure at this institution. He/she has{" "}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {testimonial.status || "Passed with distinction"}
                  </strong>
                  .
                </p>

                <p className="text-justify">
                  I wish him/her every success, good health, and a bright, prosperous future in life.
                </p>
              </div>

              {/* Signatures & Issue Date */}
              <div className="pt-16 grid grid-cols-2 justify-between items-end text-xs font-semibold text-foreground">
                <div>
                  <p className="text-muted-foreground">
                    Date of Issue:{" "}
                    <span className="font-bold text-foreground">
                      {testimonial.issueDate
                        ? new Date(testimonial.issueDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : new Date().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                    </span>
                  </p>
                </div>

                <div className="text-center ml-auto space-y-1">
                  <div className="w-48 border-b-2 border-foreground/50 mx-auto mb-1"></div>
                  <p className="font-extrabold text-sm">Headmaster / Principal</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Al-Iman Academy & High School
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}