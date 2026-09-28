"use client";

import React, { useEffect, useState } from "react";
import {
  FaStar,
  FaCheck,
  FaTimes,
  FaSync,
  FaCommentDots,
  FaPaperPlane,
  FaExclamationTriangle,
  FaCheckCircle,
  FaUserShield,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/context/UserContext";

interface IReview {
  id: string;
  comment: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
  parent?: {
    fatherName?: string;
    motherName?: string;
  };
}

export default function ReviewManagementPage() {
  const { user } = useUser();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ACCOUNTS";
  const isParent = user?.role === "PARENT";

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Form State for Parents
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);

  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch Reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Admin reads full list or public approved list based on route/endpoint setup
      const endpoint = isAdmin ? "/reviews" : "/reviews/public";
      const res = await axiosInstance.get(endpoint).catch(() =>
        // Fallback to public endpoint if admin endpoint is mapped to public
        axiosInstance.get("/reviews/public")
      );
      setReviews(res.data?.data || []);
    } catch (err: any) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [isAdmin]);

  // Handle Parent Review Submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.length < 5) {
      setMsg({
        type: "error",
        text: isBn
          ? "অনুগ্রহ করে অন্তত ৫ অক্ষরের মন্তব্য লিখুন।"
          : "Please enter a comment with at least 5 characters.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMsg(null);

      await axiosInstance.post("/reviews", {
        comment,
        rating,
      });

      setMsg({
        type: "success",
        text: isBn
          ? "আপনার রিভিউ সফলভাবে জমা দেওয়া হয়েছে! অ্যাডমিনের অনুমোদনের পর তা প্রকাশিত হবে।"
          : "Review submitted successfully! Pending admin approval.",
      });

      setComment("");
      setRating(5);
      fetchReviews();
    } catch (err: any) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          (isBn
            ? "রিভিউ জমা দিতে সমস্যা হয়েছে।"
            : "Failed to submit review."),
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Admin Approval / Rejection Toggle
  const handleToggleApproval = async (reviewId: string, currentStatus: boolean) => {
    try {
      setUpdatingId(reviewId);
      const newStatus = !currentStatus;

      await axiosInstance.patch(`/reviews/${reviewId}/approve`, {
        isApproved: newStatus,
      });

      setReviews((prev) =>
        prev.map((item) =>
          item.id === reviewId ? { ...item, isApproved: newStatus } : item
        )
      );

      setMsg({
        type: "success",
        text: isBn
          ? `রিভিউটি সফলভাবে ${newStatus ? "অনুমোদন" : "বাতিল"} করা হয়েছে।`
          : `Review ${newStatus ? "approved" : "unapproved"} successfully.`,
      });
    } catch (err: any) {
      setMsg({
        type: "error",
        text:
          err.response?.data?.message ||
          (isBn
            ? "রিভিউ স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।"
            : "Failed to update review status."),
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FaCommentDots className="text-primary text-lg" />
            <span>
              {isBn
                ? "অভিভাবকদের মন্তব্য ও রিভিউ"
                : "Parent Reviews & Testimonials"}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn
              ? "প্রতিষ্ঠানের শিক্ষা ও পরিবেশ সম্পর্কিত অভিভাবকগণের মতামত।"
              : "Read authentic feedback and ratings shared by parents."}
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all flex items-center gap-2 shadow-sm"
        >
          <FaSync
            className={`text-xs ${loading ? "animate-spin text-primary" : ""}`}
          />
          <span>{isBn ? "রিফ্রেশ" : "Refresh List"}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submit Review Form (Visible to Logged-In Parents) */}
        {isParent && (
          <Card className="border-border/60 shadow-sm rounded-2xl bg-card lg:col-span-1 h-fit">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <FaPaperPlane className="text-primary text-xs" />
                <span>
                  {isBn ? "আপনার মতামত ব্যক্ত করুন" : "Write a Review"}
                </span>
              </h3>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Star Rating Select */}
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-2">
                    {isBn ? "রেটিং নির্বাচন করুন" : "Select Rating"}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-xl transition-transform hover:scale-110 focus:outline-none"
                      >
                        <FaStar
                          className={`${
                            star <= (hoverRating || rating)
                              ? "text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-foreground ml-2">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1.5">
                    {isBn ? "আপনার মূল্যবান বক্তব্য" : "Your Feedback / Comment"}
                  </label>
                  <textarea
                    rows={4}
                    placeholder={
                      isBn
                        ? "বিদ্যালয়ের পরিবেশ, পড়াশোনার মান ও শৃঙ্খলা সম্পর্কে আপনার অভিজ্ঞতা লিখুন..."
                        : "Share your experience regarding academics, discipline and environment..."
                    }
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>
                    {submitting
                      ? isBn
                        ? "জমা হচ্ছে..."
                        : "Submitting..."
                      : isBn
                      ? "রিভিউ জমা দিন"
                      : "Submit Review"}
                  </span>
                </button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reviews List Grid */}
        <div
          className={`${
            isParent ? "lg:col-span-2" : "lg:col-span-3"
          } space-y-4`}
        >
          {loading ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              {isBn ? "রিভিউ লোড হচ্ছে..." : "Loading reviews..."}
            </p>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => {
                const parentName =
                  rev.parent?.fatherName ||
                  rev.parent?.motherName ||
                  (isBn ? "শ্রদ্ধেয় অভিভাবক" : "Respected Parent");

                return (
                  <Card
                    key={rev.id}
                    className={`border-border/60 shadow-sm rounded-2xl bg-card hover:shadow-md transition-all flex flex-col justify-between ${
                      !rev.isApproved && isAdmin ? "bg-amber-500/5 border-amber-500/30" : ""
                    }`}
                  >
                    <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        {/* Rating & Status Bar */}
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
                          </div>

                          {isAdmin && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                rev.isApproved
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-amber-500/10 text-amber-600"
                              }`}
                            >
                              {rev.isApproved ? "Approved" : "Pending"}
                            </span>
                          )}
                        </div>

                        {/* Comment Content */}
                        <p className="text-xs text-foreground/90 italic leading-relaxed">
                          "{rev.comment}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <p className="font-bold text-foreground text-xs">
                            {parentName}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
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

                        {/* Admin Action Buttons */}
                        {isAdmin && (
                          <button
                            onClick={() =>
                              handleToggleApproval(rev.id, rev.isApproved)
                            }
                            disabled={updatingId === rev.id}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                              rev.isApproved
                                ? "bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {rev.isApproved ? (
                              <>
                                <FaTimes className="text-[10px]" />
                                <span>{isBn ? "বাতিল" : "Reject"}</span>
                              </>
                            ) : (
                              <>
                                <FaCheck className="text-[10px]" />
                                <span>{isBn ? "অনুমোদন" : "Approve"}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-border/60 shadow-sm rounded-2xl bg-card p-8 text-center">
              <p className="text-xs text-muted-foreground">
                {isBn
                  ? "এখনো কোনো অভিভাবকের মন্তব্য পাওয়া যায়নি।"
                  : "No parent reviews available yet."}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}