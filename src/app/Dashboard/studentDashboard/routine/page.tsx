"use client";

import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { Card } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";
import RoutineTable, { RoutineItem } from "@/src/components/ui/RoutineTable";


export default function StudentRoutinePage() {
  const { language } = useLanguage();
  const { user, loading: userLoading } = useUser();
  const isBn = language === "bn";

  const profile = user?.studentProfile;
  const classId: string | undefined = profile?.classId;
  const sectionId: string | undefined = profile?.sectionId;

  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userLoading) return;

    if (!classId || !sectionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    axiosInstance
      .get("/routines", { params: { classId, sectionId } })
      .then((res) => {
        if (cancelled) return;
        const list = res.data?.data;
        setRoutines(Array.isArray(list) ? list : []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setRoutines([]);
        setError(
          err?.response?.data?.message ||
            (isBn ? "রুটিন লোড করা যায়নি।" : "Could not load the routine."),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userLoading, classId, sectionId, isBn]);

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-xs text-muted-foreground">
        <FaSpinner className="animate-spin text-lg text-primary" />
        <span>{isBn ? "রুটিন লোড হচ্ছে..." : "Loading class routine..."}</span>
      </div>
    );
  }

  if (!classId || !sectionId) {
    return (
      <Card className="rounded-2xl border border-border p-8 text-center text-xs text-muted-foreground">
        {isBn
          ? "আপনার শ্রেণি বা সেকশনের তথ্য পাওয়া যায়নি। অনুগ্রহ করে আবার লগইন করুন।"
          : "Your class or section could not be found. Please log in again."}
      </Card>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
          {error}
        </div>
      )}
      <RoutineTable
        routines={routines}
        isBn={isBn}
        className={profile?.class?.name}
        sectionName={profile?.section?.name}
      />
    </div>
  );
}