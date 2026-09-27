"use client";

import React, { useEffect, useState } from "react";
import { FaBook, FaPlus, FaSync, FaChalkboardTeacher } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

interface IClass {
  id: string;
  name: string;
}

interface ISubject {
  id: string;
  name: string;
  code: string;
  fullMarks: number;
  hasMT: boolean;
  class?: IClass;
}

export default function SubjectManagementPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [classes, setClasses] = useState<IClass[]>([]);
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [fullMarks, setFullMarks] = useState<number>(100);
  const [hasMT, setHasMT] = useState<boolean>(true);
  const [classId, setClassId] = useState("");

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clsRes, subRes] = await Promise.all([
        axiosInstance.get("/academic/classes").catch(() => ({ data: { data: [] } })),
        axiosInstance.get("/subjects"),
      ]);
      setClasses(clsRes.data?.data || []);
      setSubjects(subRes.data?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch subjects", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !classId) {
      setMsg({ type: "error", text: isBn ? "সকল প্রয়োজনীয় তথ্য প্রদান করুন।" : "Please fill in all required fields." });
      return;
    }

    try {
      setSubmitting(true);
      setMsg(null);
      await axiosInstance.post("/subjects", {
        name,
        code,
        fullMarks: Number(fullMarks),
        hasMT,
        classId,
      });

      setMsg({ type: "success", text: isBn ? "বিষয় সফলভাবে যোগ হয়েছে!" : "Subject added successfully!" });
      setName("");
      setCode("");
      fetchData();
    } catch (err: any) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || (isBn ? "বিষয় যোগ করতে সমস্যা হয়েছে।" : "Failed to add subject."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            {isBn ? "বিষয় ব্যবস্থাপনা (Subjects)" : "Subject Management"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn ? "শ্রেণিভিত্তিক সকল বিষয় ও ফুল মার্কস সেটআপ করুন।" : "Setup class subjects and full marks."}
          </p>
        </div>

        <button
          onClick={fetchData}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all flex items-center gap-2 shadow-sm"
        >
          <FaSync className={`text-xs ${loading ? "animate-spin text-primary" : ""}`} />
          <span>{isBn ? "রিফ্রেশ" : "Refresh"}</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold border ${
            msg.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Create Form */}
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <FaPlus className="text-primary text-xs" />
              <span>{isBn ? "নতুন বিষয় যোগ করুন" : "Add Subject"}</span>
            </h3>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {isBn ? "শ্রেণি (Class)" : "Class"}
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                >
                  <option value="">{isBn ? "-- শ্রেণি সিলেক্ট করুন --" : "-- Select Class --"}</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {isBn ? "বিষয়টির নাম" : "Subject Name"}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? "যেমন: English 1st Paper" : "e.g., Mathematics"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  {isBn ? "বিষয় কোড" : "Subject Code"}
                </label>
                <input
                  type="text"
                  placeholder={isBn ? "যেমন: 101" : "e.g., 101"}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {isBn ? "ফুল মার্কস" : "Full Marks"}
                  </label>
                  <input
                    type="number"
                    value={fullMarks}
                    onChange={(e) => setFullMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {isBn ? "মডেল টেস্ট (MT) আছে?" : "Has Model Test?"}
                  </label>
                  <select
                    value={hasMT ? "true" : "false"}
                    onChange={(e) => setHasMT(e.target.value === "true")}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  >
                    <option value="true">{isBn ? "হ্যাঁ (Yes)" : "Yes"}</option>
                    <option value="false">{isBn ? "না (No)" : "No"}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
              >
                {submitting ? (isBn ? "সেভ হচ্ছে..." : "Saving...") : isBn ? "বিষয় সেভ করুন" : "Save Subject"}
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Subjects List */}
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <FaBook className="text-primary text-xs" />
              <span>{isBn ? "বিষয়সমূহের তালিকা" : "All Subjects"}</span>
            </h3>

            {loading ? (
              <p className="text-xs text-muted-foreground py-4">{isBn ? "লোড হচ্ছে..." : "Loading subjects..."}</p>
            ) : subjects.length > 0 ? (
              <div className="space-y-3">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs"
                  >
                    <div>
                      <p className="font-bold text-foreground">
                        {sub.name} <span className="text-muted-foreground font-normal">({sub.code})</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Class: {sub.class?.name || "N/A"} | Full Marks: {sub.fullMarks}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">
                      MT: {sub.hasMT ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4">
                {isBn ? "কোনো বিষয় যুক্ত করা হয়নি।" : "No subjects found."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}