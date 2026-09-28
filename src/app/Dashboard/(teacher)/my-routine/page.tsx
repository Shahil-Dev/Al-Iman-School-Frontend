"use client";

import React, { useEffect, useState } from "react";
import { FaClock, FaSearch } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function ClassRoutinePage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Fetch Classes on mount
  useEffect(() => {
    axiosInstance
      .get("/academic/classes")
      .then((res) => setClasses(res.data?.data || []))
      .catch((err) => console.error("Failed to load classes", err));
  }, []);

  // 2. Fetch Sections when Class changes
  useEffect(() => {
    if (!selectedClassId) {
      setSections([]);
      setSelectedSectionId("");
      return;
    }
    axiosInstance
      .get(`/academic/sections?classId=${selectedClassId}`)
      .then((res) => {
        const secList = res.data?.data || [];
        setSections(secList);
        if (secList.length > 0) setSelectedSectionId(secList[0].id);
      })
      .catch(() => setSections([]));
  }, [selectedClassId]);

  // 3. Fetch Routines with Path Parameters /routines/:classId/:sectionId
  const handleFetchRoutines = async () => {
    if (!selectedClassId || !selectedSectionId) {
      setErrorMsg(
        isBn
          ? "অনুগ্রহ করে শ্রেণি এবং সেকশন উভয়ই সিলেক্ট করুন।"
          : "Please select both Class and Section."
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      // Calling correct route: /routines/:classId/:sectionId
      const res = await axiosInstance.get(
        `/routines/${selectedClassId}/${selectedSectionId}`
      );
      setRoutines(res.data?.data || []);
    } catch (err: any) {
      console.warn("Failed to fetch routines:", err);
      setRoutines([]);
      setErrorMsg(
        err.response?.data?.message ||
          (isBn
            ? "রুটিনের ডাটা পাওয়া যায়নি বা কোনো রুটিন সেটআপ করা নেই।"
            : "No routine data found for this class & section.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <FaClock className="text-primary" />
          <span>{isBn ? "ক্লাস রুটিন সময়সূচি" : "Academic Class Routines"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "শ্রেণি ও সেকশন সিলেক্ট করে ক্লাসের সময়সূচি ও বিষয় বিবরণী দেখুন।"
            : "Select class and section to view scheduled time-slots and subjects."}
        </p>
      </div>

      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-xs font-semibold block mb-1.5">
                {isBn ? "শ্রেণি (Class)" : "Select Class"}
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">
                  {isBn ? "-- শ্রেণি সিলেক্ট করুন --" : "-- Select Class --"}
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5">
                {isBn ? "সেকশন (Section)" : "Select Section"}
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">
                  {isBn ? "-- সেকশন সিলেক্ট করুন --" : "-- Select Section --"}
                </option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFetchRoutines}
                disabled={loading || !selectedClassId || !selectedSectionId}
                className="w-full py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <FaSearch />
                <span>
                  {loading
                    ? isBn
                      ? "লোডিং..."
                      : "Loading..."
                    : isBn
                    ? "রুটিন খুঁজুন"
                    : "Search Routine"}
                </span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
              {errorMsg}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px]">
                  <th className="py-3 px-3">Day</th>
                  <th className="py-3 px-3">Time Slot</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Subject Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {routines.length > 0 ? (
                  routines.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-muted/30">
                      <td className="py-3 px-3 font-bold text-foreground uppercase">
                        {item.day || "Sunday"}
                      </td>
                      <td className="py-3 px-3 font-mono text-primary font-semibold">
                        {item.startTime || "09:00 AM"} - {item.endTime || "09:45 AM"}
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {item.subject?.name || "N/A"}
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {item.subject?.code || "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-muted-foreground"
                    >
                      {isBn
                        ? "কোনো ক্লাস রুটিন পাওয়া যায়নি।"
                        : "No class routines found for selected criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}