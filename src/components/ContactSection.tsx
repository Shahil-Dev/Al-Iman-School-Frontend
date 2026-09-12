"use client";

import React, { memo } from "react";
import {
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaLocationDot,
  FaPaperPlane,
} from "react-icons/fa6";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useLanguage } from '../context/LanguageContext';



type Language = "en" | "bn";

const contactTranslations = {
  bn: {
    sectionBadge: "যোগাযোগ",
    sectionTitle: "আমাদের সাথে সংযুক্ত থাকুন",
    sectionSubtitle:
      "দ্বীনি ও আধুনিক শিক্ষার এই পথচলায় যেকোনো প্রশ্ন বা তথ্যের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।",

    // Islamic & Encouraging Texts
    islamicQuote:
      "“জ্ঞানের সন্ধান করা প্রতিটি মুসলমানের জন্য ফরজ।” — আল-হাদিস",
    connectIntro:
      "আল-ঈমান স্কুলের ভর্তি প্রক্রিয়া, পাঠ্যক্রম অথবা যেকোনো পরামর্শের জন্য আমাদের প্রশাসনিক টিম সার্বক্ষণিক আপনাকে সহায়তা করতে প্রস্তুত।",

    // Contact Details
    phoneTitle: "ফোন নাম্বার",
    phoneNumber: "+880 1700-000000",

    emailTitle: "ইমেইল অ্যাড্রেস",
    emailAddress: "info@aleemanschool.edu.bd",

    addressTitle: "ঠিকানা",
    addressDetails: "চট্টগ্রাম, বাংলাদেশ",

    // WhatsApp Action
    whatsappTitle: "ডাইরেক্ট অ্যাডমিন সাপোর্ট",
    whatsappSubtitle: "জরুরি যেকোনো তথ্যের জন্য সরাসরি অ্যাডমিনের সাথে হোয়াটসঅ্যাপে কথা বলুন।",
    whatsappBtn: "হোয়াটসঅ্যাপে মেসেজ দিন",

    // Pre-filled WhatsApp Message
    whatsappDefaultMsg: "আসসালামু আলাইকুম, আমি আল-ঈমান স্কুল সম্পর্কে কিছু তথ্য জানতে চাই।",
  },
  en: {
    sectionBadge: "Contact Us",
    sectionTitle: "Get in Touch with Us",
    sectionSubtitle:
      "Reach out to us directly for any inquiries regarding our integrated Islamic and modern curriculum.",

    // Islamic & Encouraging Texts
    islamicQuote:
      "“Seeking knowledge is an obligation upon every Muslim.” — Al-Hadith",
    connectIntro:
      "Our administrative team is always available to assist you with admissions, curriculum details, or general guidance.",

    // Contact Details
    phoneTitle: "Phone Number",
    phoneNumber: "+880 1700-000000",

    emailTitle: "Email Address",
    emailAddress: "info@aleemanschool.edu.bd",

    addressTitle: "Location",
    addressDetails: "Chattogram, Bangladesh",

    // WhatsApp Action
    whatsappTitle: "Direct Admin Support",
    whatsappSubtitle: "Chat directly with our administration on WhatsApp for quick assistance.",
    whatsappBtn: "Chat on WhatsApp",

    // Pre-filled WhatsApp Message
    whatsappDefaultMsg: "Assalamu Alaikum, I would like to know more about Al-Eman School.",
  },
} as const;

/* ---------- Motion Variants ---------- */
const sectionVariants: Variants = {
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
    transition: { type: "spring", stiffness: 120, damping: 22, mass: 0.9 },
  },
};

const reducedVariants: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
};

export const ContactSection = memo(() => {
  const { language = "bn" } = useLanguage();
  const currentLang = (language === "en" ? "en" : "bn") as Language;
  const t = contactTranslations[currentLang];
  const reduceMotion = useReducedMotion();

  const rise = reduceMotion ? reducedVariants : riseVariants;
  const section = sectionVariants;

  // ⚠️ আপনার অ্যাডমিনের আসল হোয়াটসঅ্যাপ নাম্বার (কান্ট্রি কোড সহ, কোনো + বা স্পেস ছাড়া)
  const adminWhatsAppNumber = "8801700000000"; 
  
  const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(
    t.whatsappDefaultMsg
  )}`;

  return (
    <section
      aria-labelledby="contact-heading"
      className="relative overflow-hidden border-t border-border/70 bg-gradient-to-b from-background via-muted/10 to-background py-20 sm:py-24"
    >
      {/* Background Subtle Gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 50% at 50% 20%, rgba(201,169,97,0.08), transparent 70%)",
        }}
      />

      <motion.div
        variants={section}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="relative mx-auto max-w-6xl px-5 sm:px-8"
      >
        {/* Header */}
        <div className="mb-14 text-center">
          <motion.div
            variants={rise}
            className="mb-4 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a8874a] dark:text-[#d4b878]"
          >
            <span aria-hidden="true" className="h-px w-6 bg-current opacity-50" />
            <span>{t.sectionBadge}</span>
            <span aria-hidden="true" className="h-px w-6 bg-current opacity-50" />
          </motion.div>

          <motion.h2
            id="contact-heading"
            variants={rise}
            className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl"
          >
            {t.sectionTitle}
          </motion.h2>

          <motion.p
            variants={rise}
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            {t.sectionSubtitle}
          </motion.p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column: Islamic Text & Info (7 Cols) */}
          <motion.div
            variants={rise}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card/50 p-6 sm:p-8 backdrop-blur-sm shadow-sm lg:col-span-7"
          >
            <div>
              {/* Islamic Hadith Card */}
              <div className="mb-8 rounded-xl border border-[#c9a961]/30 bg-[#c9a961]/5 p-5">
                <p className="text-sm sm:text-base font-semibold italic text-[#a8874a] dark:text-[#d4b878]">
                  {t.islamicQuote}
                </p>
              </div>

              <p className="mb-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t.connectIntro}
              </p>

              {/* Direct Details Grid */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-[#a8874a] dark:text-[#d4b878]">
                    <FaPhone className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t.phoneTitle}
                    </h4>
                    <a
                      href={`tel:${t.phoneNumber}`}
                      className="text-sm sm:text-base font-medium text-foreground transition-colors hover:text-[#a8874a]"
                    >
                      {t.phoneNumber}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-[#a8874a] dark:text-[#d4b878]">
                    <FaEnvelope className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t.emailTitle}
                    </h4>
                    <a
                      href={`mailto:${t.emailAddress}`}
                      className="text-sm sm:text-base font-medium text-foreground transition-colors hover:text-[#a8874a]"
                    >
                      {t.emailAddress}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-[#a8874a] dark:text-[#d4b878]">
                    <FaLocationDot className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {t.addressTitle}
                    </h4>
                    <p className="text-sm sm:text-base font-medium text-foreground">
                      {t.addressDetails}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Featured WhatsApp Card (5 Cols) */}
          <motion.div
            variants={rise}
            className="flex flex-col justify-between rounded-2xl border border-[#25D366]/30 bg-gradient-to-br from-[#25D366]/10 via-card to-card p-6 sm:p-8 shadow-sm lg:col-span-5"
          >
            <div>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20">
                <FaWhatsapp className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                {t.whatsappTitle}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t.whatsappSubtitle}
              </p>
            </div>

            <div className="mt-8">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#20bd5a] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#25D366]/30"
              >
                <span>{t.whatsappBtn}</span>
                <FaPaperPlane className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
});

ContactSection.displayName = "ContactSection";