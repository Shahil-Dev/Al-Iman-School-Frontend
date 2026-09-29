"use client";

import React, { useState } from "react";
import {
  FaStar,
  FaComments,
  FaSpinner,
  FaCheckCircle,
  FaPaperPlane,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { toast } from "sonner";

export default function ParentReviewPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error(
        isBn ? "অনুরোধ করে কিছু মতামত লিখুন।" : "Please enter your review."
      );
      return;
    }

    setSubmitting(true);
    try {
      await axiosInstance.post("/reviews", {
        rating,
        comment,
      });

      toast.success(
        isBn
          ? "আপনার রিভিউ সফলভাবে জমা হয়েছে! এডমিনের অনুমোদনের পর তা প্রকাশিত হবে।"
          : "Review submitted successfully! Pending admin approval."
      );

      setComment("");
      setRating(5);
      setSubmittedSuccess(true);
    } catch (err: any) {
      console.error("Failed to submit review", err);
      toast.error(
        err.response?.data?.message ||
          (isBn ? "রিভিউ জমা দিতে ব্যর্থ হয়েছে।" : "Failed to submit review.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
          {isBn ? "অভিভাবক প্রতিক্রিয়া" : "Parent Review"}
        </span>
        <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
          <FaComments className="text-primary text-lg" />
          <span>
            {isBn ? "বিদ্যালয় সম্পর্কিত মতামত দিন" : "Submit School Review"}
          </span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "আল-ঈমান স্কুলের শিক্ষার মান ও সার্বিক পরিবেশ সম্পর্কে আপনার মূল্যবান অভিজ্ঞতা শেয়ার করুন।"
            : "Share your thoughts and ratings regarding academic quality and facility standards."}
        </p>
      </div>

      {/* Review Form Card */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6 md:p-8 space-y-6">
          {submittedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center gap-3 text-xs">
              <FaCheckCircle className="text-lg shrink-0" />
              <div>
                <strong className="block font-bold">
                  {isBn ? "ধন্যবাদ!" : "Thank You!"}
                </strong>
                <span>
                  {isBn
                    ? "আপনার প্রতিক্রিয়া সফলভাবে জমা নেওয়া হয়েছে।"
                    : "Your review has been successfully submitted."}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-5 text-xs">
            {/* Star Rating Picker */}
            <div className="space-y-2">
              <label className="block font-bold text-foreground uppercase tracking-wider text-[11px]">
                {isBn ? "রেটিং নির্বাচন করুন *" : "Select Rating *"}
              </label>
              <div className="flex items-center gap-2 bg-muted/30 p-3 rounded-xl border border-border/50 w-fit">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-125"
                  >
                    <FaStar
                      className={`text-xl ${
                        star <= rating
                          ? "text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-mono font-bold text-foreground text-sm">
                  {rating}.0
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-2">
              <label className="block font-bold text-foreground uppercase tracking-wider text-[11px]">
                {isBn
                  ? "আপনার মতামত বা অভিজ্ঞতা লিখুন *"
                  : "Your Detailed Feedback *"}
              </label>
              <textarea
                rows={5}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isBn
                    ? "বিদ্যালয়ের শিক্ষকতা, পরিবেশ বা ব্যবস্থাপনা সম্পর্কে আপনার মতামত লিখুন..."
                    : "Describe your experience with teaching quality, facilities, or administration..."
                }
                className="w-full p-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <FaSpinner className="animate-spin text-sm" />
              ) : (
                <FaPaperPlane />
              )}
              <span>
                {isBn ? "মতামত জমা দিন" : "Submit Feedback"}
              </span>
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}