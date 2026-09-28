"use client";

import React, { useEffect, useState } from "react";
import {
  FaUserTie,
  FaEnvelope,
  FaPhone,
  FaBookReader,
  FaSpinner,
  FaSearch,
  FaGraduationCap,
  FaCalendarAlt,
  FaInfoCircle,
  FaTint,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function TeachersPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/teachers")
      .then((res) => {
        const loaded = res.data?.data || res.data || [];
        setTeachers(Array.isArray(loaded) ? loaded : []);
      })
      .catch((err) => console.error("Failed to load teachers", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredTeachers = teachers.filter((t) =>
    `${t.firstName || ""} ${t.lastName || ""} ${t.name || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    t.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.qualification?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <span>{isBn ? "শ্রদ্ধেয় শিক্ষকবৃন্দ" : "Our Honorable Teachers"}</span>
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/90 max-w-2xl">
              {isBn
                ? "অভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষকবৃন্দের তত্ত্বাবধানে আল-ঈমান স্কুলের শিক্ষার্থীরা গড়ে উঠছে।"
                : "Meet our qualified and dedicated educators guiding the students of Al-Iman School."}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
            <input
              type="text"
              placeholder={isBn ? "নাম, পদবী বা বিষয় দিয়ে খুঁজুন..." : "Search by name, designation or subject..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            {isBn ? `মোট শিক্ষক: ${filteredTeachers.length}` : `Total Faculty: ${filteredTeachers.length}`}
          </span>
        </div>

        {/* Teachers Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <FaSpinner className="animate-spin text-emerald-600 text-lg" />
            <span>{isBn ? "শিক্ষকদের তালিকা লোড হচ্ছে..." : "Loading faculty list..."}</span>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <Card className="border-border shadow-sm rounded-2xl p-8 text-center text-muted-foreground text-xs">
            {isBn ? "কোনো শিক্ষকের তথ্য পাওয়া যায়নি।" : "No faculty members found."}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTeachers.map((teacher, idx) => {
              const fullName =
                teacher.name || `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || "Teacher";
              return (
                <Card
                  key={teacher.id || idx}
                  className="border-border/60 hover:border-primary/50 shadow-sm hover:shadow-md transition-all rounded-2xl bg-card overflow-hidden text-center flex flex-col justify-between group"
                >
                  <CardContent className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Avatar */}
                      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shadow-inner border-2 border-emerald-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                        {teacher.profileImg ? (
                          <img
                            src={teacher.profileImg}
                            alt={fullName}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          fullName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-foreground">{fullName}</h3>
                        <p className="text-[11px] font-semibold text-emerald-600">
                          {teacher.designation || (isBn ? "সহকারী শিক্ষক" : "Assistant Teacher")}
                        </p>
                      </div>

                      {teacher.subject && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-foreground text-[10px] font-semibold">
                          <FaBookReader className="text-emerald-600" />
                          <span>{teacher.subject}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border/40 space-y-2">
                      <button
                        onClick={() => setSelectedTeacher(teacher)}
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <FaInfoCircle />
                        <span>{isBn ? "বিস্তারিত প্রোফাইল" : "View Details"}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Teacher Details Modal */}
        {selectedTeacher && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 relative">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedTeacher(null)}
                className="absolute right-5 top-5 text-muted-foreground hover:text-foreground text-lg font-bold w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center"
              >
                ✕
              </button>

              {/* Profile Header */}
              <div className="text-center space-y-2 pt-2">
                <div className="w-24 h-24 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl border-4 border-emerald-500/20 overflow-hidden shadow-md">
                  {selectedTeacher.profileImg ? (
                    <img
                      src={selectedTeacher.profileImg}
                      alt={selectedTeacher.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (selectedTeacher.name || selectedTeacher.firstName || "T").charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    {selectedTeacher.name || `${selectedTeacher.firstName || ""} ${selectedTeacher.lastName || ""}`.trim()}
                  </h2>
                  <p className="text-xs font-semibold text-emerald-600">
                    {selectedTeacher.designation || (isBn ? "সহকারী শিক্ষক" : "Assistant Teacher")}
                  </p>
                </div>
              </div>

              {/* Detail Info Grid */}
              <div className="bg-muted/40 p-4 rounded-2xl border border-border/60 space-y-2.5 text-xs">
                
                {/* Subject */}
                <div className="flex items-center gap-2 text-foreground">
                  <FaBookReader className="text-emerald-600 w-4" />
                  <span className="font-semibold">{isBn ? "বিষয়:" : "Subject:"}</span>
                  <span className="text-muted-foreground">{selectedTeacher.subject || "N/A"}</span>
                </div>

                {/* Qualification */}
                <div className="flex items-center gap-2 text-foreground">
                  <FaGraduationCap className="text-emerald-600 w-4" />
                  <span className="font-semibold">{isBn ? "যোগ্যতা:" : "Qualification:"}</span>
                  <span className="text-muted-foreground">{selectedTeacher.qualification || selectedTeacher.degree || (isBn ? "বি.এ / বি.এস.সি" : "B.A / B.Sc")}</span>
                </div>

                {/* Phone */}
                {selectedTeacher.contactNo && (
                  <div className="flex items-center gap-2 text-foreground font-mono">
                    <FaPhone className="text-emerald-600 w-4" />
                    <span className="font-semibold">{isBn ? "মোবাইল:" : "Contact:"}</span>
                    <span className="text-muted-foreground">{selectedTeacher.contactNo}</span>
                  </div>
                )}

                {/* Email */}
                {selectedTeacher.email && (
                  <div className="flex items-center gap-2 text-foreground font-mono truncate">
                    <FaEnvelope className="text-emerald-600 w-4 shrink-0" />
                    <span className="font-semibold shrink-0">{isBn ? "ইমেইল:" : "Email:"}</span>
                    <span className="text-muted-foreground truncate">{selectedTeacher.email}</span>
                  </div>
                )}

                {/* Blood Group */}
                {selectedTeacher.bloodGroup && (
                  <div className="flex items-center gap-2 text-foreground">
                    <FaTint className="text-destructive w-4" />
                    <span className="font-semibold">{isBn ? "রক্তের গ্রুপ:" : "Blood Group:"}</span>
                    <span className="text-muted-foreground font-bold font-mono">{selectedTeacher.bloodGroup}</span>
                  </div>
                )}

                {/* Joining Date */}
                {selectedTeacher.joiningDate && (
                  <div className="flex items-center gap-2 text-foreground">
                    <FaCalendarAlt className="text-emerald-600 w-4" />
                    <span className="font-semibold">{isBn ? "যোগদানের তারিখ:" : "Joining Date:"}</span>
                    <span className="text-muted-foreground font-mono">
                      {new Date(selectedTeacher.joiningDate).toLocaleDateString(isBn ? "bn-BD" : "en-US")}
                    </span>
                  </div>
                )}
              </div>

              {/* Bio / Description */}
              {selectedTeacher.bio && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">{isBn ? "সংক্ষিপ্ত পরিচিতি:" : "About:"}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-xl border border-border/40">
                    {selectedTeacher.bio}
                  </p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition-all shadow-sm"
                >
                  {isBn ? "বন্ধ করুন" : "Close"}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}