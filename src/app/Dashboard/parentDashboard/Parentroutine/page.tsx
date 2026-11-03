"use client";

import React, { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { Card } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import RoutineTable, { RoutineItem } from "@/src/components/ui/RoutineTable";


export default function ParentRoutinePage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [loadingChildren, setLoadingChildren] = useState(true);

  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/parents/my-children")
      .then((res) => {
        const list = res.data?.data || res.data || [];
        const loaded = Array.isArray(list) ? list : [];
        setChildren(loaded);
        if (loaded.length > 0) setSelectedChildId(loaded[0].id);
      })
      .catch((err) => console.error("Failed to load children list", err))
      .finally(() => setLoadingChildren(false));
  }, []);

  const child = children.find((c) => c.id === selectedChildId);
  const classId: string | undefined = child?.classId;
  const sectionId: string | undefined = child?.sectionId;

  useEffect(() => {
    if (!classId || !sectionId) {
      setRoutines([]);
      return;
    }

    let cancelled = false;
    setLoadingRoutines(true);
    setError("");

    axiosInstance
      .get("/routines", { params: { classId, sectionId } })
      .then((res) => {
        if (cancelled) return;
        const list = res.data?.data;
        setRoutines(Array.isArray(list) ? list : []);
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
        if (!cancelled) setLoadingRoutines(false);
      });

    return () => {
      cancelled = true;
    };
  }, [classId, sectionId, isBn]);

  if (loadingChildren) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-xs text-muted-foreground">
        <FaSpinner className="animate-spin text-lg text-primary" />
        <span>{isBn ? "লোড হচ্ছে..." : "Loading..."}</span>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <Card className="rounded-2xl border border-border p-8 text-center text-xs text-muted-foreground">
        {isBn
          ? "কোনো সংযুক্ত সন্তানের প্রোফাইল পাওয়া যায়নি।"
          : "No linked student profile found."}
      </Card>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {children.length > 1 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <label
            htmlFor="routine-child"
            className="text-xs font-semibold text-foreground"
          >
            {isBn ? "সন্তান নির্বাচন করুন" : "Select Child"}
          </label>
          <select
            id="routine-child"
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstName} {c.lastName} ({c.class?.name || "N/A"})
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
          {error}
        </div>
      )}

      {loadingRoutines ? (
        <div className="flex items-center justify-center gap-2 p-12 text-xs text-muted-foreground">
          <FaSpinner className="animate-spin text-lg text-primary" />
          <span>{isBn ? "রুটিন লোড হচ্ছে..." : "Loading class routine..."}</span>
        </div>
      ) : (
        <RoutineTable
          routines={routines}
          isBn={isBn}
          className={child?.class?.name}
          sectionName={child?.section?.name}
        />
      )}
    </div>
  );
}