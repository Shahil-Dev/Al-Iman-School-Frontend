"use client";

import React, { useEffect, useState } from "react";
import {
  FaClock,
  FaSpinner,
  FaCalendarAlt,
  FaBookOpen,
  FaUserTie,
  FaDoorOpen,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";

const DAYS_OF_WEEK = [
  { key: "SATURDAY", bn: "শনিবার", en: "Saturday" },
  { key: "SUNDAY", bn: "রবিবার", en: "Sunday" },
  { key: "MONDAY", bn: "সোমবার", en: "Monday" },
  { key: "TUESDAY", bn: "মঙ্গলবার", en: "Tuesday" },
  { key: "WEDNESDAY", bn: "বুধবার", en: "Wednesday" },
  { key: "THURSDAY", bn: "বৃহস্পতিবার", en: "Thursday" },
];

export default function StudentRoutinePage() {
  const { language } = useLanguage();
  const { user } = useUser();
  const isBn = language === "bn";

  const [student, setStudent] = useState<any | null>(null);
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("SATURDAY");

  // Load Student Profile to get classId & sectionId
  useEffect(() => {
    const fetchProfileAndRoutine = async () => {
      setLoading(true);
      try {
        const studentId = user?.studentId || user?.id;
        if (!studentId) return;

        // 1. Fetch Student Profile
        const res = await axiosInstance.get(`/students/${studentId}`);
        const profile = res.data?.data || res.data;
        setStudent(profile);

        // 2. Fetch Routine based on Class and Section
        if (profile?.classId && profile?.sectionId) {
          const routineRes = await axiosInstance.get(
            `/routines?classId=${profile.classId}&sectionId=${profile.sectionId}`
          );
          const routineData = routineRes.data?.data || routineRes.data || [];
          setRoutines(Array.isArray(routineData) ? routineData : []);
        }
      } catch (err) {
        console.error("Failed to load class routine", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndRoutine();
  }, [user]);

  // Filter routines for the selected day
  const filteredRoutines = routines.filter(
    (item) => item.day?.toUpperCase() === selectedDay.toUpperCase()
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
            {isBn ? "ক্লাস রুটিন" : "Class Routine"}
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
            <FaClock className="text-primary text-lg" />
            <span>{isBn ? "আমার ক্লাস সময়সূচী" : "My Weekly Schedule"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {student?.class
              ? `${isBn ? "শ্রেণি:" : "Class:"} ${student.class?.name || "N/A"} (${student.section?.name || "N/A"})`
              : isBn
              ? "তোমার শ্রেণির দৈনিক ক্লাসের সময়সূচী ও বিষয়সমূহ দেখো।"
              : "View your daily class periods, subjects, and teachers."}
          </p>
        </div>
      </div>

      {/* Days Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 bg-card p-2 rounded-2xl border border-border/60 shadow-sm">
        {DAYS_OF_WEEK.map((day) => {
          const isActive = selectedDay === day.key;
          return (
            <button
              key={day.key}
              onClick={() => setSelectedDay(day.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {isBn ? day.bn : day.en}
            </button>
          );
        })}
      </div>

      {/* Routine Content Render */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-primary text-lg" />
          <span>{isBn ? "রুটিন লোড হচ্ছে..." : "Loading class routine..."}</span>
        </div>
      ) : filteredRoutines.length === 0 ? (
        <Card className="p-12 text-center rounded-2xl border border-border bg-card">
          <CardContent className="space-y-2">
            <FaCalendarAlt className="mx-auto text-3xl text-muted-foreground/40 mb-2" />
            <p className="text-xs font-medium text-muted-foreground">
              {isBn
                ? "এই বারে কোনো ক্লাস নির্ধারিত নেই।"
                : "No class scheduled for this day."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoutines.map((routine: any, index: number) => (
            <Card
              key={routine.id || index}
              className="border-border/60 shadow-sm rounded-2xl bg-card hover:border-primary/40 transition-all overflow-hidden"
            >
              <CardContent className="p-5 space-y-3">
                {/* Time Badge */}
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <FaClock className="text-[10px]" />
                    <span>
                      {routine.startTime} - {routine.endTime}
                    </span>
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                    #{index + 1} Period
                  </span>
                </div>

                {/* Subject Name */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <FaBookOpen className="text-primary shrink-0" />
                    <span>{routine.subject?.name || "Subject N/A"}</span>
                  </h3>
                  {routine.subject?.code && (
                    <p className="text-[10px] font-mono text-muted-foreground">
                      Code: {routine.subject.code}
                    </p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FaUserTie className="text-primary/70 shrink-0" />
                    <span className="truncate">
                      {routine.teacher
                        ? `${routine.teacher.firstName || ""} ${routine.teacher.lastName || ""}`
                        : "Teacher N/A"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FaDoorOpen className="text-primary/70 shrink-0" />
                    <span className="truncate">
                      {routine.roomNo
                        ? `${isBn ? "রুম" : "Room"}: ${routine.roomNo}`
                        : "Room N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}