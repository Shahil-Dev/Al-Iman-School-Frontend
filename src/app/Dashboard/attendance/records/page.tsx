"use client";

import React, { useEffect, useState } from "react";
import { FaCalendarCheck, FaSearch } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function AttendanceRecordsPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Fetch Classes on Mount
  useEffect(() => {
    axiosInstance
      .get("/academic/classes")
      .then((res) => setClasses(res.data?.data || []))
      .catch((err) => console.error("Failed to load classes", err));
  }, []);

  // 2. Fetch Sections when Class Changes
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
        if (secList.length > 0) {
          setSelectedSectionId(secList[0].id);
        }
      })
      .catch(() => setSections([]));
  }, [selectedClassId]);

  // 3. Fetch Attendance Records from correct backend endpoint /attendances
  const handleFetchAttendance = async () => {
    if (!selectedClassId || !selectedSectionId) {
      setErrorMsg(
        isBn
          ? "অনুগ্রহ করে শ্রেণি এবং সেকশন সিলেক্ট করুন।"
          : "Please select both Class and Section."
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      // Calling correct route /attendances with query params
      const res = await axiosInstance.get(
        `/attendances?classId=${selectedClassId}&sectionId=${selectedSectionId}&date=${selectedDate}`
      );

      setAttendances(res.data?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch attendance records", err);
      setErrorMsg(
        err.response?.data?.message ||
          (isBn
            ? "উপস্থিতি রেকর্ডস লোড করতে ব্যর্থ হয়েছে।"
            : "Failed to fetch attendance records.")
      );
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <FaCalendarCheck className="text-primary" />
          <span>{isBn ? "দৈনিক উপস্থিতি রেকর্ডস" : "Daily Attendance Records"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "শিক্ষার্থীদের ক্লাসভিত্তিক ও সেকশনভিত্তিক দৈনিক উপস্থিতি রিপোর্ট দেখুন।"
            : "View class and section-wise daily attendance logs."}
        </p>
      </div>

      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

            <div>
              <label className="text-xs font-semibold block mb-1.5">
                {isBn ? "তারিখ (Date)" : "Select Date"}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFetchAttendance}
                disabled={loading}
                className="w-full py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <FaSearch />
                <span>
                  {loading
                    ? isBn
                      ? "লোডিং..."
                      : "Loading..."
                    : isBn
                    ? "উপস্থিতি খুঁজুন"
                    : "Filter Attendance"}
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
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3">Student ID</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {attendances.length > 0 ? (
                  attendances.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {item.student?.rollNo || "N/A"}
                      </td>
                      <td className="py-3 px-3 font-mono text-muted-foreground">
                        {item.student?.studentIdNo || "N/A"}
                      </td>
                      <td className="py-3 px-3 font-semibold text-foreground">
                        {item.student?.firstName} {item.student?.lastName}
                      </td>
                      <td className="py-3 px-3">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "PRESENT"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : item.status === "ABSENT"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-muted-foreground"
                    >
                      {isBn
                        ? "কোনো উপস্থিতি রেকর্ড পাওয়া যায়নি।"
                        : "No attendance logs found for this filter."}
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