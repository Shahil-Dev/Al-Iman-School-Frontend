"use client";

import React from "react";
import { FaSpinner } from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";
import RoutineManager from "@/src/components/ui/RoutineManager";

export default function TeacherRoutinePage() {
  const { language } = useLanguage();
  const { user, loading } = useUser();
  const isBn = language === "bn";

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 p-12 text-xs text-muted-foreground">
        <FaSpinner className="animate-spin text-lg text-primary" />
        <span>{isBn ? "লোড হচ্ছে..." : "Loading..."}</span>
      </div>
    );
  }

  // Teachers and the super admin can create, edit and delete periods
  const canEdit = user?.role === "TEACHER" || user?.role === "SUPER_ADMIN";

  return <RoutineManager canEdit={canEdit} />;
}