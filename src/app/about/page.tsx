"use client";

import React, { memo } from "react";
import Link from "next/link";
import {
  FaBookOpen,
  FaShieldHalved,
  FaCompass,
  FaGraduationCap,
  FaArrowRight,
} from "react-icons/fa6";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext"; // প্রয়োজনে আপনার প্রজেক্টের পাথ অনুযায়ী অ্যাডজাস্ট করুন

type Language = "en" | "bn";

const pageTranslations = {
  bn: {
    heroBadge: "দ্বীন ও আধুনিক শিক্ষার সমন্বয়",
    heroTitle: "আল-ঈমান স্কুল প্রতিষ্ঠার উদ্দেশ্য ও আমাদের পথচলা",
    heroSubtitle:
      "ঈমান-আকিদা রক্ষা এবং নৈতিক শিক্ষার সুরক্ষায় একটি আদর্শিক শিক্ষা প্রতিষ্ঠানের পথপ্রদর্শক।",

    statementTitle: "আমাদের প্রতিষ্ঠার পটভূমি ও মূল লক্ষ্য",
    statementQuote:
      "আল-ঈমান স্কুল প্রতিষ্ঠার মূল উদ্দেশ্য কেবল প্রচলিত পাঠদান সম্পন্ন করা নয়; বরং দ্বীনি চেতনা ও আধুনিক শিক্ষার সমন্বয়ে জাতীয় শিক্ষাক্রমে একটি ইতিবাচক সংস্কার সাধন করা।",
    para1:
      "প্রচলিত শিক্ষাব্যবস্থায় বিভিন্ন সময় নানাবিধ দুনিয়াবি মতাদর্শকে এমনভাবে প্রাধান্য দেওয়া হয়েছে, যা শিক্ষার্থীদের হৃদয় থেকে আল্লাহ তাআলার সাথে সম্পর্কের গভীরতা এবং খাঁটি ইসলামী আকিদাকে ম্লান করে দেয়। আল-ঈমান স্কুল প্রতিষ্ঠার মাধ্যমে আমরা এ কথাটিই স্পষ্ট করতে চেয়েছি যে, ঈমান-আকিদা রক্ষা এবং নৈতিক শিক্ষার সুরক্ষায় কেন আজ এই ধরনের একটি আদর্শিক শিক্ষা প্রতিষ্ঠানের প্রয়োজনীয়তা অপরিসীম।",
    para2:
      "আমরা আমাদের প্রতিষ্ঠানে জাতীয় শিক্ষাক্রম অন্তর্ভুক্ত রেখেছি, যেন আমাদের শিক্ষার্থীরা জাতীয় মূলধারা থেকে বিচ্ছিন্ন না হয় এবং এই বাস্তব অভিজ্ঞতার আলোকে আমরা যেন রাষ্ট্রের কাছে ইসলামী মূল্যবোধভিত্তিক শিক্ষা রূপান্তরের যৌক্তিক প্রস্তাবনা পেশ করতে পারি। মূলধারার সাথে যুক্ত থেকে আমরা রাষ্ট্রকে এটি বোঝাতে চাই যে—বর্তমানে প্রচলিত শিক্ষাক্রমটি আমাদের ঈমানি চেতনা, অভিভাবকবৃন্দের প্রত্যাশা এবং শিক্ষার্থীদের আত্মিক চাহিদার সাথে সঙ্গতিপূর্ণ নয়।",
    para3:
      "দ্বিতীয়ত, রাষ্ট্রীয় বাধ্যবাধকতার কারণে আমাদের উপর যে শিক্ষাক্রম অনুসরণের বিষয় রয়েছে, তা মেনে নেওয়ার পাশাপাশি পাঠ্যক্রমের যাবতীয় বিভ্রান্তি থেকে শিক্ষার্থীদের ঈমান ও আখলাক রক্ষা করে গড়ে তোলাই আমাদের প্রধান অগ্রাধিকার।",

    pillarsTitle: "আমাদের মূল স্তম্ভসমূহ",
    pillarsSubtitle:
      "যে আদর্শিক কাঠামোর ওপর ভিত্তি করে আমাদের শিক্ষা কার্যক্রম পরিচালিত হয়",

    pillar1Title: "ঈমান ও আকিদা সংরক্ষণ",
    pillar1Desc:
      "শিক্ষার্থীদের হৃদয়ে আল্লাহ তাআলার সাথে সম্পর্কের গভীরতা ও খাঁটি তাওহীদি চেতনা জাগ্রত রাখা।",

    pillar2Title: "জাতীয় মূলধারার সমন্বয়",
    pillar2Desc:
      "জাতীয় শিক্ষাক্রম অন্তর্ভুক্ত রেখে শিক্ষার্থীদের যুগোপযোগী ও মেধাভিত্তিক শিক্ষায় গড়ে তোলা।",

    pillar3Title: "আখলাক ও চরিত্র গঠন",
    pillar3Desc:
      "পাঠ্যক্রমের যাবতীয় অনৈসলামিক বিভ্রান্তি থেকে শিক্ষার্থীদের নৈতিকতা ও আখলাক সুরক্ষিত রাখা।",

    pillar4Title: "যৌক্তিক সংস্কার প্রস্তাবনা",
    pillar4Desc:
      "বাস্তব অভিজ্ঞতার আলোকে রাষ্ট্রের কাছে ইসলামী মূল্যবোধভিত্তিক শিক্ষাব্যবস্থার রূপরেখা পেশ করা।",

    ctaTitle: "আপনার সন্তানকে দ্বীনি ও আধুনিক শিক্ষায় গড়ে তুলতে চান?",
    ctaSubtitle:
      "আল-ঈমান স্কুলে ভর্তি এবং আমাদের শিক্ষা পদ্ধতি সম্পর্কে বিস্তারিত জানতে যোগাযোগ করুন।",
    ctaBtn: "ভর্তির তথ্য দেখুন",
  },
  en: {
    heroBadge: "Blend of Deen & Modern Education",
    heroTitle: "Purpose of Establishing Al-Eman School",
    heroSubtitle:
      "A pioneering ideological educational institution for protecting Faith, Creed, and Moral Education.",

    statementTitle: "Background & Core Purpose of Establishment",
    statementQuote:
      "The primary purpose of establishing Al-Eman School is not merely to deliver conventional lessons; rather, it is to bring about positive reform in the national curriculum through a synthesis of Islamic consciousness and modern education.",
    para1:
      "In conventional educational systems, worldly ideologies have often been prioritized in ways that weaken the depth of students' relationship with Allah Almighty and obscure pure Islamic Aqeedah. Through Al-Eman School, we aim to clarify why an ideological educational institution is essential today to protect Faith, Creed, and Moral Values.",
    para2:
      "We incorporate the national curriculum so that our students remain connected to the national mainstream. Through this practical experience, we aim to present logical proposals to the state for transforming education based on Islamic values.",
    para3:
      "Secondly, while fulfilling state obligations by following the mandated curriculum, our highest priority remains safeguarding students' Iman and Akhlaq from all textbook ambiguities and un-Islamic ideas.",

    pillarsTitle: "Our Core Pillars",
    pillarsSubtitle:
      "The ideological foundation upon which our educational system operates",

    pillar1Title: "Preservation of Iman & Aqeedah",
    pillar1Desc:
      "Nurturing deep devotion to Allah Almighty and pure Islamic creed in students' hearts.",

    pillar2Title: "Integration with Mainstream Curriculum",
    pillar2Desc:
      "Keeping students connected to national education with modern competency.",

    pillar3Title: "Moral & Character Building (Akhlaq)",
    pillar3Desc:
      "Protecting students' ethics and morality from un-Islamic influences in modern study materials.",

    pillar4Title: "Advocating Educational Reform",
    pillar4Desc:
      "Presenting constructive proposals to the state for value-based educational reform.",

    ctaTitle: "Ready to nurture your child with Islamic values & excellence?",
    ctaSubtitle:
      "Contact us to learn more about admission procedures and our curriculum approach.",
    ctaBtn: "View Admission Info",
  },
} as const;

/* ---------- Icons (react-icons) ---------- */
const pillarIcons = [FaShieldHalved, FaGraduationCap, FaCompass, FaBookOpen] as const;

/* ---------- Motion variants (hoisted for performance) ---------- */
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

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 130, damping: 22 },
  },
};

const reduced: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
};

/* ---------- Main Component ---------- */
const AboutPage = memo(() => {
  const { language = "bn" } = useLanguage(); // Default fallback
  const currentLang = (language === "en" ? "en" : "bn") as Language;
  const t = pageTranslations[currentLang];
  const reduceMotion = useReducedMotion();

  const rise = reduceMotion ? reduced : riseVariants;
  const row = reduceMotion ? reduced : rowVariants;
  const section = sectionVariants;

  const pillars = [
    { title: t.pillar1Title, desc: t.pillar1Desc },
    { title: t.pillar2Title, desc: t.pillar2Desc },
    { title: t.pillar3Title, desc: t.pillar3Desc },
    { title: t.pillar4Title, desc: t.pillar4Desc },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[#c9a961]/20 selection:text-[#a8874a]">
      {/* ───────────────────────── 1. HERO MASTHEAD ───────────────────────── */}
      <section
        aria-labelledby="about-hero-heading"
        className="relative overflow-hidden border-b border-border/70 bg-gradient-to-b from-background via-background to-muted/20"
      >
        {/* Soft Ambient Radial Wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 20% 15%, rgba(201,169,97,0.12), transparent 60%)",
          }}
        />

        <motion.div
          variants={section}
          initial="hidden"
          animate="show"
          className="relative mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 pb-16 pt-20 sm:px-8 sm:pb-20 sm:pt-24 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:gap-14 md:pt-28"
        >
          {/* Left Column */}
          <div className="flex flex-col">
            <motion.div
              variants={rise}
              className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a8874a] dark:text-[#d4b878]"
            >
              <span>01</span>
              <span aria-hidden="true" className="h-px w-8 bg-current opacity-50" />
              <span>{t.heroBadge}</span>
            </motion.div>

            <motion.h1
              id="about-hero-heading"
              variants={rise}
              className="text-balance text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-[2.9rem] md:leading-[1.12]"
            >
              {t.heroTitle}
            </motion.h1>
          </div>

          {/* Right Column */}
          <motion.p
            variants={rise}
            className="max-w-md self-end text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]"
          >
            {t.heroSubtitle}
          </motion.p>
        </motion.div>
      </section>

      {/* ───────────────────────── 2. STATEMENT & BODY ───────────────────────── */}
      <section
        aria-labelledby="about-statement-heading"
        className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24"
      >
        <motion.div
          variants={section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:gap-16"
        >
          {/* Main Content */}
          <div className="order-2 md:order-1">
            <motion.div
              variants={rise}
              className="mb-8 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a8874a] dark:text-[#d4b878]"
            >
              <span>02</span>
              <span aria-hidden="true" className="h-px w-8 bg-current opacity-50" />
              <h2 id="about-statement-heading">{t.statementTitle}</h2>
            </motion.div>

            <motion.p
              variants={rise}
              className="relative max-w-[62ch] pl-6 text-base leading-[1.75] text-foreground/90 sm:text-lg"
            >
              <span
                aria-hidden="true"
                className="absolute -left-1 top-1 select-none font-serif text-4xl leading-none text-[#a8874a]/60 dark:text-[#d4b878]/60"
              >
                “
              </span>
              {t.para1}
            </motion.p>

            <div className="mt-8 max-w-[62ch] space-y-6 text-sm leading-[1.85] text-muted-foreground sm:text-base">
              <motion.p variants={rise}>{t.para2}</motion.p>
              <motion.p variants={rise}>{t.para3}</motion.p>
            </div>
          </div>

          {/* Pull Quote */}
          <motion.figure
            variants={rise}
            className="order-1 md:order-2 md:sticky md:top-24 md:self-start"
          >
            <div className="border-l-2 border-[#c9a961]/70 pl-5 sm:pl-6">
              <blockquote className="text-[0.95rem] font-medium italic leading-relaxed text-foreground/90 sm:text-base">
                {t.statementQuote}
              </blockquote>
              <figcaption className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <cite className="not-italic">Al-Eman School</cite>
              </figcaption>
            </div>
          </motion.figure>
        </motion.div>
      </section>

      {/* ───────────────────────── 3. PILLARS SECTION ───────────────────────── */}
      <section
        aria-labelledby="about-pillars-heading"
        className="border-y border-border/70 bg-muted/15"
      >
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <motion.div
            variants={section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] md:gap-16"
          >
            <motion.div
              variants={rise}
              className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a8874a] dark:text-[#d4b878]"
            >
              <span>03</span>
              <span aria-hidden="true" className="h-px w-8 bg-current opacity-50" />
              <h2 id="about-pillars-heading">{t.pillarsTitle}</h2>
            </motion.div>
            <motion.p
              variants={rise}
              className="max-w-md text-sm leading-relaxed text-muted-foreground"
            >
              {t.pillarsSubtitle}
            </motion.p>
          </motion.div>

          <motion.ol
            variants={section}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            className="divide-y divide-border/70 border-y border-border/70"
          >
            {pillars.map((p, i) => {
              const Icon = pillarIcons[i];
              const num = String(i + 1).padStart(2, "0");
              return (
                <motion.li
                  key={num}
                  variants={row}
                  className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2 py-7 sm:grid-cols-[4rem_auto_minmax(0,1fr)] sm:gap-x-10 sm:py-9"
                >
                  <span
                    aria-hidden="true"
                    className="col-start-1 row-start-1 font-mono text-xs tracking-[0.15em] text-muted-foreground transition-colors duration-300 group-hover:text-[#a8874a] dark:group-hover:text-[#d4b878] sm:text-sm"
                  >
                    {num}
                  </span>

                  <span
                    aria-hidden="true"
                    className="col-start-2 row-start-1 inline-flex h-9 w-9 items-center justify-center self-start rounded-full border border-border bg-background text-[#a8874a] transition-colors duration-300 group-hover:border-[#c9a961]/60 group-hover:bg-[#c9a961]/10 dark:text-[#d4b878] sm:col-start-2 sm:h-10 sm:w-10"
                  >
                    <Icon className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem]" />
                  </span>

                  <div className="col-span-2 col-start-1 row-start-2 sm:col-span-1 sm:col-start-3 sm:row-start-1">
                    <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
                      {p.desc}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </motion.ol>
        </div>
      </section>

      {/* ───────────────────────── 4. CTA SECTION ───────────────────────── */}
      <section
        aria-labelledby="about-cta-heading"
        className="relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(201,169,97,0.10), transparent 65%)",
          }}
        />
        {/* <motion.div
          variants={section}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="relative mx-auto max-w-5xl px-5 py-24 sm:px-8 sm:py-28"
        >
          <div className="border-l-2 border-[#c9a961]/70 pl-6 sm:pl-10">
            <motion.h2
              id="about-cta-heading"
              variants={rise}
              className="max-w-3xl text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl"
            >
              {t.ctaTitle}
            </motion.h2>

            <motion.p
              variants={rise}
              className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              {t.ctaSubtitle}
            </motion.p>

            <motion.div variants={rise} className="mt-8">
              <Link
                href="/admission"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[#a8874a] outline-none transition-colors duration-200 hover:text-[#8f6f38] focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#c9a961] focus-visible:ring-offset-4 focus-visible:ring-offset-background dark:text-[#d4b878] dark:hover:text-[#e6cf9a]"
              >
                <span className="relative">
                  {t.ctaBtn}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 h-px w-0 bg-current transition-all duration-300 ease-out group-hover:w-full"
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
        </motion.div> */}
      </section>
    </main>
  );
});

AboutPage.displayName = "AboutPage";

export default AboutPage;