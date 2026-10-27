"use client";

import React, { useEffect, useState } from "react";
import {
  FaUserTie,
  FaSpinner,
  FaSearch,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

type PublicTeacher = {
  id: string;
  name: string;
  designation: string;
  classTeacherOf?: { id: string; name: string } | null;
};

export default function TeachersPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [teachers, setTeachers] = useState<PublicTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/teachers")
      .then((res) => {
        const loaded = res.data?.data || [];
        setTeachers(Array.isArray(loaded) ? loaded : []);
      })
      .catch((err) => console.error("Failed to load teachers", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return [teacher.name, teacher.designation, teacher.classTeacherOf?.name].some(
      (value) => value?.toLowerCase().includes(term),
    );
  });

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              {isBn ? "আমাদের শিক্ষকমণ্ডলী" : "Faculty Members"}
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold flex items-center gap-3">
              <FaUserTie className="text-amber-400" />
              <span>{isBn ? "শ্রদ্ধেয় শিক্ষকবৃন্দ" : "Our Honorable Teachers"}</span>
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/90 max-w-2xl">
              {isBn
                ? "অভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষকবৃন্দের তত্ত্বাবধানে আল-ঈমান স্কুলের শিক্ষার্থীরা গড়ে উঠছে।"
                : "Meet our qualified and dedicated educators guiding the students of Al-Iman School and College."}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
            <input
              type="text"
              placeholder={
                isBn
                  ? "নাম, পদবী বা শ্রেণি দিয়ে খুঁজুন..."
                  : "Search by name, designation or class..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            {isBn
              ? `মোট শিক্ষক: ${filteredTeachers.length}`
              : `Total Faculty: ${filteredTeachers.length}`}
          </span>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <FaSpinner className="animate-spin text-emerald-600 text-lg" />
            <span>
              {isBn ? "শিক্ষকদের তালিকা লোড হচ্ছে..." : "Loading faculty list..."}
            </span>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <Card className="border-border shadow-sm rounded-2xl p-8 text-center text-muted-foreground text-xs">
            {isBn ? "কোনো শিক্ষকের তথ্য পাওয়া যায়নি।" : "No faculty members found."}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTeachers.map((teacher) => {
              const initial = Array.from(teacher.name.trim())[0] || "T";

              return (
                <Card
                  key={teacher.id}
                  className="border-border/60 hover:border-primary/50 shadow-sm hover:shadow-md transition-all rounded-2xl bg-card overflow-hidden text-center group"
                >
                  <CardContent className="p-6 space-y-3">
                    <div
                      aria-hidden="true"
                      className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl shadow-inner border-2 border-emerald-500/20 group-hover:scale-105 transition-transform select-none"
                    >
                      {initial.toUpperCase()}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        {teacher.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                        {teacher.designation}
                      </p>
                    </div>

                    {teacher.classTeacherOf && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-foreground text-[10px] font-semibold">
                        <FaChalkboardTeacher className="text-emerald-600" />
                        <span>
                          {isBn ? "শ্রেণি শিক্ষক: " : "Class Teacher: "}
                          {teacher.classTeacherOf.name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}