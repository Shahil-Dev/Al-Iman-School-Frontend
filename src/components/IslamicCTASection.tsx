"use client";

import React, { memo } from "react";
import Link from "next/link";
import { FaArrowRight, FaHandshake, FaQuoteRight } from "react-icons/fa6";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext";

type Language = "en" | "bn";

const sectionContent = {
  bn: {
    eyebrow: "সমাজসেবা ও মানবকল্যাণ",
    heading: "মানুষের সেবা ও কল্যাণ সাধনই প্রকৃত ঈমানের পরিচয়",
    quoteAttribution: "রসূলুল্লাহ (সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম) বলেছেন,",
    quote: "তোমাদের মধ্যে সর্বোত্তম ব্যক্তি সে, যে মানুষের উপকার করে।",
    source: "সহীহ আল-জামে · ৩৩২৬",
    description:
      "ইসলামের মহান শিক্ষাকে দৈনন্দিন জীবনে ছড়িয়ে দিতে এবং একটি আদর্শ সমাজ গঠনে আমরা নিরলস কাজ করে যাচ্ছি। আমাদের মিশন ও ভিশন সম্পর্কে বিস্তারিত জানুন।",
    cta: "আমাদের মিশন দেখুন",
  },
  en: {
    eyebrow: "Social Welfare",
    heading: "Serving Humanity is the Essence of True Faith",
    quoteAttribution: "The Messenger of Allah (peace be upon him) said,",
    quote: "The best among you are those who bring the greatest benefit to others.",
    source: "Sahih Al-Jami · 3326",
    description:
      "We work tirelessly to bring timeless principles into daily life and to help build a compassionate community. Discover more about our mission and vision.",
    cta: "View Our Mission",
  },
} as const;

/* ---------- Motion variants (defined once, outside render) ---------- */

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const riseVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 20, mass: 0.9 },
  },
};

const railVariants: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  show: {
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ---------- Decorative corner ornament (SVG, aria-hidden) ---------- */

const Ornament = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 48 48"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
  >
    <path d="M24 2 L46 24 L24 46 L2 24 Z" opacity="0.35" />
    <path d="M24 10 L38 24 L24 38 L10 24 Z" opacity="0.6" />
    <circle cx="24" cy="24" r="2.5" fill="currentColor" stroke="none" />
  </svg>
);

/* ---------- Component ---------- */

const IslamicCTASection = memo(() => {
  const { language = "en" } = useLanguage();
  const currentLang = (language === "bn" ? "bn" : "en") as Language;
  const content = sectionContent[currentLang];
  const reduceMotion = useReducedMotion();

  const anim = reduceMotion
    ? {
        container: { hidden: {}, show: {} } as Variants,
        rise: { hidden: { opacity: 1 }, show: { opacity: 1 } } as Variants,
        rail: { hidden: { opacity: 1 }, show: { opacity: 1 } } as Variants,
      }
    : {
        container: containerVariants,
        rise: riseVariants,
        rail: railVariants,
      };

  return (
    <section
      aria-labelledby="islamic-cta-heading"
      className="relative overflow-hidden border-y border-border/60 bg-background py-20 sm:py-24 transition-colors duration-300"
    >
      {/* Ambient background: radial glow + hairline grid. Zero paint cost. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 40%, rgba(201,169,97,0.10), transparent 65%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          color: "var(--foreground)",
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      <motion.div
        variants={anim.container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
        className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-8 px-5 sm:px-8 md:grid-cols-[auto_1fr] md:gap-12"
      >
        {/* Left ornamental rail — anchors the composition */}
        <motion.div
          variants={anim.rail}
          className="hidden origin-top md:flex md:flex-col md:items-center md:pt-2"
          aria-hidden="true"
        >
          <span className="block h-16 w-px bg-gradient-to-b from-transparent to-[#c9a961]/60" />
          <Ornament className="my-4 h-6 w-6 text-[#c9a961]" />
          <span className="block flex-1 w-px bg-gradient-to-b from-[#c9a961]/60 via-[#c9a961]/25 to-transparent" />
        </motion.div>

        {/* Content column */}
        <div className="text-left">
          {/* Eyebrow */}
          <motion.div
            variants={anim.rise}
            className="mb-5 flex items-center gap-2.5"
          >
            <FaHandshake
              className="h-3.5 w-3.5 text-[#c9a961]"
              aria-hidden="true"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c9a961]">
              {content.eyebrow}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            id="islamic-cta-heading"
            variants={anim.rise}
            className="max-w-2xl text-balance text-2xl font-bold leading-[1.25] tracking-tight text-foreground sm:text-3xl md:text-[2.35rem] md:leading-[1.2]"
          >
            {content.heading}
          </motion.h2>

          {/* Hadith — printed-quote surface */}
          <motion.figure
            variants={anim.rise}
            className="relative my-8 max-w-2xl border-l-2 border-[#c9a961]/70 pl-5 sm:pl-6"
          >
            <FaQuoteRight
              aria-hidden="true"
              className="absolute -left-[9px] -top-1 h-4 w-4 text-[#c9a961]"
            />
            <blockquote className="text-base italic leading-relaxed text-foreground/90 sm:text-lg">
              <span className="not-italic text-muted-foreground">
                {content.quoteAttribution}{" "}
              </span>
              <span className="font-medium text-[#d4b878]">
                “{content.quote}”
              </span>
            </blockquote>
            <figcaption className="mt-2.5">
              <cite className="text-[11px] font-medium not-italic uppercase tracking-[0.16em] text-muted-foreground">
                {content.source}
              </cite>
            </figcaption>
          </motion.figure>

          {/* Supporting copy */}
          <motion.p
            variants={anim.rise}
            className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]"
          >
            {content.description}
          </motion.p>

          {/* CTA */}
          <motion.div variants={anim.rise} className="mt-8">
            <Link
              href="/about"
              className="group inline-flex items-center gap-3 rounded-full border border-[#c9a961]/40 bg-[#c9a961]/10 px-5 py-2.5 text-sm font-semibold text-[#d4b878] outline-none transition-colors duration-200 hover:border-[#c9a961] hover:bg-[#c9a961]/15 focus-visible:ring-2 focus-visible:ring-[#c9a961] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="relative">
                {content.cta}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#d4b878] transition-all duration-300 ease-out group-hover:w-full"
                />
              </span>
              <motion.span
                aria-hidden="true"
                className="inline-flex"
                whileHover={reduceMotion ? undefined : { x: 3 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
              >
                <FaArrowRight className="h-3.5 w-3.5" />
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
});

IslamicCTASection.displayName = "IslamicCTASection";

export default IslamicCTASection;