"use client";

import React, { useEffect, useState } from "react";
import {
  FaStar,
  FaCheck,
  FaTimes,
  FaSync,
  FaUserShield,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHourglassHalf,
  FaCheckDouble,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

interface IReview {
  id: string;
  comment: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
  parent?: {
    fatherName?: string;
    motherName?: string;
    phone?: string;
  };
}

export default function AdminReviewApprovalPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED">("PENDING");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch All Reviews for Admin
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setErrorNull();
      // admin review list fetch endpoint
      const res = await axiosInstance.get("/reviews");
      setReviews(res.data?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch reviews for admin:", err);
      // Fallback to public list if admin list route is identical
      try {
        const fallbackRes = await axiosInstance.get("/reviews/public");
        setReviews(fallbackRes.data?.data || []);
      } catch (fallbackErr) {
        setMsg({
          type: "error",
          text: isBn
            ? "রিভিউ তালিকা লোড করতে সমস্যা হয়েছে।"
            : "Failed to load review approvals list.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const setErrorNull = () => setMsg(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Toggle Approval API Call (/reviews/:id/approve)
  const handleToggleApproval = async (reviewId: string, targetStatus: boolean) => {
    try {
      setUpdatingId(reviewId);
      setErrorNull();

      await axiosInstance.patch(`/reviews/${reviewId}/approve`, {
        isApproved: targetStatus,
      });

      // Update state locally
      setReviews((prev) =>
        prev.map((item) =>
          item.id === reviewId ? { ...item, isApproved: targetStatus } : item
        )
      );

      setMsg({
        type: "success",
        text: isBn
          ? `অভিভাবকের রিভিউটি সফলভাবে ${targetStatus ? "অনুমোদন (Approved)" : "বাতিল (Unapproved)"} করা হয়েছে!`
          : `Review ${targetStatus ? "approved" : "unapproved"} successfully!`,
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          (isBn
            ? "রিভিউ স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।"
            : "Failed to update review status."),
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered List Logic
  const filteredReviews = reviews.filter((rev) => {
    if (filter === "PENDING") return !rev.isApproved;
    if (filter === "APPROVED") return rev.isApproved;
    return true; // ALL
  });

  const pendingCount = reviews.filter((r) => !r.isApproved).length;
  const approvedCount = reviews.filter((r) => r.isApproved).length;

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FaUserShield className="text-primary text-xl" />
            <span>
              {isBn
                ? "অভিভাবক রিভিউ এপ্রুভাল প্যানেল"
                : "Parent Reviews Approval Panel"}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "অভিভাবকদের পাঠানো রিভিউ অনুমোদন বা প্রত্যাখ্যান করুন।"
              : "Review, approve, or reject incoming parent testimonials before publishing."}
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <FaSync
            className={`text-xs ${loading ? "animate-spin text-primary" : ""}`}
          />
          <span>{isBn ? "রিফ্রেশ করুন" : "Refresh Status"}</span>
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
            <FaCheckCircle className="shrink-0 text-sm" />
          ) : (
            <FaExclamationTriangle className="shrink-0 text-sm" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Filter Tabs & Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              filter === "PENDING"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <FaHourglassHalf className="text-xs" />
            <span>
              {isBn ? "অনুমোদনের অপেক্ষায়" : "Pending Reviews"} ({pendingCount})
            </span>
          </button>

          <button
            onClick={() => setFilter("APPROVED")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              filter === "APPROVED"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <FaCheckDouble className="text-xs" />
            <span>
              {isBn ? "অনুমোদিত রিভিউ" : "Approved Reviews"} ({approvedCount})
            </span>
          </button>

          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            {isBn ? "সব রিভিউ" : "All Reviews"} ({reviews.length})
          </button>
        </div>
      </div>

      {/* Reviews Table / Cards Grid */}
      {loading ? (
        <p className="text-xs text-muted-foreground py-8 text-center">
          {isBn ? "রিভিউ লোড হচ্ছে..." : "Loading review approvals..."}
        </p>
      ) : filteredReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => {
            const parentName =
              rev.parent?.fatherName ||
              rev.parent?.motherName ||
              (isBn ? "নামহীন অভিভাবক" : "Parent");

            return (
              <Card
                key={rev.id}
                className={`border-border/60 shadow-sm rounded-2xl bg-card hover:shadow-md transition-all flex flex-col justify-between ${
                  !rev.isApproved ? "border-l-4 border-l-amber-500 bg-amber-500/5" : "border-l-4 border-l-emerald-500"
                }`}
              >
                <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Header: Rating & Approval Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`text-xs ${
                              star <= rev.rating
                                ? "text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-foreground ml-1">
                          ({rev.rating}/5)
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rev.isApproved
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        }`}
                      >
                        {rev.isApproved ? "APPROVED" : "PENDING APPROVAL"}
                      </span>
                    </div>

                    {/* Review Comment Text */}
                    <p className="text-xs text-foreground/90 italic leading-relaxed pt-1">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Footer: Parent Info & Approval Action Buttons */}
                  <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2 text-xs mt-2">
                    <div>
                      <p className="font-bold text-foreground text-xs">
                        {parentName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Submitted:{" "}
                        {new Date(rev.createdAt).toLocaleDateString(
                          isBn ? "bn-BD" : "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    {/* Approval / Rejection Action Toggle */}
                    <div className="flex items-center gap-2">
                      {!rev.isApproved ? (
                        <button
                          onClick={() => handleToggleApproval(rev.id, true)}
                          disabled={updatingId === rev.id}
                          className="px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <FaCheck className="text-xs" />
                          <span>{isBn ? "অনুমোদন করুন" : "Approve"}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleApproval(rev.id, false)}
                          disabled={updatingId === rev.id}
                          className="px-3.5 py-1.5 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <FaTimes className="text-xs" />
                          <span>{isBn ? "অনুমোদন বাতিল" : "Unapprove"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-border/60 shadow-sm rounded-2xl bg-card p-12 text-center">
          <p className="text-xs text-muted-foreground">
            {filter === "PENDING"
              ? isBn
                ? "অনুমোদনের জন্য কোনো বকেয়া রিভিউ নেই।"
                : "No pending reviews awaiting approval."
              : isBn
              ? "কোনো রিভিউ পাওয়া যায়নি।"
              : "No reviews found for the selected filter."}
          </p>
        </Card>
      )}
    </div>
  );
}