"use client";

import React, { useState, useCallback, memo } from "react";
import {
  FaUser,
  FaUserGraduate,
  FaPhoneAlt,
  FaEnvelope,
  FaFileUpload,
  FaCheckCircle,
  FaGraduationCap,
  FaSpinner,
  FaCalendarAlt,
  FaVenusMars,
  FaLayerGroup,
} from "react-icons/fa";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button, Input } from "@base-ui/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

import { useLanguage } from "@/src/context/LanguageContext"; //
import { submitAdmission } from "@/src/Services/admissionApi";

type Language = "en" | "bn";

// Multilingual Data Source for Admission Page
const translations = {
  en: {
    title: "Online Student Admission",
    subtitle: "Please fill out the form carefully",
    successTitle: "Application Submitted!",
    successSubtitleStart: "Thank you for applying. Your Application ID is",
    successSubtitleEnd: ". Please save this for future tracking.",
    resetBtn: "Submit Another Application",
    section1Title: "Student Information",
    studentNameLabel: "Full Student Name",
    studentNamePlaceholder: "e.g. Yemtehan Shahil",
    classLabel: "Target Class",
    classPlaceholder: "Select Class",
    dobLabel: "Date of Birth",
    genderLabel: "Gender",
    genderPlaceholder: "Select Gender",
    genderMale: "Male",
    genderFemale: "Female",
    section2Title: "Parent / Guardian Details",
    guardianNameLabel: "Guardian Name",
    guardianNamePlaceholder: "Father's or Mother's Name",
    phoneLabel: "Contact Phone Number",
    emailLabel: "Email Address",
    section3Title: "Required Documents Upload",
    photoTitle: "Student Photo (Passport Size)",
    photoSubtitle: "PNG, JPG up to 2MB",
    certTitle: "Birth Certificate / PSC Transcript",
    certSubtitle: "PDF, JPG up to 5MB",
    fileSelected: "File selected",
    submitBtn: "Submit Admission Form",
    submittingBtn: "Submitting Application...",
    requiredField: "is required",
  },
  bn: {
    title: "অনলাইন শিক্ষার্থী ভর্তি",
    subtitle: "অনুগ্রহ করে ফর্মটি মনোযোগ সহকারে পূরণ করুন",
    successTitle: "আবেদন জমা দেওয়া হয়েছে!",
    successSubtitleStart: "আবেদন করার জন্য ধন্যবাদ। আপনার আবেদন আইডি হলো",
    successSubtitleEnd: "। ভবিষ্যৎ ট্র্যাকিংয়ের জন্য এটি সংরক্ষণ করুন।",
    resetBtn: "আরেকটি আবেদন জমা দিন",
    section1Title: "শিক্ষার্থীর তথ্য",
    studentNameLabel: "শিক্ষার্থীর পূর্ণ নাম",
    studentNamePlaceholder: "উদাঃ ইমতেহান শাহিল",
    classLabel: "ভর্তির শ্রেণী",
    classPlaceholder: "শ্রেণী নির্বাচন করুন",
    dobLabel: "জন্ম তারিখ",
    genderLabel: "লিঙ্গ",
    genderPlaceholder: "লিঙ্গ নির্বাচন করুন",
    genderMale: "পুরুষ",
    genderFemale: "নারী",
    section2Title: "পিতা-মাতা / অভিভাবকের বিবরণ",
    guardianNameLabel: "অভিভাবকের নাম",
    guardianNamePlaceholder: "পিতা বা মাতার নাম",
    phoneLabel: "যোগাযোগের ফোন নম্বর",
    emailLabel: "ইমেইল ঠিকানা",
    section3Title: "প্রয়োজনীয় কাগজপত্র আপলোড",
    photoTitle: "শিক্ষার্থীর ছবি (পাসপোর্ট সাইজ)",
    photoSubtitle: "PNG, JPG ২ মেগাবাইট পর্যন্ত",
    certTitle: "জন্ম নিবন্ধন / PSC ট্রান্সক্রিপ্ট",
    certSubtitle: "PDF, JPG ৫ মেগাবাইট পর্যন্ত",
    fileSelected: "ফাইল নির্বাচন করা হয়েছে",
    submitBtn: "ভর্তি ফর্ম জমা দিন",
    submittingBtn: "আবেদন জমা দেওয়া হচ্ছে...",
    requiredField: "আবশ্যক",
  },
};

const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 28,
  mass: 0.8,
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const FormSection = memo(
  ({
    icon: Icon,
    title,
    step,
    children,
    index,
  }: {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    step: number;
    children: React.ReactNode;
    index: number;
  }) => {
    const reduceMotion = useReducedMotion();

    return (
      <motion.div
        custom={index}
        variants={sectionVariants}
        initial={reduceMotion ? undefined : "hidden"}
        animate="visible"
        className="space-y-5"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-bold">
            {step}
            <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-[#c9a961] flex items-center justify-center">
              <Icon size={6} className="text-white dark:text-slate-950" />
            </span>
          </div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            {title}
          </h3>
        </div>
        {children}
      </motion.div>
    );
  },
);

FormSection.displayName = "FormSection";

const UploadZone = memo(
  ({
    title,
    subtitle,
    fileSelectedText,
    accept,
    icon: Icon,
    onChange,
  }: {
    title: string;
    subtitle: string;
    fileSelectedText: string;
    accept: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    onChange: (file: File | null) => void;
  }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const reduceMotion = useReducedMotion();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFileName(file ? file.name : null);
      onChange(file);
    };

    return (
      <motion.div
        whileHover={reduceMotion ? {} : { scale: 1.01 }}
        whileTap={reduceMotion ? {} : { scale: 0.99 }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={() => setIsDragOver(false)}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-colors duration-200 cursor-pointer ${
          isDragOver
            ? "border-[#c9a961] bg-[#c9a961]/5"
            : "border-input hover:border-[#c9a961]/60 bg-muted/20"
        }`}
      >
        <Input
          type="file"
          accept={accept}
          className="hidden"
          id={`file-${title}`}
          onChange={handleFileChange}
        />
        <label htmlFor={`file-${title}`} className="block cursor-pointer">
          <Icon
            className={`text-2xl mx-auto mb-2 transition-colors ${
              isDragOver ? "text-[#c9a961]" : "text-muted-foreground"
            }`}
          />
          <span className="block text-xs font-semibold text-foreground">
            {fileName || title}
          </span>
          <span className="text-[10px] text-muted-foreground block mt-1">
            {fileName ? fileSelectedText : subtitle}
          </span>
        </label>
      </motion.div>
    );
  },
);

UploadZone.displayName = "UploadZone";

export default function AdmissionPage() {
  const { language = "en" } = useLanguage();
  const currentLang = (language === "bn" ? "bn" : "en") as Language;
  const t = translations[currentLang];

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string>("");
  const reduceMotion = useReducedMotion();

  // Form Field States
  const [studentName, setStudentName] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [studentPhoto, setStudentPhoto] = useState<File | null>(null);
  const [birthCertificate, setBirthCertificate] = useState<File | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage(null);

      try {
        const data = new FormData();
        data.append("studentName", studentName);
        data.append("targetClass", targetClass);
        data.append("dob", dob);
        data.append("gender", gender);
        data.append("guardianName", guardianName);
        data.append("phone", phone);
        data.append("email", email);

        if (studentPhoto) data.append("studentPhoto", studentPhoto);
        if (birthCertificate) data.append("birthCertificate", birthCertificate);

        const response = await submitAdmission(data);

        if (response?.applicationId) {
          setApplicationId(response.applicationId);
        }

        setIsSubmitted(true);
      } catch (err: any) {
        setErrorMessage(
          err.message ||
            (currentLang === "bn"
              ? "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।"
              : "Something went wrong. Please try again."),
        );
      } finally {
        setLoading(false);
      }
    },
    [
      studentName,
      targetClass,
      dob,
      gender,
      guardianName,
      phone,
      email,
      studentPhoto,
      birthCertificate,
      currentLang,
    ],
  );

  const handleReset = useCallback(() => {
    setIsSubmitted(false);
    setErrorMessage(null);
    // Reset all form fields
    setStudentName("");
    setTargetClass("");
    setDob("");
    setGender("");
    setGuardianName("");
    setPhone("");
    setEmail("");
    setStudentPhoto(null);
    setBirthCertificate(null);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans relative transition-colors duration-300">
      {/* Dynamic Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.01] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={
                reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              transition={reduceMotion ? { duration: 0 } : springConfig}
            >
              <Card className="border-border bg-card shadow-xl text-center py-14 px-6 rounded-2xl">
                <CardContent className="space-y-6">
                  <motion.div
                    initial={reduceMotion ? { scale: 1 } : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { delay: 0.2, type: "spring", ...springConfig }
                    }
                    className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-4xl"
                  >
                    <FaCheckCircle />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-foreground">
                    {t.successTitle}
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    {t.successSubtitleStart}{" "}
                    <span className="font-semibold text-[#c9a961]">
                      {applicationId}
                    </span>
                    {t.successSubtitleEnd}
                  </p>
                  <Button
                    onClick={handleReset}
                    className="bg-primary hover:opacity-90 text-primary-foreground rounded-xl px-8 h-11 transition-all duration-200 hover:shadow-lg text-sm font-semibold"
                  >
                    {t.resetBtn}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <Card className="border-border shadow-xl rounded-2xl overflow-hidden bg-card/95 backdrop-blur-sm">
                <CardHeader className="bg-primary text-primary-foreground p-8 md:p-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-background/10 rounded-xl">
                      <FaGraduationCap className="text-3xl text-[#c9a961]" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight text-primary-foreground">
                        {t.title}
                      </CardTitle>
                      <CardDescription className="text-primary-foreground/70 text-sm mt-1.5">
                        {t.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 md:p-10">
                  {errorMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Section 1: Academic & Personal Info */}
                    <FormSection
                      icon={FaUserGraduate}
                      title={t.section1Title}
                      step={1}
                      index={0}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label
                            htmlFor="studentName"
                            className="block text-xs font-semibold text-foreground mb-2"
                          >
                            {t.studentNameLabel}{" "}
                            <span className="text-[#c9a961]">*</span>
                          </label>
                          <Input
                            id="studentName"
                            placeholder={t.studentNamePlaceholder}
                            required
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="targetClass"
                            className="block text-xs font-semibold text-foreground mb-2"
                          >
                            {t.classLabel}{" "}
                            <span className="text-[#c9a961]">*</span>
                          </label>
                          <div className="relative">
                            <FaLayerGroup className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none" />
                            <select
                              id="targetClass"
                              required
                              value={targetClass}
                              onChange={(e) => setTargetClass(e.target.value)}
                              className="w-full h-11 pl-10 pr-3 rounded-xl border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent bg-background transition-all duration-200"
                            >
                              <option value="">{t.classPlaceholder}</option>
                              <option value="play">Play</option>
                              <option value="nursery">Nursery</option>
                              <option value="kg">KG</option>
                              <option value="1">Class 1</option>
                              <option value="2">Class 2</option>
                              <option value="3">Class 3</option>
                              <option value="4">Class 4</option>
                              <option value="5">Class 5</option>
                              <option value="6">Class 6</option>
                              <option value="7">Class 7</option>
                              <option value="8">Class 8</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="dob"
                            className="block text-xs font-semibold text-foreground mb-2"
                          >
                            {t.dobLabel}{" "}
                            <span className="text-[#c9a961]">*</span>
                          </label>
                          <div className="relative">
                            <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none" />
                            <Input
                              id="dob"
                              type="date"
                              required
                              value={dob}
                              onChange={(e) => setDob(e.target.value)}
                              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent bg-background transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="gender"
                            className="block text-xs font-semibold text-foreground mb-2"
                          >
                            {t.genderLabel}{" "}
                            <span className="text-[#c9a961]">*</span>
                          </label>
                          <div className="relative">
                            <FaVenusMars className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none" />
                            <select
                              id="gender"
                              required
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-full h-11 pl-10 pr-3 rounded-xl border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent bg-background transition-all duration-200"
                            >
                              <option value="">{t.genderPlaceholder}</option>
                              <option value="male">{t.genderMale}</option>
                              <option value="female">{t.genderFemale}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </FormSection>

                    {/* Section 2: Guardian Details */}
                    <FormSection
                      icon={FaUser}
                      title={t.section2Title}
                      step={2}
                      index={1}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label
                            htmlFor="guardianName"
                            className="block text-xs font-semibold text-foreground mb-2"
                          >
                            {t.guardianNameLabel}{" "}
                            <span className="text-[#c9a961]">*</span>
                          </label>
                          <Input
                            id="guardianName"
                            placeholder={t.guardianNamePlaceholder}
                            required
                            value={guardianName}
                            onChange={(e) => setGuardianName(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent transition-all duration-200"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-xs font-semibold text-foreground mb-2"
                          >
                            {t.phoneLabel}{" "}
                            <span className="text-[#c9a961]">*</span>
                          </label>
                          <div className="relative group">
                            <FaPhoneAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs transition-colors group-focus-within:text-[#c9a961]" />
                            <Input
                              id="phone"
                              placeholder="017XXXXXXXX"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label
                            htmlFor="email"
                            className="block text-xs font-semibold text-foreground mb-2"
                          >
                            {t.emailLabel}
                          </label>
                          <div className="relative group">
                            <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs transition-colors group-focus-within:text-[#c9a961]" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="guardian@gmail.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    </FormSection>

                    {/* Section 3: File Uploads */}
                    <FormSection
                      icon={FaFileUpload}
                      title={t.section3Title}
                      step={3}
                      index={2}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <UploadZone
                          title={t.photoTitle}
                          subtitle={t.photoSubtitle}
                          fileSelectedText={t.fileSelected}
                          accept="image/*"
                          icon={FaFileUpload}
                          onChange={(file) => setStudentPhoto(file)}
                        />
                        <UploadZone
                          title={t.certTitle}
                          subtitle={t.certSubtitle}
                          fileSelectedText={t.fileSelected}
                          accept=".pdf,image/*"
                          icon={FaFileUpload}
                          onChange={(file) => setBirthCertificate(file)}
                        />
                      </div>
                    </FormSection>

                    {/* Submit Action */}
                    <motion.div
                      initial={
                        reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { delay: 0.3, duration: 0.5 }
                      }
                      className="pt-2"
                    >
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground hover:opacity-90 h-12 rounded-xl text-sm font-semibold shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin text-sm" />
                            {t.submittingBtn}
                          </>
                        ) : (
                          t.submitBtn
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
