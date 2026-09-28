"use client";

import React, { useEffect, useState } from "react";
import { FaChalkboard, FaUserGraduate } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function MyClassesPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/academic/classes")
      .then((res) => setClasses(res.data?.data || []))
      .catch((err) => console.error("Failed to fetch classes", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <FaChalkboard className="text-primary" />
          <span>{isBn ? "আমার ক্লাসসমূহ" : "Assigned Classes"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "আপনার নির্ধারিত ক্লাস ও সেকশনের তালিকা।"
            : "List of academic classes assigned to you."}
        </p>
      </div>

      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              {isBn ? "ক্লাস তথ্য লোড হচ্ছে..." : "Loading classes..."}
            </p>
          ) : classes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 rounded-xl bg-muted/40 border border-border space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-primary">
                      {cls.name}
                    </span>
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                      {cls.academicYear?.year || "Active"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span>
                      {isBn ? "সেকশন:" : "Sections:"}{" "}
                      {cls.sections?.map((s: any) => s.name).join(", ") || "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              {isBn ? "কোনো অ্যাসাইন করা ক্লাস পাওয়া যায়নি।" : "No assigned classes found."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}