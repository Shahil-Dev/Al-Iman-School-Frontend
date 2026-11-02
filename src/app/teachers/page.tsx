"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FaChalkboardTeacher,
  FaSpinner,
  FaUser,
  FaCrown,
  FaEnvelope,
  FaPhoneAlt,
  FaGraduationCap,
  FaBookOpen,
} from "react-icons/fa";
import { motion } from "framer-motion";
import axiosInstance from "@/src/lib/axiosInstance";
import { Card, CardContent } from "@/src/components/ui/card";
import { useLanguage } from "@/src/context/LanguageContext";

type Teacher = {
  id: string;
  name: string;
  designation: string;
  department?: string | null;
  qualification?: string | null;
  phone: string;
  photoUrl?: string | null;
  classTeacherOf?: { id: string; name: string } | null;
  user: {
    email: string;
  };
};

const initialOf = (name?: string) =>
  (Array.from((name || "").trim())[0] || "T").toUpperCase();

export default function PublicTeachersPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      // ?t=${Date.now()} ব্রাউজার এবং Next.js ক্যাশ বাইপাস করে
      const res = await axiosInstance.get(`/teachers?t=${Date.now()}`);
      
      setTeachers(res.data?.data || []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          (isBn
            ? "শিক্ষকদের তালিকা লোড করা যায়নি।"
            : "Failed to load teachers list."),
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [isBn]);

  // Initial Fetch
  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Auto-refresh when user comes back to the tab
  useEffect(() => {
    const handleFocus = () => {
      fetchTeachers(false); // Silent refresh
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchTeachers]);

  // Identify Head Teacher / Principal
  const isHeadOrPrincipal = (designation: string) => {
    const d = (designation || "").toLowerCase();
    return (
      d.includes("principal") ||
      d.includes("head") ||
      d.includes("অধ্যক্ষ") ||
      d.includes("প্রধান")
    );
  };

  const headTeachers = teachers.filter((t) => isHeadOrPrincipal(t.designation));
  const otherTeachers = teachers
    .filter((t) => !isHeadOrPrincipal(t.designation))
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  return (
    <div className="min-h-screen bg-muted/20 pt-28 pb-16 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold tracking-wider uppercase">
            {isBn ? "আমাদের শিক্ষকমণ্ডলী" : "Our Faculty"}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-3">
            <FaChalkboardTeacher className="text-[#c9a961]" />
            {isBn ? "শিক্ষক ও কর্মচারী" : "Teachers & Staff"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isBn
              ? "আল-ঈমান স্কুল এন্ড কলেজের অভিজ্ঞ, দক্ষ এবং নিবেদিতপ্রাণ শিক্ষকমণ্ডলীর সাথে পরিচিত হোন।"
              : "Meet the experienced, skilled, and dedicated faculty members of Al-Iman School & College."}
          </p>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <FaSpinner className="animate-spin text-3xl text-[#c9a961]" />
            <p className="text-sm text-muted-foreground">
              {isBn ? "শিক্ষকদের তথ্য লোড হচ্ছে..." : "Loading teachers..."}
            </p>
          </div>
        ) : error ? (
          <Card className="border-destructive/20 bg-destructive/10 p-6 text-center text-sm text-destructive rounded-2xl max-w-lg mx-auto">
            {error}
          </Card>
        ) : teachers.length === 0 ? (
          <Card className="border-border bg-card/50 shadow-sm rounded-2xl p-12 text-center max-w-lg mx-auto">
            <FaUser className="mx-auto text-5xl text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-bold text-foreground">
              {isBn ? "কোনো শিক্ষক পাওয়া যায়নি" : "No teachers found"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isBn
                ? "বর্তমানে কোনো শিক্ষকের তথ্য যুক্ত করা নেই।"
                : "No teachers data available right now."}
            </p>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* HEAD TEACHER / PRINCIPAL ROW */}
            {headTeachers.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <FaCrown className="text-[#c9a961] text-lg" />
                  <h2 className="text-base font-bold text-foreground uppercase tracking-wider">
                    {isBn
                      ? "প্রধান শিক্ষক / অধ্যক্ষ"
                      : "Principal / Head Teacher"}
                  </h2>
                </div>

                {headTeachers.map((teacher) => (
                  <motion.div
                    key={teacher.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="border-[#c9a961] bg-gradient-to-r from-[#c9a961]/10 to-transparent shadow-md rounded-2xl overflow-hidden ring-1 ring-[#c9a961]/30">
                      <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
                        {/* Large Avatar */}
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shrink-0 border-4 border-[#c9a961] bg-muted flex items-center justify-center text-[#c9a961] font-bold text-5xl shadow-lg">
                          {teacher.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={teacher.photoUrl}
                              alt={teacher.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initialOf(teacher.name)
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 text-center sm:text-left space-y-4 w-full">
                          <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                              {teacher.name}
                            </h3>
                            <p className="text-base font-semibold text-[#c9a961] mt-1">
                              {teacher.designation}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground max-w-lg mx-auto sm:mx-0">
                            {teacher.department && (
                              <span className="flex items-center justify-center sm:justify-start gap-2">
                                <FaBookOpen className="text-[#c9a961]" />{" "}
                                {teacher.department}
                              </span>
                            )}
                            {teacher.qualification && (
                              <span className="flex items-center justify-center sm:justify-start gap-2">
                                <FaGraduationCap className="text-[#c9a961]" />{" "}
                                {teacher.qualification}
                              </span>
                            )}
                            <span className="flex items-center justify-center sm:justify-start gap-2">
                              <FaPhoneAlt className="text-[#c9a961]" />{" "}
                              {teacher.phone}
                            </span>
                            <span className="flex items-center justify-center sm:justify-start gap-2">
                              <FaEnvelope className="text-[#c9a961]" />{" "}
                              {teacher.user?.email}
                            </span>
                          </div>

                          {teacher.classTeacherOf && (
                            <div className="inline-block bg-[#c9a961]/10 px-4 py-1.5 rounded-lg text-xs font-semibold text-[#c9a961] border border-[#c9a961]/20 mt-2">
                              {isBn ? "ক্লাস টিচার:" : "Class Teacher:"}{" "}
                              {teacher.classTeacherOf.name}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* OTHER TEACHERS GRID (3 Columns) */}
            {otherTeachers.length > 0 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <FaUser className="text-[#c9a961] text-lg" />
                  <h2 className="text-base font-bold text-foreground uppercase tracking-wider">
                    {isBn ? "সহকারী শিক্ষকমণ্ডলী" : "Assistant Teachers"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherTeachers.map((teacher) => (
                    <motion.div
                      key={teacher.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="border-border shadow-sm hover:shadow-md hover:border-[#c9a961]/40 transition-all rounded-2xl bg-card overflow-hidden h-full flex flex-col">
                        <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-5">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <div className="w-16 h-16 rounded-xl bg-muted overflow-hidden shrink-0 border border-border flex items-center justify-center text-[#c9a961] font-bold text-xl select-none">
                              {teacher.photoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={teacher.photoUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                initialOf(teacher.name)
                              )}
                            </div>
                            <div className="overflow-hidden">
                              <h3 className="text-base font-bold text-foreground truncate">
                                {teacher.name}
                              </h3>
                              <p className="text-sm text-[#c9a961] font-semibold truncate mt-0.5">
                                {teacher.designation}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-border text-sm">
                            <span className="text-muted-foreground block text-[11px] uppercase font-semibold">
                              {isBn ? "ক্লাস টিচার" : "Class Teacher"}
                            </span>
                            <span className="font-semibold text-foreground flex items-center gap-1.5 mt-1">
                              <FaChalkboardTeacher className="text-[#c9a961] shrink-0" />
                              {teacher.classTeacherOf?.name ||
                                (isBn ? "নেই" : "None")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}