"use client";

import React, { useEffect, useState, memo } from "react";
import Marquee from "react-fast-marquee";
import { FaStar, FaQuoteLeft, FaUser } from "react-icons/fa";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext"; // Import your language context

// Types based on your backend response
interface ParentInfo {
  fatherName?: string | null;
  motherName?: string | null;
  profileImage?: string | null;
  user?: {
    name?: string | null;
    image?: string | null;
  };
}

interface Review {
  id: string;
  comment: string;
  rating: number;
  createdAt: string;
  parent: ParentInfo;
}

type Language = "en" | "bn";

// Multilingual texts for section header
const sectionTranslations = {
  en: {
    badge: "Parent Testimonials",
    title: "What Guardians Say About Us",
    subtitle:
      "Real feedback from parents trusting us with their children's education and future.",
    fallbackName: "Guardian",
  },
  bn: {
    badge: "অভিভাবকদের মতামত",
    title: "আমাদের সম্পর্কে অভিভাবকদের বক্তব্য",
    subtitle:
      "সন্তানদের উজ্জ্বল ভবিষ্যতের জন্য আমাদের ওপর আস্থা রাখা অভিভাবকদের অনুভূতি।",
    fallbackName: "অভিভাবক",
  },
};

// Helper function to extract initials for fallback avatar
const getInitials = (name: string): string => {
  if (!name) return "G";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Memoized Individual Review Card Component
const ReviewCard = memo(
  ({ review, fallbackName }: { review: Review; fallbackName: string }) => {
    const reduceMotion = useReducedMotion();

    // Resolve Parent Name Priority: fatherName -> motherName -> user.name -> Fallback
    const displayName =
      review.parent?.fatherName ||
      review.parent?.motherName ||
      review.parent?.user?.name ||
      fallbackName;

    // Resolve Profile Image Priority
    const avatarUrl =
      review.parent?.profileImage || review.parent?.user?.image || null;

    const initials = getInitials(displayName);

    return (
      <div className="w-[320px] sm:w-[380px] mx-3 my-2 flex-shrink-0">
        <motion.div
          whileHover={reduceMotion ? {} : { y: -4 }}
          transition={{ duration: 0.2 }}
          className="h-full bg-card text-card-foreground border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
        >
          {/* Subtle Decorative Background Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a961]/5 rounded-bl-full pointer-events-none group-hover:bg-[#c9a961]/10 transition-colors" />

          <div>
            {/* Header: Avatar, Name & Rating */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#c9a961]/40 shadow-sm"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm shadow-sm">
                    {initials}
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                    {displayName}
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Guardian
                  </p>
                </div>
              </div>

              <FaQuoteLeft className="text-muted-foreground/20 text-2xl flex-shrink-0" />
            </div>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <FaStar
                  key={index}
                  className={`text-xs ${
                    index < review.rating
                      ? "text-[#c9a961]"
                      : "text-muted-foreground/25"
                  }`}
                />
              ))}
            </div>

            {/* Review Text */}
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-4 italic">
              "{review.comment}"
            </p>
          </div>

          {/* Footer: Date display */}
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              {new Date(review.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </motion.div>
      </div>
    );
  },
);

ReviewCard.displayName = "ReviewCard";

export default function ParentReviewsMarquee() {
  const { language = "en" } = useLanguage();
  const currentLang = (language === "bn" ? "bn" : "en") as Language;
  const t = sectionTranslations[currentLang];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Public Approved Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/v1/reviews/public"); // Adjust API route if needed
        const data = await res.json();
        if (data?.success && Array.isArray(data?.data)) {
          setReviews(data.data);
        }
      } catch (error) {
        // Handle error silently or pass fallback state
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="h-6 w-32 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-8 w-64 bg-muted rounded-lg mx-auto mb-10 animate-pulse" />
          <div className="flex justify-center gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-80 h-48 bg-card border border-border rounded-2xl animate-pulse p-6"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-background text-foreground overflow-hidden relative transition-colors duration-300">
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center px-4 mb-10">
        <span className="inline-block text-xs font-semibold tracking-wider text-[#c9a961] uppercase bg-[#c9a961]/10 px-3 py-1 rounded-full mb-3 border border-[#c9a961]/20">
          {t.badge}
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {t.title}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      {/* Marquee Section */}
      <div className="relative w-full">
        {/* Gradient Fades for Left and Right Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <Marquee
          pauseOnHover={true}
          speed={35}
          gradient={false}
          className="py-2"
        >
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              fallbackName={t.fallbackName}
            />
          ))}
        </Marquee>
      </div>
    </section>
  );
}
