"use client";

import React, { useEffect, useState } from "react";
import {
  FaCheck,
  FaTimes,
  FaStar,
  FaSpinner,
  FaComments,
  FaUser,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";
import { toast } from "sonner";

export default function ReviewApprovalPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/reviews/admin/all");
      const list = res.data?.data || res.data || [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load reviews", err);
      toast.error(isBn ? "রিভিউ লোড করতে ব্যর্থ হয়েছে।" : "Failed to load reviews.");
    } fontFinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const handleToggleApproval = async (id: string, isApproved: boolean) => {
    setUpdatingId(id);
    try {
      await axiosInstance.patch(`/reviews/${id}/approve`, {
        isApproved,
      });

      toast.success(
        isApproved
          ? isBn
            ? "রিভিউ সফলভাবে অনুমোদন করা হয়েছে!"
            : "Review approved successfully!"
          : isBn
          ? "রিভিউ প্রত্যাখান করা হয়েছে।"
          : "Review status updated!"
      );

      // Refresh list
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isApproved } : r))
      );
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error(isBn ? "স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।" : "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <span className="bg-primary/10 text-primary text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
          {isBn ? "রিভিউ মডারেশন" : "Review Moderation"}
        </span>
        <h1 className="text-xl md:text-2xl font-bold text-foreground mt-2 flex items-center gap-2">
          <FaComments className="text-primary text-lg" />
          <span>{isBn ? "অভিভাবক রিভিউ অনুমোদন" : "Parent Review Approvals"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {isBn
            ? "অভিভাবকদের দেওয়া মতামত যাচাই করে ওয়েবসাইটে প্রকাশের জন্য অনুমোদন বা বাতিল করুন।"
            : "Approve or reject parent reviews before displaying them on the public portal."}
        </p>
      </div>

      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin text-primary text-lg" />
              <span>{isBn ? "রিভিউ লোড হচ্ছে..." : "Fetching submitted reviews..."}</span>
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-12">
              {isBn ? "কোনো রিভিউ জমা পড়েনি।" : "No reviews submitted yet."}
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-border/60 bg-muted/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        <FaUser />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          {rev.parent?.fatherName || rev.parent?.motherName || (isBn ? "অভিভাবক" : "Parent")}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {rev.parent?.user?.email || rev.parent?.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-xs ${
                            i < rev.rating ? "text-amber-400" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-muted-foreground ml-1 font-mono">
                        ({rev.rating}.0)
                      </span>
                    </div>

                    <p className="text-xs text-foreground bg-background/50 p-2.5 rounded-lg border border-border/40">
                      "{rev.comment}"
                    </p>

                    <span className="text-[9px] text-muted-foreground font-mono block">
                      {new Date(rev.createdAt).toLocaleDateString(isBn ? "bn-BD" : "en-US")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {rev.isApproved ? (
                      <button
                        onClick={() => handleToggleApproval(rev.id, false)}
                        disabled={updatingId === rev.id}
                        className="px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-bold text-xs flex items-center gap-1 hover:bg-destructive hover:text-white transition-all"
                      >
                        {updatingId === rev.id ? <FaSpinner className="animate-spin" /> : <FaTimes />}
                        <span>{isBn ? "অনুমোদন বাতিল" : "Unapprove"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleApproval(rev.id, true)}
                        disabled={updatingId === rev.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold text-xs flex items-center gap-1 hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        {updatingId === rev.id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                        <span>{isBn ? "অনুমোদন করুন" : "Approve"}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}