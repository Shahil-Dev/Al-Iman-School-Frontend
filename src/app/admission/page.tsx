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
  FaWhatsapp,
  FaFileUpload,
  FaCheckCircle,
  FaShieldAlt,
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
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submittedData, setSubmittedData] = useState<{
    appNo: string;
    payload: IAdmissionPayload;
    className: string;
  } | null>(null);

  // Health options state
  const [healthOptions, setHealthOptions] = useState<{
    [key: string]: boolean;
  }>({
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
            : "Failed to load academic classes!",
        );
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClasses();
  }, [language]);

  // Image File Selection with Size Compression / Safeguard
 // 📸 Image Auto-Compression & Base64 Handler
const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // ১. ফাইল টাইপ ভ্যালিডেশন
  if (!file.type.startsWith("image/")) {
    toast.error(
      language === "bn"
        ? "অনুগ্রহ করে একটি সঠিক ছবি ফরম্যাট (JPG/PNG) সিলেক্ট করুন!"
        : "Please select a valid image file (JPG/PNG)!"
    );
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target?.result as string;

    img.onload = () => {
      // ২. ছবির সর্বোচ্চ সাইজ (Max Width/Height: 800px) নির্ধারণ
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      // ৩. HTML5 Canvas এ কমপ্রেস করে আঁকা
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);

        // ৪. ৭০% কোয়ালিটিতে অতি ক্ষুদ্র JPEG Base64 জেনারেট করা (সাইজ সাধারণত ১৫০-৩০০ KB তে নেমে আসবে)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

        setImagePreview(compressedBase64);
        setFormData((prev) => ({ ...prev, photoUrl: compressedBase64 }));

        toast.success(
          language === "bn"
            ? "ছবিটি সফলভাবে অপটিমাইজ করা হয়েছে!"
            : "Image optimized successfully!"
        );
      }
    };
  };
};

  // Health Checkbox Change
  const handleHealthChange = (key: string, checked: boolean) => {
    const updated = { ...healthOptions, [key]: checked };
    setHealthOptions(updated);
    const selectedList = Object.keys(updated).filter((k) => updated[k]);
    setFormData((prev) => ({ ...prev, healthConditions: selectedList }));
  };

  // Same Address Toggle
  const handleAddressToggle = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        permanentAddress: prev.presentAddress || "",
      }));
    }
  };

  // Copy Helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(
      language === "bn"
        ? "নাম্বার কপি করা হয়েছে!"
        : "Number copied to clipboard!",
    );
  };

  // Print PDF Handler
  const handlePrintPdf = () => {
    window.print();
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.classId) {
      toast.error(
        language === "bn"
          ? "দয়া করে কাঙ্ক্ষিত ক্লাস সিলেক্ট করুন!"
          : "Please select a target class!",
      );
      return;
    }

    if (!declarationAgreed) {
      toast.error(
        language === "bn"
          ? "দয়া করে অঙ্গীকারনামায় টিক চিহ্ন দিন!"
          : "Please agree to the declaration terms!",
      );
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(
      language === "bn"
        ? "আবেদন জমা হচ্ছে..."
        : "Submitting admission application...",
    );

    try {
      const selectedClass = classesList.find((c) => c.id === formData.classId);
      const selectedHealth = Object.keys(healthOptions).filter(
        (k) => healthOptions[k],
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
        guardianName: formData.guardianName || formData.fatherName || "",
        guardianOccupation: formData.guardianOccupation,

        phone: formData.phone || "",
        altPhone: formData.altPhone,
        email: formData.email || "",
        guardianPhone: formData.guardianPhone || formData.phone || "",
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
        photoUrl: formData.photoUrl || "",

        classId: formData.classId || "",
        paymentMethod:
          (formData.paymentMethod as
            | "CASH"
            | "BKASH"
            | "NAGAD"
            | "SSLCOMMERZ") || "BKASH",
        senderPhone: formData.senderPhone || formData.phone || "",
        amount: 500,
        transactionId: formData.transactionId || "",
      };

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
        { id: toastId },
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
  // SUCCESS SLIP / PRINTABLE RECEIPT VIEW
  // ==========================================
  if (submittedData) {
    const { appNo, payload, className } = submittedData;
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 font-sans">
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

        {/* PRINTABLE RECEIPT CARD */}
        <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl shadow-xl p-8 border border-emerald-200 print:shadow-none print:border-none print:p-0 print:max-w-full">
          <div className="border-b-2 border-emerald-800 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-emerald-900 tracking-tight">
                AL-IMAN ISLAMIC SCHOOL
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Official Student Admission Application Slip
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
                WhatsApp / Phone
              </span>
              <span className="text-sm font-bold text-slate-800 font-mono">
                {payload.phone}
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1 mb-2 uppercase text-[11px]">
                1. Personal & Family Details
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <b>Gender:</b> {payload.gender}
                </p>
                <p>
                  <b>Date of Birth:</b> {payload.dateOfBirth}
                </p>
                <p>
                  <b>Father Name:</b> {payload.fatherName}
                </p>
                <p>
                  <b>Mother Name:</b> {payload.motherName}
                </p>
                <p>
                  <b>Guardian Phone:</b> {payload.guardianPhone}
                </p>
                <p>
                  <b>Email:</b> {payload.email}
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 font-mono">
              <h3 className="font-bold text-emerald-900 border-b border-emerald-300 pb-1 mb-2 uppercase text-[11px] font-sans">
                2. Fee Payment Status
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <p>
                  <b>Fee Paid:</b> 500 BDT
                </p>
                <p>
                  <b>Method:</b> {payload.paymentMethod}
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

          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
            <div>
              <p className="italic">
                This is a system-generated admission slip.
              </p>
              <p>
                Credentials (Student Code & PIN) will be dispatched to WhatsApp
                upon Admin Approval.
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
      {/* Background Islamic Watermark */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex flex-col justify-between p-10 opacity-[0.03] dark:opacity-[0.05] font-serif text-6xl sm:text-8xl md:text-9xl select-none text-emerald-900 dark:text-emerald-100 text-center">
        <div>بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
        <div>إِقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ</div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Header Banner */}
        <div className="text-center space-y-3 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-emerald-700">
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
          {/* 1. Academic Target & Photo */}
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-2.5">
                <FaUniversity className="text-emerald-600 dark:text-emerald-400" />
                <span>
                  {language === "bn"
                    ? "১. ভর্তির শ্রেণী ও ছবি"
                    : "1. Academic Target & Photo"}
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

                {/* Direct Image File Selection */}
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "শিক্ষার্থীর ছবি (ডিভাইস থেকে সিলেক্ট করুন) *"
                      : "Student Photo (Choose File) *"}
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-input rounded-xl p-1"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Student Preview"
                        className="w-10 h-10 object-cover rounded-lg border-2 border-emerald-500 shrink-0 shadow-sm"
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Personal Information */}
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
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
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
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
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
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
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
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
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
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
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
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
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
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
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
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
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
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
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
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
                {/* WhatsApp Verified Phone Notice Box */}
                <div className="sm:col-span-3 bg-emerald-50/80 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-2">
                  <label className="block font-bold text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
                    <FaWhatsapp className="text-emerald-600 text-base" />
                    <span>
                      {language === "bn"
                        ? "যোগাযোগ / হোয়াটসঅ্যাপ (WhatsApp) মোবাইল নম্বর *"
                        : "Contact / WhatsApp Mobile Number *"}
                    </span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-emerald-300 bg-background text-foreground font-mono font-bold text-sm"
                  />
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5 pt-1">
                    <FaInfoCircle className="shrink-0 text-emerald-600" />
                    <span>
                      {language === "bn"
                        ? "অবশ্যই একটি সক্রিয় হোয়াটসঅ্যাপ নম্বর দিন। ভর্তি অনুমোদন এবং ড্যাশবোর্ডের অ্যাক্সেস পিন সরাসরি এই হোয়াটসঅ্যাপ নম্বরে পাঠানো হবে।"
                        : "Please provide an active WhatsApp number. Admission credentials and access PIN will be sent to this number."}
                    </span>
                  </p>
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
                    {language === "bn"
                      ? "ইমেইল অ্যাড্রেস *"
                      : "Contact Email *"}
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
                      setFormData({
                        ...formData,
                        guardianPhone: e.target.value,
                      })
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
                      setFormData({
                        ...formData,
                        guardianEmail: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn"
                      ? "অভিভাবকের ঠিকানা"
                      : "Guardian Address"}
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
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
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
                      className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/60 hover:border-emerald-500/50 transition-all select-none"
                    >
                      <input
                        type="checkbox"
                        checked={healthOptions[optionKey]}
                        onChange={(e) =>
                          handleHealthChange(optionKey, e.target.checked)
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
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
                    placeholder="e.g. STU-26-0001"
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
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor="admitOtherKids"
                    className="font-semibold text-foreground cursor-pointer select-none"
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
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
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
                    {language === "bn"
                      ? "বর্তমান ঠিকানা *"
                      : "Present Address *"}
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
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label
                    htmlFor="sameAddress"
                    className="font-semibold text-foreground cursor-pointer select-none"
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
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
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
                    {language === "bn"
                      ? "রেফারেন্স (যদি থাকে)"
                      : "References (If any)"}
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

          {/* 7. Payment Application Details */}
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
                    {language === "bn"
                      ? "আবেদন ফি (টাকা)"
                      : "Application Fee (BDT)"}
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value="500 BDT (Fixed)"
                    className="w-full p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold font-mono cursor-not-allowed"
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
                    {language === "bn"
                      ? "প্রেরকের নম্বর *"
                      : "Sender Mobile No *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={formData.senderPhone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, senderPhone: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground font-mono font-bold"
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
                      setFormData({
                        ...formData,
                        transactionId: e.target.value,
                      })
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
                      className="ml-1 text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 cursor-pointer"
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
                    Fee amount:{" "}
                    <span className="font-mono font-bold text-foreground">
                      500 BDT
                    </span>
                  </li>
                  <li>
                    Please paste the exact Transaction ID (TrxID) from the SMS
                    confirmation into the field above.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 8. Declaration & Terms Checkbox */}
          <Card className="border-emerald-200 dark:border-emerald-800 shadow-sm rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30">
            <CardContent className="p-6 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={declarationAgreed}
                  onChange={(e) => setDeclarationAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500 cursor-pointer shrink-0"
                />
                <span className="text-xs text-foreground font-medium leading-relaxed">
                  <strong className="text-emerald-900 dark:text-emerald-300 font-bold block mb-0.5 flex items-center gap-1.5">
                    <FaShieldAlt className="text-emerald-600" />
                    {language === "bn"
                      ? "অঙ্গীকারনামা ও শর্তাবলী সম্মতকরণ:"
                      : "Declaration & Terms Agreement:"}
                  </strong>
                  {language === "bn"
                    ? "আমি এতদ্বারা সজ্ঞানে অঙ্গীকার করছি যে, উপরে প্রদত্ত সকল তথ্য সম্পূর্ণ সত্য, সঠিক ও নির্ভুল। ফর্মে প্রদত্ত যেকোনো ভুল, অসম্পূর্ণ বা ভুয়া তথ্যের জন্য আবেদনকারী/অভিভাবক নিজেই সম্পূর্ণ দায়ী থাকবেন এবং এর জন্য আল-ইমান স্কুল কর্তৃপক্ষ কোনোভাবেই দায়ী থাকবে না।"
                    : "I hereby solemnly declare that all information provided above is true, correct, and complete. The applicant/guardian will be solely responsible for any incorrect data, and the school authority shall not be held liable in any way."}
                </span>
              </label>
            </CardContent>
          </Card>

          {/* Submit Action Button */}
          <div className="text-center pt-2">
            <Button
              type="submit"
              disabled={submitting || !declarationAgreed}
              className="w-full sm:w-auto px-12 py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-xl transition-all cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  {language === "bn"
                    ? "আবেদন জমা হচ্ছে..."
                    : "Submitting Application..."}
                </span>
              ) : (
                <span>
                  {language === "bn"
                    ? "আবেদন জমা দিন"
                    : "Submit Application Form"}
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
