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
import { submitAdmission } from "@/src/services/admissionApi";

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
        <div className="flex items-center gap-3 pb-3 border-b border-[#1a2b3c]/10">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#1a2b3c] text-white text-xs font-bold">
            {step}
            <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-[#C9A961] flex items-center justify-center">
              <Icon size={6} className="text-white" />
            </span>
          </div>
          <h3 className="text-base font-semibold text-[#1a2b3c] flex items-center gap-2">
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
    accept,
    icon: Icon,
    onChange,
  }: {
    title: string;
    subtitle: string;
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
            ? "border-[#C9A961] bg-[#C9A961]/5"
            : "border-[#1a2b3c]/20 hover:border-[#C9A961]/60 bg-[#f8f9fa]"
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
              isDragOver ? "text-[#C9A961]" : "text-[#8a9baa]"
            }`}
          />
          <span className="block text-xs font-semibold text-[#1a2b3c]">
            {fileName || title}
          </span>
          <span className="text-[10px] text-[#8a9baa] block mt-1">
            {fileName ? "File selected" : subtitle}
          </span>
        </label>
      </motion.div>
    );
  },
);

UploadZone.displayName = "UploadZone";

export default function AdmissionPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [applicationId, setApplicationId] = useState<string>("#ADM-2026-8942");
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
        // Create FormData to support both text fields and file uploads
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
          err.message || "Something went wrong. Please try again.",
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
    ],
  );

  const handleReset = useCallback(() => {
    setIsSubmitted(false);
    setErrorMessage(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f6f8] via-[#eef1f4] to-[#e8ecef] flex flex-col font-sans relative">
      <div
        className="absolute inset-0 opacity-[0.01] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(26,43,60,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(26,43,60,0.1) 1px, transparent 1px)`,
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
              <Card className="border-[#4a7c5c]/20 bg-white shadow-[0_8px_30px_-8px_rgba(26,43,60,0.15)] text-center py-14 px-6 rounded-2xl">
                <CardContent className="space-y-6">
                  <motion.div
                    initial={reduceMotion ? { scale: 1 } : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { delay: 0.2, type: "spring", ...springConfig }
                    }
                    className="w-20 h-20 bg-[#4a7c5c]/10 text-[#4a7c5c] rounded-full flex items-center justify-center mx-auto text-4xl"
                  >
                    <FaCheckCircle />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-[#1a2b3c]">
                    Application Submitted!
                  </h2>
                  <p className="text-[#5a6b7a] max-w-md mx-auto leading-relaxed">
                    Thank you for applying. Your Application ID is{" "}
                    <span className="font-semibold text-[#C9A961]">
                      {applicationId}
                    </span>
                    . Please save this for future tracking.
                  </p>
                  <Button
                    onClick={handleReset}
                    className="bg-[#1a2b3c] hover:bg-[#2c4356] text-white rounded-xl px-8 h-11 transition-all duration-200 hover:shadow-lg"
                  >
                    Submit Another Application
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
              <Card className="border-[#1a2b3c]/10 shadow-[0_8px_30px_-8px_rgba(26,43,60,0.12)] rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-gradient-to-r from-[#1a2b3c] to-[#2c4356] text-white p-8 md:p-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-white/10 rounded-xl">
                      <FaGraduationCap className="text-3xl text-[#C9A961]" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">
                        Online Student Admission
                      </CardTitle>
                      <CardDescription className="text-[#a0b0c0] text-sm mt-1.5">
                        Academic Year 2026-2027 · Please fill out the form
                        carefully
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 md:p-10">
                  {errorMessage && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Section 1: Academic & Personal Info */}
                    <FormSection
                      icon={FaUserGraduate}
                      title="Student Information"
                      step={1}
                      index={0}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label
                            htmlFor="studentName"
                            className="block text-xs font-semibold text-[#1a2b3c] mb-2"
                          >
                            Full Student Name{" "}
                            <span className="text-[#C9A961]">*</span>
                          </label>
                          <Input
                            id="studentName"
                            placeholder="e.g. Yemtehan Shahil"
                            required
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="rounded-xl border-[#1a2b3c]/15 bg-white text-sm text-[#1a2b3c] placeholder:text-[#a0b0c0] focus:ring-2 focus:ring-[#C9A961] focus:border-[#C9A961] transition-all duration-200 py-3"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="targetClass"
                            className="block text-xs font-semibold text-[#1a2b3c] mb-2"
                          >
                            Target Class{" "}
                            <span className="text-[#C9A961]">*</span>
                          </label>
                          <div className="relative">
                            <FaLayerGroup className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9baa] text-xs pointer-events-none" />
                            <select
                              id="targetClass"
                              required
                              value={targetClass}
                              onChange={(e) => setTargetClass(e.target.value)}
                              className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#1a2b3c]/15 text-[#1a2b3c] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A961] focus:border-[#C9A961] bg-white transition-all duration-200"
                            >
                              <option value="">Select Class</option>
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
                            className="block text-xs font-semibold text-[#1a2b3c] mb-2"
                          >
                            Date of Birth{" "}
                            <span className="text-[#C9A961]">*</span>
                          </label>
                          <div className="relative">
                            <FaCalendarAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9baa] text-xs pointer-events-none" />
                            <Input
                              id="dob"
                              type="date"
                              required
                              value={dob}
                              onChange={(e) => setDob(e.target.value)}
                              className="rounded-xl border-[#1a2b3c]/15 text-[#1a2b3c] pl-10 focus:ring-2 focus:ring-[#C9A961] focus:border-[#C9A961] transition-all duration-200"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="gender"
                            className="block text-xs font-semibold text-[#1a2b3c] mb-2"
                          >
                            Gender <span className="text-[#C9A961]">*</span>
                          </label>
                          <div className="relative">
                            <FaVenusMars className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9baa] text-xs pointer-events-none" />
                            <select
                              id="gender"
                              required
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#1a2b3c]/15 text-[#1a2b3c] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A961] focus:border-[#C9A961] bg-white transition-all duration-200"
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </FormSection>

                    {/* Section 2: Guardian Details */}
                    <FormSection
                      icon={FaUser}
                      title="Parent / Guardian Details"
                      step={2}
                      index={1}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label
                            htmlFor="guardianName"
                            className="block text-xs font-semibold text-[#1a2b3c] mb-2"
                          >
                            Guardian Name{" "}
                            <span className="text-[#C9A961]">*</span>
                          </label>
                          <Input
                            id="guardianName"
                            placeholder="Father's or Mother's Name"
                            required
                            value={guardianName}
                            onChange={(e) => setGuardianName(e.target.value)}
                            className="rounded-xl border-[#1a2b3c]/15 bg-white text-sm text-[#1a2b3c] placeholder:text-[#a0b0c0] focus:ring-2 focus:ring-[#C9A961] focus:border-[#C9A961] transition-all duration-200 py-3"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-xs font-semibold text-[#1a2b3c] mb-2"
                          >
                            Contact Phone Number{" "}
                            <span className="text-[#C9A961]">*</span>
                          </label>
                          <div className="relative group">
                            <FaPhoneAlt className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9baa] text-xs transition-colors group-focus-within:text-[#C9A961]" />
                            <Input
                              id="phone"
                              placeholder="017XXXXXXXX"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="rounded-xl border-[#1a2b3c]/15 pl-10 focus:ring-2 focus:ring-[#C9A961] focus:border-[#C9A961] transition-all duration-200 py-3"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label
                            htmlFor="email"
                            className="block text-xs font-semibold text-[#1a2b3c] mb-2"
                          >
                            Email Address
                          </label>
                          <div className="relative group">
                            <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9baa] text-xs transition-colors group-focus-within:text-[#C9A961]" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="guardian@gmail.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="rounded-xl border-[#1a2b3c]/15 pl-10 focus:ring-2 focus:ring-[#C9A961] focus:border-[#C9A961] transition-all duration-200 py-3"
                            />
                          </div>
                        </div>
                      </div>
                    </FormSection>

                    {/* Section 3: File Uploads */}
                    <FormSection
                      icon={FaFileUpload}
                      title="Required Documents Upload"
                      step={3}
                      index={2}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <UploadZone
                          title="Student Photo (Passport Size)"
                          subtitle="PNG, JPG up to 2MB"
                          accept="image/*"
                          icon={FaFileUpload}
                          onChange={(file) => setStudentPhoto(file)}
                        />
                        <UploadZone
                          title="Birth Certificate / PSC Transcript"
                          subtitle="PDF, JPG up to 5MB"
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
                        className="w-full bg-gradient-to-r from-[#1a2b3c] to-[#2c4356] hover:from-[#243747] hover:to-[#385268] text-white h-12 rounded-xl text-sm font-semibold shadow-[0_4px_16px_-4px_rgba(26,43,60,0.3)] transition-all duration-200 hover:shadow-[0_8px_24px_-6px_rgba(26,43,60,0.4)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin text-sm" />
                            Submitting Application...
                          </>
                        ) : (
                          "Submit Admission Form"
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
