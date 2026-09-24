"use client";

import React, { useState, useEffect } from "react";
import {
  FaUserGraduate,
  FaUser,
  FaPhoneAlt,
  FaHeartbeat,
  FaMapMarkerAlt,
  FaUniversity,
  FaMoneyBillWave,
  FaSpinner,
  FaInfoCircle,
  FaMobileAlt,
  FaCopy,
  FaPrint,
  FaGlobe,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { academicService } from "@/src/Services/academicService";
import { admissionApi, IAdmissionPayload } from "@/src/Services/admissionApi";
import { useLanguage } from "@/src/context/LanguageContext";
import { toast } from "sonner";

export default function PublicAdmissionApplyPage() {
  const { language, setLanguage } = useLanguage();
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    appNo: string;
    payload: IAdmissionPayload;
    className: string;
  } | null>(null);

  // Health options state
  const [healthOptions, setHealthOptions] = useState<{ [key: string]: boolean }>({
    "Good Condition": true,
    "Have Some Problem": false,
    "Taking Medicine": false,
    "Need Extra Care": false,
    "Need Hot Water Bath": false,
    "Hot Drinking Water": false,
  });

  const [sameAddress, setSameAddress] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<IAdmissionPayload>>({
    gender: "MALE",
    religion: "Islam",
    country: "Bangladesh",
    nationality: "Bangladeshi",
    paymentMethod: "BKASH",
    amount: 500,
    admitOtherKids: false,
    healthConditions: ["Good Condition"],
  });

  // Load Active Classes
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await academicService.getAllClasses();
        const loaded = res?.data || res || [];
        setClassesList(loaded);
        if (loaded.length > 0) {
          setFormData((prev) => ({ ...prev, classId: loaded[0].id }));
        }
      } catch (err) {
        toast.error(
          language === "bn"
            ? "ক্লাস লিস্ট লোড করতে ব্যর্থ হয়েছে!"
            : "Failed to load academic classes!"
        );
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClasses();
  }, [language]);

  // Handle Health Checkbox Change
  const handleHealthChange = (key: string, checked: boolean) => {
    const updated = { ...healthOptions, [key]: checked };
    setHealthOptions(updated);
    const selectedList = Object.keys(updated).filter((k) => updated[k]);
    setFormData((prev) => ({ ...prev, healthConditions: selectedList }));
  };

  // Handle Same Address Toggle
  const handleAddressToggle = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: prev.presentAddress || "",
      }));
    }
  };

  // Copy Number Helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(
      language === "bn" ? "নাম্বার কপি করা হয়েছে!" : "Number copied to clipboard!"
    );
  };

  // Print Slip / Save PDF Handler
  const handlePrintPdf = () => {
    window.print();
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.classId) {
      toast.error(
        language === "bn"
          ? "দয়া করে কাঙ্ক্ষিত ক্লাস সিলেক্ট করুন!"
          : "Please select a target class!"
      );
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(
      language === "bn" ? "আবেদন জমা হচ্ছে..." : "Submitting admission application..."
    );

    try {
      const selectedClass = classesList.find((c) => c.id === formData.classId);
      const selectedHealth = Object.keys(healthOptions).filter(
        (k) => healthOptions[k]
      );

      const payload: IAdmissionPayload = {
        studentName: formData.studentName || "",
        gender: (formData.gender as "MALE" | "FEMALE" | "OTHER") || "MALE",
        dateOfBirth: formData.dateOfBirth || "",
        religion: formData.religion || "Islam",
        country: formData.country || "Bangladesh",
        bloodGroup: formData.bloodGroup,
        nationality: formData.nationality || "Bangladeshi",
        birthRegNo: formData.birthRegNo,

        fatherName: formData.fatherName || "",
        fatherOccupation: formData.fatherOccupation,
        fatherNid: formData.fatherNid,
        motherName: formData.motherName || "",
        motherOccupation: formData.motherOccupation,
        motherNid: formData.motherNid,
        guardianName: formData.guardianName,
        guardianOccupation: formData.guardianOccupation,

        phone: formData.phone || "",
        altPhone: formData.altPhone,
        email: formData.email || "",
        guardianPhone: formData.guardianPhone || "",
        guardianEmail: formData.guardianEmail,
        guardianAddress: formData.guardianAddress,

        passportNo: formData.passportNo,
        passportExpiryDate: formData.passportExpiryDate,
        height: formData.height,
        weight: formData.weight,
        healthConditions: selectedHealth,
        siblingStudentId: formData.siblingStudentId,
        admitOtherKids: formData.admitOtherKids || false,

        presentAddress: formData.presentAddress || "",
        permanentAddress: sameAddress
          ? formData.presentAddress || ""
          : formData.permanentAddress || "",
        sameAsPresent: sameAddress,

        prevInstituteName: formData.prevInstituteName,
        prevInstituteAddress: formData.prevInstituteAddress,
        references: formData.references,
        photoUrl: formData.photoUrl,

        classId: formData.classId || "",
        paymentMethod:
          (formData.paymentMethod as "CASH" | "BKASH" | "NAGAD" | "SSLCOMMERZ") ||
          "BKASH",
        senderPhone: formData.senderPhone || "",
        amount: 500,
        transactionId: formData.transactionId || "",
      };

      // Axios call to Express Backend (/api/v1/admissions/apply)
      const res = await admissionApi.submitAdmission(payload);
      const appNo = res?.data?.applicationNo || "ADM-SUCCESS";

      setSubmittedData({
        appNo,
        payload,
        className: selectedClass?.name || "Selected Class",
      });

      toast.success(
        language === "bn"
          ? "ভর্তি আবেদন সফলভাবে সম্পন্ন হয়েছে!"
          : "Application Submitted Successfully!",
        { id: toastId }
      );
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit application";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // SUCCESS SLIP / PRINTABLE PDF VIEW
  // ==========================================
  if (submittedData) {
    const { appNo, payload, className } = submittedData;
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 font-sans">
        {/* Top Control Bar (Hidden when Printing) */}
        <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="text-xs rounded-xl"
          >
            {language === "bn" ? "← নতুন আবেদন করুন" : "← Submit Another"}
          </Button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-border shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <FaGlobe className="text-emerald-600" />
              <span>{language === "en" ? "বাংলা" : "English"}</span>
            </button>

            <Button
              onClick={handlePrintPdf}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <FaPrint />
              <span>
                {language === "bn"
                  ? "রশিদ প্রিন্ট / ডাউনলোড (PDF)"
                  : "Print Slip / Save PDF"}
              </span>
            </Button>
          </div>
        </div>

        {/* PRINTABLE APPLICATION RECEIPT (A4 PDF CARD) */}
        <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl shadow-xl p-8 border border-emerald-200 print:shadow-none print:border-none print:p-0 print:max-w-full">
          {/* Slip Header */}
          <div className="border-b-2 border-emerald-800 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-emerald-900 tracking-tight">
                AL-IMAN ISLAMIC SCHOOL
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Official Student Admission Application Receipt
              </p>
              <p className="text-[11px] text-slate-500">
                Bailtali, Chittagong Division, Bangladesh
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full mb-1">
                {language === "bn" ? "ভর্তি আবেদন রশিদ" : "ADMISSION SLIP"}
              </span>
              <p className="text-xs font-mono font-bold text-slate-700">
                App No: <span className="text-emerald-700">{appNo}</span>
              </p>
              <p className="text-[10px] text-slate-500">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Student & Academic Summary Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Applicant Name
              </span>
              <span className="text-sm font-bold text-slate-800">
                {payload.studentName}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Applied Class
              </span>
              <span className="text-sm font-bold text-emerald-700">
                {className}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Mobile Number
              </span>
              <span className="text-sm font-bold text-slate-800">
                {payload.phone}
              </span>
            </div>
          </div>

          {/* Comprehensive Field Data Breakdown */}
          <div className="space-y-4 text-xs">
            {/* Personal Details */}
            <div>
              <h3 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1 mb-2 uppercase text-[11px]">
                1. Personal Details
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <p>
                  <b>Gender:</b> {payload.gender}
                </p>
                <p>
                  <b>Date of Birth:</b> {payload.dateOfBirth}
                </p>
                <p>
                  <b>Religion:</b> {payload.religion}
                </p>
                <p>
                  <b>Blood Group:</b> {payload.bloodGroup || "N/A"}
                </p>
                <p>
                  <b>Birth Reg No:</b> {payload.birthRegNo || "N/A"}
                </p>
                <p>
                  <b>Nationality:</b> {payload.nationality}
                </p>
              </div>
            </div>

            {/* Parents Info */}
            <div>
              <h3 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1 mb-2 uppercase text-[11px]">
                2. Parents & Guardian Info
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <b>Father Name:</b> {payload.fatherName} (
                  {payload.fatherOccupation || "N/A"})
                </p>
                <p>
                  <b>Father NID:</b> {payload.fatherNid || "N/A"}
                </p>
                <p>
                  <b>Mother Name:</b> {payload.motherName} (
                  {payload.motherOccupation || "N/A"})
                </p>
                <p>
                  <b>Mother NID:</b> {payload.motherNid || "N/A"}
                </p>
                <p>
                  <b>Guardian Phone:</b> {payload.guardianPhone}
                </p>
                <p>
                  <b>Guardian Address:</b> {payload.guardianAddress || "N/A"}
                </p>
              </div>
            </div>

            {/* Address & Additional */}
            <div>
              <h3 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1 mb-2 uppercase text-[11px]">
                3. Address & Health Condition
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <b>Present Address:</b> {payload.presentAddress}
                </p>
                <p>
                  <b>Permanent Address:</b> {payload.permanentAddress}
                </p>
                <p>
                  <b>Health Tag:</b> {payload.healthConditions?.join(", ")}
                </p>
                <p>
                  <b>Height / Weight:</b> {payload.height || "N/A"} /{" "}
                  {payload.weight || "N/A"}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200">
              <h3 className="font-bold text-emerald-900 border-b border-emerald-300 pb-1 mb-2 uppercase text-[11px]">
                4. Payment Status (Submitted)
              </h3>
              <div className="grid grid-cols-3 gap-2 font-mono">
                <p>
                  <b>Fee Paid:</b> 500 BDT
                </p>
                <p>
                  <b>Method:</b> {payload.paymentMethod} ({payload.senderPhone})
                </p>
                <p>
                  <b>TrxID:</b>{" "}
                  <span className="text-emerald-700 font-bold">
                    {payload.transactionId}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
            <div>
              <p className="italic">
                This is a system-generated admission application slip.
              </p>
              <p>
                Please preserve this slip for future verification during office
                review.
              </p>
            </div>
            <div className="text-center border-t border-slate-400 pt-1 w-36">
              <p className="font-bold text-slate-700">Authorized Officer</p>
              <p>Al-Iman School</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN ADMISSION FORM VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Arabic Calligraphy Background Watermark Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex flex-col justify-between p-10 opacity-[0.03] dark:opacity-[0.05] font-serif text-6xl sm:text-8xl md:text-9xl select-none text-emerald-900 dark:text-emerald-100 text-center">
        <div>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
        <div>إِقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</div>
        <div>رَّبِّ زِدْنِي عِلْمًا</div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header Banner */}
        <div className="text-center space-y-3 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-700">
          <div className="absolute -right-8 -bottom-8 opacity-10 text-9xl font-serif pointer-events-none select-none">
            الله
          </div>
          <div className="inline-flex items-center gap-2 text-emerald-200 font-bold text-xs bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/30">
            <FaUserGraduate />
            <span>
              {language === "bn"
                ? "আল-ঈমান ইসলামিক স্কুল • অনলাইন ভর্তি পোর্টাল"
                : "Al-Iman Islamic School • Admission Portal"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === "bn"
              ? "শিক্ষার্থী ভর্তি আবেদন ফরম"
              : "Student Admission Application Form"}
          </h1>
          <p className="text-xs text-emerald-100/90 max-w-lg mx-auto font-medium">
            {language === "bn"
              ? "দয়া করে সকল তথ্য সঠিকভাবে পূরণ করুন। তারকা চিহ্নিত (*) ঘরগুলো পূরণ করা বাধ্যতামূলক।"
              : "Please fill out all required fields carefully. Fields marked with (*) are mandatory."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Academic Target Selection */}
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-2.5">
                <FaUniversity className="text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === "bn" ? "১. ভর্তির শ্রেণী" : "1. Academic Target"}
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "কাঙ্ক্ষিত শ্রেণী *"
                      : "Applying for Class *"}
                  </label>
                  {loadingClasses ? (
                    <div className="p-2.5 text-xs text-muted-foreground flex items-center gap-2">
                      <FaSpinner className="animate-spin text-emerald-600" />{" "}
                      Loading classes...
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.classId}
                      onChange={(e) =>
                        setFormData({ ...formData, classId: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground font-semibold focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {classesList.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "শিক্ষার্থীর ছবি লিংক (URL)"
                      : "Student Photo URL"}
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/student-photo.jpg"
                    value={formData.photoUrl || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, photoUrl: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Personal Information */}
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-2.5">
                <FaUser className="text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === "bn"
                    ? "২. ব্যক্তিগত তথ্য"
                    : "2. Personal Information"}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "আবেদনকারীর পুরো নাম *"
                      : "Applicant Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={formData.studentName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, studentName: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "জেন্ডার *" : "Gender *"}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="MALE">
                      {language === "bn" ? "পুরুষ" : "Male"}
                    </option>
                    <option value="FEMALE">
                      {language === "bn" ? "মহিলা" : "Female"}
                    </option>
                    <option value="OTHER">
                      {language === "bn" ? "অন্যান্য" : "Other"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "জন্ম তারিখ *" : "Date of Birth *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "ধর্ম *" : "Religion *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.religion || "Islam"}
                    onChange={(e) =>
                      setFormData({ ...formData, religion: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "জাতীয়তা *" : "Nationality *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nationality || "Bangladeshi"}
                    onChange={(e) =>
                      setFormData({ ...formData, nationality: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "দেশ *" : "Country *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country || "Bangladesh"}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "রক্তের গ্রুপ" : "Blood Group"}
                  </label>
                  <select
                    value={formData.bloodGroup || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodGroup: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "জন্ম নিবন্ধন নম্বর"
                      : "Birth Registration No"}
                  </label>
                  <input
                    type="text"
                    placeholder="17 Digit Number"
                    value={formData.birthRegNo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, birthRegNo: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Parents Section */}
              <div className="pt-3 border-t border-border/70">
                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-3 uppercase tracking-wider">
                  {language === "bn"
                    ? "পিতা-মাতা ও অভিভাবকের তথ্য"
                    : "Parents & Guardian Information"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "পিতার নাম *" : "Father Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fatherName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, fatherName: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "পিতার পেশা" : "Father Occupation"}
                    </label>
                    <input
                      type="text"
                      value={formData.fatherOccupation || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fatherOccupation: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn"
                        ? "পিতার এনআইডি নম্বর"
                        : "Father NID No"}
                    </label>
                    <input
                      type="text"
                      value={formData.fatherNid || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, fatherNid: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "মাতার নাম *" : "Mother Name *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.motherName || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, motherName: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "মাতার পেশা" : "Mother Occupation"}
                    </label>
                    <input
                      type="text"
                      value={formData.motherOccupation || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          motherOccupation: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn"
                        ? "মাতার এনআইডি নম্বর"
                        : "Mother NID No"}
                    </label>
                    <input
                      type="text"
                      value={formData.motherNid || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, motherNid: e.target.value })
                      }
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn"
                        ? "অভিভাবকের নাম (যদি থাকে)"
                        : "Guardian Name (If any)"}
                    </label>
                    <input
                      type="text"
                      value={formData.guardianName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          guardianName: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn"
                        ? "অভিভাবকের পেশা"
                        : "Guardian Occupation"}
                    </label>
                    <input
                      type="text"
                      value={formData.guardianOccupation || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          guardianOccupation: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Contact Information */}
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-2.5">
                <FaPhoneAlt className="text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === "bn"
                    ? "৩. যোগাযোগের তথ্য"
                    : "3. Contact Information"}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "যোগাযোগ / SMS মোবাইল নম্বর *"
                      : "Contact / SMS Mobile *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "বিকল্প মোবাইল নম্বর"
                      : "Alternative Mobile"}
                  </label>
                  <input
                    type="text"
                    value={formData.altPhone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, altPhone: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "ইমেইল অ্যাড্রেস *" : "Contact Email *"}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "অভিভাবকের মোবাইল নম্বর *"
                      : "Father / Guardian Mobile *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="018XXXXXXXX"
                    value={formData.guardianPhone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, guardianPhone: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "অভিভাবকের ইমেইল" : "Guardian Email"}
                  </label>
                  <input
                    type="email"
                    value={formData.guardianEmail || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, guardianEmail: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "অভিভাবকের ঠিকানা" : "Guardian Address"}
                  </label>
                  <input
                    type="text"
                    value={formData.guardianAddress || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guardianAddress: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Additional & Health Condition */}
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-2.5">
                <FaHeartbeat className="text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === "bn"
                    ? "৪. অতিরিক্ত ও স্বাস্থ্যগত তথ্য"
                    : "4. Additional & Health Information"}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    Passport No (If any)
                  </label>
                  <input
                    type="text"
                    value={formData.passportNo || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, passportNo: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    Passport Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.passportExpiryDate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passportExpiryDate: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "উচ্চতা" : "Height (e.g. 4 ft 2 in)"}
                  </label>
                  <input
                    type="text"
                    value={formData.height || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "ওজন" : "Weight (e.g. 35 kg)"}
                  </label>
                  <input
                    type="text"
                    value={formData.weight || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Health Checkboxes */}
              <div className="pt-3 border-t border-border/70 space-y-2">
                <label className="block text-xs font-bold text-foreground">
                  {language === "bn"
                    ? "স্বাস্থ্যগত অবস্থা (কমপক্ষে একটি নির্বাচন করুন)"
                    : "Health Condition (Tick at least one)"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {Object.keys(healthOptions).map((optionKey) => (
                    <label
                      key={optionKey}
                      className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/60 hover:border-emerald-500/50 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={healthOptions[optionKey]}
                        onChange={(e) =>
                          handleHealthChange(optionKey, e.target.checked)
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{optionKey}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sibling Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "অন্য কোনো ভাই/বোন পড়ে? (Student ID দিন)"
                      : "Have any Siblings? Input Student ID"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. STU-123456"
                    value={formData.siblingStudentId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        siblingStudentId: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="admitOtherKids"
                    checked={formData.admitOtherKids || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        admitOtherKids: e.target.checked,
                      })
                    }
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="admitOtherKids"
                    className="font-semibold text-foreground cursor-pointer"
                  >
                    {language === "bn"
                      ? "অন্য কোনো শিক্ষার্থী ভর্তি করাতে চান?"
                      : "Do you want to admit any other kids?"}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Address Details */}
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-2.5">
                <FaMapMarkerAlt className="text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === "bn" ? "৫. ঠিকানা" : "5. Address Details"}
                </span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "বর্তমান ঠিকানা *" : "Present Address *"}
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House / Village, Post Office, Upazila, District"
                    value={formData.presentAddress || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        presentAddress: val,
                        permanentAddress: sameAddress
                          ? val
                          : prev.permanentAddress,
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    checked={sameAddress}
                    onChange={(e) => handleAddressToggle(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="sameAddress"
                    className="font-semibold text-foreground cursor-pointer"
                  >
                    {language === "bn"
                      ? "বর্তমান ও স্থায়ী ঠিকানা একই"
                      : "Permanent Address same as present address"}
                  </label>
                </div>

                {!sameAddress && (
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn"
                        ? "স্থায়ী ঠিকানা *"
                        : "Permanent Address *"}
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House / Village, Post Office, Upazila, District"
                      value={formData.permanentAddress || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permanentAddress: e.target.value,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 6. Previous Educational Institute & References */}
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-2.5">
                <FaUniversity className="text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === "bn"
                    ? "৬. পূর্ববর্তী শিক্ষা প্রতিষ্ঠানের তথ্য"
                    : "6. Previous Educational Institute"}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "পূর্ববর্তী প্রতিষ্ঠানের নাম"
                      : "Institute Name (If any)"}
                  </label>
                  <input
                    type="text"
                    value={formData.prevInstituteName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prevInstituteName: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "প্রতিষ্ঠানের ঠিকানা"
                      : "Institute Address"}
                  </label>
                  <input
                    type="text"
                    value={formData.prevInstituteAddress || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        prevInstituteAddress: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "রেফারেন্স (যদি থাকে)" : "References (If any)"}
                  </label>
                  <input
                    type="text"
                    placeholder="Name / Phone of person who referred"
                    value={formData.references || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, references: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Payment Application */}
          <Card className="border-emerald-200 dark:border-emerald-900 shadow-md rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 backdrop-blur-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 border-b border-emerald-200/80 dark:border-emerald-900 pb-2.5">
                <FaMoneyBillWave className="text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === "bn"
                    ? "৭. ভর্তি ফি ও পেমেন্ট তথ্য"
                    : "7. Payment Application"}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "আবেদন ফি (টাকা)" : "Application Fee (BDT)"}
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value="500 BDT (Fixed)"
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-100/50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 font-bold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "পেমেন্ট মেথড *" : "Payment Method *"}
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground font-semibold"
                  >
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="CASH">CASH</option>
                    <option value="SSLCOMMERZ">Bank / Online</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "প্রেরকের নম্বর *" : "Sender Mobile No *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={formData.senderPhone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, senderPhone: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "ট্রানজেকশন আইডি (TrxID) *"
                      : "Transaction ID (TrxID) Details *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9M7X8Y2Z1"
                    value={formData.transactionId || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, transactionId: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground font-mono font-bold uppercase"
                  />
                </div>
              </div>

              {/* Payment Instruction Box */}
              <div className="mt-4 p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-300 dark:border-emerald-800 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-emerald-100 dark:border-emerald-900 pb-2">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <FaInfoCircle className="text-emerald-600" />
                    <span>Payment Instruction</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-mono font-bold">
                    <FaMobileAlt />
                    <span>+880 1328-211952</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("+8801328211952")}
                      className="ml-1 text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200"
                      title="Copy Number"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>

                <ul className="list-disc list-inside space-y-1 text-muted-foreground font-medium pl-1">
                  <li>
                    bKash / Nagad Personal Number:{" "}
                    <span className="font-bold text-foreground">
                      +880 1328-211952
                    </span>
                  </li>
                  <li>
                    For bKash Make Payment or Send Money amount:{" "}
                    <span className="font-mono font-bold text-foreground">
                      500 BDT
                    </span>
                  </li>
                  <li>Provide Reference number as student name or mobile number.</li>
                  <li>
                    Please paste the exact Transaction ID (TrxID) from the SMS
                    confirmation into the field above.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Submit Action Button */}
          <div className="text-right pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2 inline" />{" "}
                  {language === "bn"
                    ? "আবেদন জমা হচ্ছে..."
                    : "Submitting Application..."}
                </>
              ) : language === "bn" ? (
                "ভর্তি আবেদন জমা দিন"
              ) : (
                "Submit Application Form"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}