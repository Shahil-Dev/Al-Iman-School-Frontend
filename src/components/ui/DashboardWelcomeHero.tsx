"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext";

interface DashboardWelcomeHeroProps {
  roleLabelEn: string;
  roleLabelBn: string;
  userName: string;
  subtitleEn?: string;
  subtitleBn?: string;
}

/* Palette
   ink    #0b1713  deep green-black base
   moss   #12281f  lifted surface
   brass  #c9a96a  single accent (greeting, hairline, role dot)
   ivory  #f3efe4  primary text
*/

export default function DashboardWelcomeHero({
  roleLabelEn,
  roleLabelBn,
  userName,
  subtitleEn,
  subtitleBn,
}: DashboardWelcomeHeroProps) {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const reduce = useReducedMotion();

  // One orchestrated reveal: a single container fades in, children settle in sequence.
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: reduce
        ? { duration: 0.1 }
        : { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const subtitle = isBn ? subtitleBn : subtitleEn;

  return (
    <section
      aria-label={isBn ? "স্বাগতম" : "Welcome"}
      className="relative mb-6 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b1713] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)]"
    >
      {/* Surface: soft vertical lift, no glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#0f211a_0%,#0b1713_70%)]"
      />

      {/* Eight-pointed star lattice, faded out toward the left so text stays clean */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-full text-[#c9a96a] md:w-[65%]"
        style={{
          opacity: 0.14,
          WebkitMaskImage:
            "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
          maskImage:
            "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
        }}
      >
        <defs>
          <pattern
            id="hero-star"
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(22.5)"
          >
            <g fill="none" stroke="currentColor" strokeWidth="0.75">
              {/* Outer square */}
              <rect x="16" y="16" width="32" height="32" />
              {/* Inner rotated square (creates the 8-point star) */}
              <rect
                x="16"
                y="16"
                width="32"
                height="32"
                transform="rotate(45 32 32)"
              />
              {/* Subtle center dot */}
              <circle cx="32" cy="32" r="1.5" fill="currentColor" stroke="none" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-star)" />
      </svg>

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 px-6 pb-12 pt-14 sm:px-10 md:px-14 md:pb-16 md:pt-16"
      >
        {/* The memorable element: the greeting */}
        <motion.h1
          variants={item}
          lang="ar"
          dir="rtl"
          className="font-arabic text-left text-[2.75rem] font-bold leading-[1.4] text-[#c9a96a] sm:text-5xl md:text-6xl lg:text-[4.5rem] drop-shadow-[0_2px_10px_rgba(201,169,106,0.15)]"
        >
          السَّلَامُ عَلَيْكُمْ
        </motion.h1>

        {/* Brass hairline with a tiny motion reveal */}
        <motion.div
          variants={item}
          aria-hidden
          className="my-7 h-[1.5px] w-16 origin-left bg-gradient-to-r from-[#c9a96a] to-transparent md:my-8 md:w-24"
        />

        {/* Name */}
        <motion.h2
          variants={item}
          className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[#f3efe4] md:text-4xl"
        >
          {userName}
        </motion.h2>

        {/* Role: dot + plain text, sentence case */}
        <motion.p
          variants={item}
          className="mt-4 flex items-center gap-2.5 text-sm font-medium text-[#f3efe4]/80"
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#c9a96a]" />
          {isBn ? roleLabelBn : roleLabelEn}
        </motion.p>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            variants={item}
            className={`mt-3 max-w-xl text-sm text-[#f3efe4]/60 md:text-[15px] ${
              isBn ? "leading-8" : "leading-relaxed"
            }`}
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}