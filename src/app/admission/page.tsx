"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  FaGraduationCap, 
  FaUsers, 
  FaPhoneAlt, 
  FaHeartbeat, 
  FaMapMarkerAlt, 
  FaUniversity, 
  FaMoneyBillWave, 
  FaInfoCircle, 
  FaMobileAlt, 
  FaCopy, 
  FaSpinner, 
  FaCloudUploadAlt 
} from "react-icons/fa";
// import { Card, CardContent } from "@/components/ui/card";

import { toast } from "sonner"; 
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

export default function AdmissionPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<"bn" | "en">("bn");
  const [submitting, setSubmitting] = useState(false);
  const [sameAddress, setSameAddress] = useState(false);

  // Health options state
  const [healthOptions, setHealthOptions] = useState<{ [key: string]: boolean }>({
    Normal: true,
    Asthma: false,
    Allergy: false,
    Diabetic: false,
    HeartDisease: false,
    Other: false,
  });

  // Main Form Data State
  const [formData, setFormData] = useState({
    session: "2025-2026",
    classApplied: "",
    shift: "MORNING",
    version: "BANGLA",
    studentNameBn: "",
    studentNameEn: "",
    dob: "",
    gender: "MALE",
    religion: "ISLAM",
    bloodGroup: "",
    nationality: "Bangladeshi",
    birthCertificateNo: "",
    
    fatherNameBn: "",
    fatherNameEn: "",
    fatherNid: "",
    fatherOccupation: "",
    fatherPhone: "",
    
    motherNameBn: "",
    motherNameEn: "",
    motherNid: "",
    motherOccupation: "",
    motherPhone: "",

    phone: "",
    altPhone: "",
    email: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianAddress: "",

    passportNo: "",
    passportExpiryDate: "",
    height: "",
    weight: "",
    siblingStudentId: "",
    admitOtherKids: false,

    presentAddress: "",
    permanentAddress: "",

    prevInstituteName: "",
    prevInstituteAddress: "",
    references: "",

    paymentMethod: "BKASH" as "BKASH" | "NAGAD" | "CASH" | "SSLCOMMERZ",
    senderPhone: "",
    transactionId: "",
  });

  const handleHealthChange = (key: string, checked: boolean) => {
    setHealthOptions((prev) => ({ ...prev, [key]: checked }));
  };

  const handleAddressToggle = (checked: boolean) => {
    setSameAddress(checked);
    if (checked) {
      setFormData((prev) => ({ ...prev, permanentAddress: prev.presentAddress }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Number copied to clipboard!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Selected health conditions as array
    const selectedHealth = Object.keys(healthOptions).filter((k) => healthOptions[k]);

    // Construct Payload according to backend AdmissionApplicationData interface
    const payload = {
      ...formData,
      healthConditions: selectedHealth,
      permanentAddress: sameAddress ? formData.presentAddress : formData.permanentAddress,
      applicationFee: 500, // Fixed BDT 500
    };

    try {
      const response = await fetch("/api/admission/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit admission application");
      }

      toast.success(
        language === "bn" 
          ? "আবেদন সফলভাবে জমা হয়েছে!" 
          : "Application submitted successfully!"
      );
      
      // Redirect or reset form as needed
      // router.push('/admission/success');
    } catch (error: any) {
      toast.error(error.message || "Something went wrong! Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header & Language Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-emerald-100 dark:border-emerald-950 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400">
              {language === "bn" ? "অনলাইন ভর্তি ফরম" : "Online Admission Form"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {language === "bn" ? "অনুগ্রহ করে সকল তথ্য সঠিক উপায়ে পূরণ করুন" : "Please fill out all the required information accurately"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
            className="border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl font-medium text-xs"
          >
            {language === "bn" ? "English Version" : "বাংলা সংস্করণ"}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Academic & Personal Information */}
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
            <CardContent  className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-2.5">
                <FaGraduationCap className="text-emerald-600 dark:text-emerald-400" />
                <span>{language === "bn" ? "১. একাডেমিক ও ব্যক্তিগত তথ্য" : "1. Academic & Personal Details"}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "শিক্ষাবর্ষ *" : "Academic Session *"}
                  </label>
                  <select
                    value={formData.session}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "শ্রেণি *" : "Class Applied For *"}
                  </label>
                  <select
                    required
                    value={formData.classApplied}
                    onChange={(e) => setFormData({ ...formData, classApplied: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  >
                    <option value="">-- {language === "bn" ? "শ্রেণি নির্বাচন করুন" : "Select Class"} --</option>
                    <option value="Play">Play</option>
                    <option value="Nursery">Nursery</option>
                    <option value="KG">KG</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "শিফট *" : "Shift *"}
                  </label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  >
                    <option value="MORNING">Morning</option>
                    <option value="DAY">Day</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "ভার্সন *" : "Version *"}
                  </label>
                  <select
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  >
                    <option value="BANGLA">Bangla Version</option>
                    <option value="ENGLISH">English Version</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "শিক্ষার্থীর নাম (বাংলায়) *" : "Student Name (Bangla) *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="বাংলায় নাম লিখুন"
                    value={formData.studentNameBn}
                    onChange={(e) => setFormData({ ...formData, studentNameBn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "শিক্ষার্থীর নাম (ইংরেজিতে) *" : "Student Name (English) *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="In Capital Letters"
                    value={formData.studentNameEn}
                    onChange={(e) => setFormData({ ...formData, studentNameEn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "জন্ম তারিখ *" : "Date of Birth *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "লিঙ্গ *" : "Gender *"}
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "ধর্ম *" : "Religion *"}
                  </label>
                  <select
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  >
                    <option value="ISLAM">Islam</option>
                    <option value="HINDUISM">Hinduism</option>
                    <option value="BUDDHISM">Buddhism</option>
                    <option value="CHRISTIANITY">Christianity</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "রক্তের গ্রুপ" : "Blood Group"}
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  >
                    <option value="">-- Select --</option>
                    <option value="A_POSITIVE">A+</option>
                    <option value="A_NEGATIVE">A-</option>
                    <option value="B_POSITIVE">B+</option>
                    <option value="B_NEGATIVE">B-</option>
                    <option value="AB_POSITIVE">AB+</option>
                    <option value="AB_NEGATIVE">AB-</option>
                    <option value="O_POSITIVE">O+</option>
                    <option value="O_NEGATIVE">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "জাতীয়তা *" : "Nationality *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "জন্ম নিবন্ধন নম্বর *" : "Birth Certificate No *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="17 Digit Birth Reg. No"
                    value={formData.birthCertificateNo}
                    onChange={(e) => setFormData({ ...formData, birthCertificateNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Parents Information */}
          <Card className="border-emerald-100 dark:border-emerald-950 shadow-sm rounded-2xl backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-2.5">
                <FaUsers className="text-emerald-600 dark:text-emerald-400" />
                <span>{language === "bn" ? "২. পিতা ও মাতার তথ্য" : "2. Parents Details"}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {/* Father's Info */}
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                    {language === "bn" ? "পিতারের তথ্য" : "Father's Details"}
                  </h4>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "পিতার নাম (বাংলা) *" : "Father Name (Bangla) *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fatherNameBn}
                      onChange={(e) => setFormData({ ...formData, fatherNameBn: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "পিতার নাম (ইংরেজি) *" : "Father Name (English) *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fatherNameEn}
                      onChange={(e) => setFormData({ ...formData, fatherNameEn: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">NID No *</label>
                    <input
                      type="text"
                      required
                      value={formData.fatherNid}
                      onChange={(e) => setFormData({ ...formData, fatherNid: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "পেশা *" : "Occupation *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fatherOccupation}
                      onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "মোবাইল নম্বর *" : "Mobile No *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fatherPhone}
                      onChange={(e) => setFormData({ ...formData, fatherPhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                </div>

                {/* Mother's Info */}
                <div className="space-y-3 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-border/50">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                    {language === "bn" ? "মাতার তথ্য" : "Mother's Details"}
                  </h4>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "মাতার নাম (বাংলা) *" : "Mother Name (Bangla) *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.motherNameBn}
                      onChange={(e) => setFormData({ ...formData, motherNameBn: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "মাতার নাম (ইংরেজি) *" : "Mother Name (English) *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.motherNameEn}
                      onChange={(e) => setFormData({ ...formData, motherNameEn: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">NID No *</label>
                    <input
                      type="text"
                      required
                      value={formData.motherNid}
                      onChange={(e) => setFormData({ ...formData, motherNid: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "পেশা *" : "Occupation *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.motherOccupation}
                      onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "মোবাইল নম্বর *" : "Mobile No *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.motherPhone}
                      onChange={(e) => setFormData({ ...formData, motherPhone: e.target.value })}
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
                <span>{language === "bn" ? "৩. যোগাযোগের তথ্য" : "3. Contact Information"}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "যোগাযোগ / SMS মোবাইল নম্বর *" : "Contact / SMS Mobile *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "বিকল্প মোবাইল নম্বর" : "Alternative Mobile"}
                  </label>
                  <input
                    type="text"
                    value={formData.altPhone || ""}
                    onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "অভিভাবকের মোবাইল নম্বর *" : "Father / Guardian Mobile *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="018XXXXXXXX"
                    value={formData.guardianPhone || ""}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, guardianAddress: e.target.value })}
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
                <span>{language === "bn" ? "৪. অতিরিক্ত ও স্বাস্থ্যগত তথ্য" : "4. Additional & Health Information"}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Passport No (If any)</label>
                  <input
                    type="text"
                    value={formData.passportNo || ""}
                    onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-foreground">Passport Expiry Date</label>
                  <input
                    type="date"
                    value={formData.passportExpiryDate || ""}
                    onChange={(e) => setFormData({ ...formData, passportExpiryDate: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>
              </div>

              {/* Health Checkboxes */}
              <div className="pt-3 border-t border-border/70 space-y-2">
                <label className="block text-xs font-bold text-foreground">
                  {language === "bn" ? "স্বাস্থ্যগত অবস্থা (কমপক্ষে একটি নির্বাচন করুন)" : "Health Condition (Tick at least one)"}
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
                        onChange={(e) => handleHealthChange(optionKey, e.target.checked)}
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
                    {language === "bn" ? "অন্য কোনো ভাই/বোন পড়ে? (Student ID দিন)" : "Have any Siblings? Input Student ID"}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. STU-123456"
                    value={formData.siblingStudentId || ""}
                    onChange={(e) => setFormData({ ...formData, siblingStudentId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div className="flex items-center gap-2 sm:pt-6">
                  <input
                    type="checkbox"
                    id="admitOtherKids"
                    checked={formData.admitOtherKids || false}
                    onChange={(e) => setFormData({ ...formData, admitOtherKids: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="admitOtherKids" className="font-semibold text-foreground cursor-pointer">
                    {language === "bn" ? "অন্য কোনো শিক্ষার্থী ভর্তি করাতে চান?" : "Do you want to admit any other kids?"}
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
                <span>{language === "bn" ? "৫. ঠিকানা" : "5. Address Details"}</span>
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
                        permanentAddress: sameAddress ? val : prev.permanentAddress,
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
                  <label htmlFor="sameAddress" className="font-semibold text-foreground cursor-pointer">
                    {language === "bn" ? "বর্তমান ও স্থায়ী ঠিকানা একই" : "Permanent Address same as present address"}
                  </label>
                </div>

                {!sameAddress && (
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">
                      {language === "bn" ? "স্থায়ী ঠিকানা *" : "Permanent Address *"}
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House / Village, Post Office, Upazila, District"
                      value={formData.permanentAddress || ""}
                      onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
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
                <span>{language === "bn" ? "৬. পূর্ববর্তী শিক্ষা প্রতিষ্ঠানের তথ্য" : "6. Previous Educational Institute"}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "পূর্ববর্তী প্রতিষ্ঠানের নাম" : "Institute Name (If any)"}
                  </label>
                  <input
                    type="text"
                    value={formData.prevInstituteName || ""}
                    onChange={(e) => setFormData({ ...formData, prevInstituteName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "প্রতিষ্ঠানের ঠিকানা" : "Institute Address"}
                  </label>
                  <input
                    type="text"
                    value={formData.prevInstituteAddress || ""}
                    onChange={(e) => setFormData({ ...formData, prevInstituteAddress: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, references: e.target.value })}
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
                <span>{language === "bn" ? "৭. ভর্তি ফি ও পেমেন্ট তথ্য" : "7. Payment Application"}</span>
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
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground font-semibold"
                  >
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="CASH">CASH</option>
                    <option value="SSLCOMMERZ font-medium">Bank / Online</option>
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
                    onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold mb-1 text-foreground">
                    {language === "bn" ? "ট্রানজেকশন আইডি (TrxID) *" : "Transaction ID (TrxID) Details *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9M7X8Y2Z1"
                    value={formData.transactionId || ""}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
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
                      className="ml-1 text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-200 transition-colors"
                      title="Copy Number"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>

                <ul className="list-disc list-inside space-y-1 text-muted-foreground font-medium pl-1">
                  <li>bKash / Nagad Personal Number: <span className="font-bold text-foreground">+880 1328-211952</span></li>
                  <li>For bKash Make Payment or Send Money amount: <span className="font-mono font-bold text-foreground">500 BDT</span></li>
                  <li>Provide Reference number as student name or mobile number if needed.</li>
                  <li>Please paste the exact Transaction ID (TrxID) from the SMS confirmation into the field above.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Submit Action Button */}
          <div className="text-right pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 text-sm font-bold rounded-xl shadow-lg transition-all"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2 inline" /> {language === "bn" ? "আবেদন জমা হচ্ছে..." : "Submitting Application..."}
                </>
              ) : (
                language === "bn" ? "ভর্তি আবেদন জমা দিন" : "Submit Application Form"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}