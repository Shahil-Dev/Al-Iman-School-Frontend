"use client";

import React, { useEffect, useState } from "react";
import { FaBullhorn, FaCalendarAlt, FaSearch, FaFileAlt, FaSpinner } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function NoticeBoardPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/notices")
      .then((res) => {
        const loaded = res.data?.data || res.data || [];
        setNotices(Array.isArray(loaded) ? loaded : []);
      })
      .catch((err) => console.error("Failed to load notices", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredNotices = notices.filter((n) =>
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              {isBn ? "অফিসিয়াল নোটিশ" : "Official Announcements"}
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold flex items-center gap-3">
              <FaBullhorn className="text-amber-400 animate-pulse" />
              <span>{isBn ? "স্কুল নোটিশ বোর্ড" : "Notice Board"}</span>
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/90 max-w-2xl">
              {isBn
                ? "আল-ঈমান স্কুলের যাবতীয় একাডেমিক খবর, পরীক্ষার সময়সূচি এবং জরুরি ঘোষণা। "
                : "Latest academic notices, exam schedules, and official news from Al-Iman School."}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
            <input
              type="text"
              placeholder={isBn ? "নোটিশ খুঁজুন..." : "Search notices..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            {isBn ? `মোট নোটিশ: ${filteredNotices.length}` : `Total Notices: ${filteredNotices.length}`}
          </span>
        </div>

        {/* Notices Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <FaSpinner className="animate-spin text-emerald-600 text-lg" />
            <span>{isBn ? "নোটিশ লোড হচ্ছে..." : "Loading notices..."}</span>
          </div>
        ) : filteredNotices.length === 0 ? (
          <Card className="border-border shadow-sm rounded-2xl p-8 text-center text-muted-foreground text-xs">
            {isBn ? "কোনো নোটিশ পাওয়া যায়নি।" : "No notices found."}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotices.map((item) => (
              <Card
                key={item.id}
                className="border-border/60 hover:border-primary/50 shadow-sm hover:shadow-md transition-all rounded-2xl bg-card overflow-hidden flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
                    <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1.5">
                      <FaCalendarAlt />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString(isBn ? "bn-BD" : "en-US") : "N/A"}
                    </span>
                    <span className="bg-primary/10 text-primary text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      {item.category || (isBn ? "সাধারণ" : "General")}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {item.description || item.content}
                  </p>

                  <button
                    onClick={() => setSelectedNotice(item)}
                    className="w-full py-2 bg-muted/60 hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <FaFileAlt />
                    <span>{isBn ? "বিস্তারিত বিবরণ" : "Read Full Notice"}</span>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Notice Details Modal */}
        {selectedNotice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-start border-b pb-3">
                <h2 className="text-base font-bold text-foreground pr-4">{selectedNotice.title}</h2>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="text-muted-foreground hover:text-foreground text-lg font-bold"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs font-mono text-emerald-600 flex items-center gap-1.5">
                <FaCalendarAlt />
                {new Date(selectedNotice.createdAt).toLocaleDateString(isBn ? "bn-BD" : "en-US")}
              </div>
              <div className="text-xs text-foreground/90 space-y-2 whitespace-pre-line max-h-60 overflow-y-auto pr-1">
                {selectedNotice.description || selectedNotice.content}
              </div>
              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl"
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