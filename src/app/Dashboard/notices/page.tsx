"use client";

import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaPlus,
  FaTrash,
  FaFileDownload,
  FaSync,
  FaUsers,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";

type NoticeTarget = "ALL" | "STUDENT" | "TEACHER" | "PARENT";

interface INotice {
  id: string;
  title: string;
  content: string;
  targetGroup: NoticeTarget;
  attachment?: string;
  publishedAt: string;
}

export default function NoticeManagementPage() {
  const { user } = useUser();
  const { language } = useLanguage();
  const isBn = language === "bn";

  // Check if current user is Admin or Accounts
  const isAdminOrAccounts =
    user?.role === "SUPER_ADMIN" || user?.role === "ACCOUNTS";

  const [notices, setNotices] = useState<INotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter State
  const [selectedTarget, setSelectedTarget] = useState<string>("");

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetGroup, setTargetGroup] = useState<NoticeTarget>("ALL");
  const [attachment, setAttachment] = useState("");

  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch Notices
  const fetchNotices = async () => {
    try {
      setLoading(true);
      const url = selectedTarget
        ? `/notices?targetGroup=${selectedTarget}`
        : "/notices";
      const response = await axiosInstance.get(url);
      setNotices(response.data?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedTarget]);

  // Create Notice
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      setMsg({
        type: "error",
        text: isBn
          ? "অনুগ্রহ করে শিরোনাম ও বিস্তারিত তথ্য প্রদান করুন।"
          : "Please provide both title and content.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMsg(null);

      const payload = {
        title,
        content,
        targetGroup,
        attachment: attachment.trim() ? attachment : undefined,
      };

      await axiosInstance.post("/notices", payload);

      setMsg({
        type: "success",
        text: isBn
          ? "নোটিশ সফলভাবে প্রকাশিত হয়েছে!"
          : "Notice published successfully!",
      });

      // Reset form
      setTitle("");
      setContent("");
      setTargetGroup("ALL");
      setAttachment("");

      fetchNotices();
    } catch (err: any) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          (isBn
            ? "নোটিশ প্রকাশ করতে সমস্যা হয়েছে।"
            : "Failed to publish notice."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Notice
  const handleDeleteNotice = async (id: string) => {
    if (
      !window.confirm(
        isBn
          ? "আপনি কি নিশ্চিত যে এই নোটিশটি মুছে ফেলতে চান?"
          : "Are you sure you want to delete this notice?"
      )
    ) {
      return;
    }

    try {
      setDeletingId(id);
      await axiosInstance.delete(`/notices/${id}`);
      setNotices((prev) => prev.filter((item) => item.id !== id));
      setMsg({
        type: "success",
        text: isBn
          ? "নোটিশ মুছে ফেলা হয়েছে।"
          : "Notice deleted successfully.",
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          (isBn
            ? "নোটিশ মুছতে সমস্যা হয়েছে।"
            : "Failed to delete notice."),
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FaBell className="text-primary text-lg" />
            <span>
              {isBn
                ? "নোটিশ বোর্ড ও ঘোষণা"
                : "Notice Board & Announcements"}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "প্রতিষ্ঠানের সকল সাম্প্রতিক নোটিশ এবং গুরুত্বপূর্ণ আপডেটসমূহ।"
              : "All official notices, events and administrative guidelines."}
          </p>
        </div>

        <button
          onClick={fetchNotices}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all flex items-center gap-2 shadow-sm"
        >
          <FaSync
            className={`text-xs ${loading ? "animate-spin text-primary" : ""}`}
          />
          <span>{isBn ? "রিফ্রেশ" : "Refresh Board"}</span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
            msg.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-destructive/10 text-destructive border-destructive/20"
          }`}
        >
          {msg.type === "success" ? (
            <FaCheckCircle className="shrink-0" />
          ) : (
            <FaExclamationTriangle className="shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Publish Form (Visible only for SUPER_ADMIN / ACCOUNTS) */}
        {isAdminOrAccounts && (
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card lg:col-span-1 h-fit">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <FaPlus className="text-primary text-xs" />
                <span>
                  {isBn ? "নতুন নোটিশ প্রকাশ করুন" : "Publish New Notice"}
                </span>
              </h3>

              <form onSubmit={handleCreateNotice} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {isBn ? "নোটিশের শিরোনাম" : "Notice Title"}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      isBn
                        ? "যেমন: বার্ষিক ক্রীড়া প্রতিযোগিতা সংক্রান্ত"
                        : "e.g., Annual Sports Competition Notice"
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {isBn ? "কার জন্য প্রযোজ্য?" : "Target Group"}
                  </label>
                  <select
                    value={targetGroup}
                    onChange={(e) =>
                      setTargetGroup(e.target.value as NoticeTarget)
                    }
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  >
                    <option value="ALL">
                      {isBn ? "সকলের জন্য (All)" : "Everyone (ALL)"}
                    </option>
                    <option value="STUDENT">
                      {isBn ? "শুধু শিক্ষার্থী (Students)" : "Students Only"}
                    </option>
                    <option value="TEACHER">
                      {isBn ? "শুধু শিক্ষক (Teachers)" : "Teachers Only"}
                    </option>
                    <option value="PARENT">
                      {isBn ? "শুধু অভিভাবক (Parents)" : "Parents Only"}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {isBn ? "বিস্তারিত বিবরণ" : "Notice Content"}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={
                      isBn
                        ? "এখানে নোটিশের বিস্তারিত তথ্য লিখুন..."
                        : "Write the detailed notice description here..."
                    }
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {isBn ? "সংযুক্ত নথি ইউআরএল (ঐচ্ছিক)" : "Attachment Link (URL)"}
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={attachment}
                    onChange={(e) => setAttachment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
                >
                  {submitting
                    ? isBn
                      ? "পাবলিশ হচ্ছে..."
                      : "Publishing..."
                    : isBn
                    ? "নোটিশ প্রকাশ করুন"
                    : "Publish Notice"}
                </button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Notice List Feed */}
        <div
          className={`${
            isAdminOrAccounts ? "lg:col-span-2" : "lg:col-span-3"
          } space-y-4`}
        >
          {/* Target Group Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { label: isBn ? "সব নোটিশ" : "All Notices", value: "" },
              { label: isBn ? "শিক্ষার্থী" : "Students", value: "STUDENT" },
              { label: isBn ? "শিক্ষক" : "Teachers", value: "TEACHER" },
              { label: isBn ? "অভিভাবক" : "Parents", value: "PARENT" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSelectedTarget(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTarget === tab.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              {isBn ? "নোটিশ লোড হচ্ছে..." : "Loading notices..."}
            </p>
          ) : notices.length > 0 ? (
            <div className="space-y-4">
              {notices.map((notice) => (
                <Card
                  key={notice.id}
                  className="border-border/60 shadow-sm rounded-2xl bg-card hover:shadow-md transition-all"
                >
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-foreground">
                          {notice.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="text-primary text-[10px]" />
                            {new Date(notice.publishedAt).toLocaleDateString(
                              isBn ? "bn-BD" : "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[10px]">
                            <FaUsers className="text-[9px]" />
                            {notice.targetGroup}
                          </span>
                        </div>
                      </div>

                      {/* Admin Delete Action */}
                      {isAdminOrAccounts && (
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          disabled={deletingId === notice.id}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          title="Delete Notice"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                      {notice.content}
                    </p>

                    {notice.attachment && (
                      <div className="pt-2 border-t border-border/40">
                        <a
                          href={notice.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-primary text-xs font-semibold hover:bg-muted/80 transition-colors"
                        >
                          <FaFileDownload className="text-xs" />
                          <span>
                            {isBn
                              ? "সংযুক্ত নথি / ফাইল দেখুন"
                              : "View Attachment / Document"}
                          </span>
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border/60 shadow-sm rounded-2xl bg-card p-8 text-center">
              <p className="text-xs text-muted-foreground">
                {isBn
                  ? "কোনো নোটিশ পাওয়া যায়নি।"
                  : "No notices published yet."}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}