"use client";

import { motion } from "framer-motion";
import {
  FaBookOpen,
  FaUserShield,
  FaGraduationCap,
  FaLaptopCode,
  FaBell,
  FaQuoteLeft,
} from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";

// ============ Multilingual Data Source ============
const homeSectionsData = {
  bn: [
    {
      id: "about",
      title: "দ্বীনি শিক্ষা ও আধুনিক প্রযুক্তির এক অভূতপূর্ব সমন্বয়",
      subtitle: "পরিচিতি ও মূল ভিশন",
      desc: "আমাদের মূল লক্ষ্য হলো জাতীয় কারিকুলাম অনুসরণ করে আধুনিক সুসমন্বিত শিক্ষার পাশাপাশি শিক্ষার্থীদের মধ্যে ইসলামী আখলাক ও সুন্নাহর অনুশাসন গড়ে তোলা। উন্নত প্রযুক্তির মাধ্যমে আমরা শিক্ষার্থীদের জন্য একটি নিরাপদ ও মানসম্মত শিক্ষার পরিবেশ নিশ্চিত করি।",
      hadith:
        "যে ব্যক্তি জ্ঞান অর্জনের উদ্দেশ্যে কোনো পথ অবলম্বন করে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন।",
      reference: "সহীহ মুসলিম: ২৬৯৯",
      image: "/Image/Al-iman-image.jpeg?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "ইসলামিক পরিবেশ ও পড়াশোনা",
      icon: FaBookOpen,
      accentColor: "emerald",
    },
    {
      id: "portals",
      title: "স্বচ্ছতা ও সহজ ব্যবস্থাপনায় আমাদের সমন্বিত ডিজিটাল পোর্টাল",
      subtitle: "ডিজিটাল একাডেমি ও ইআরপি প্যানেল",
      desc: "অভিভাবক, শিক্ষক ও প্রতিষ্ঠানের মধ্যকার ডিজিটাল সেতু তৈরি করতে আমাদের সিস্টেমে রয়েছে পৃথক প্যানেল। অভিভাবকরা ঘরে বসেই উপস্থিতি, বকেয়া ফি পরিশোধ এবং রেজাল্ট ট্র্যাকিং করতে পারেন। শিক্ষকরা ডিজিটাল পদ্ধতিতে সহজে হাজিরা ও মার্কস ইনপুট প্রদান করতে পারেন।",
      hadith:
        "তোমাদের প্রত্যেকেই দায়িত্বশীল এবং প্রত্যেকেই নিজ নিজ দায়িত্ব সম্পর্কে জিজ্ঞাসিত হবে।",
      reference: "সহীহ বুখারী: ২৫৫৮",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "ডিজিটাল পোর্টাল ব্যবহার",
      icon: FaUserShield,
      accentColor: "blue",
    },
    {
      id: "results",
      title: "সঠিক মূল্যায়ন ও ফলাফলের ডিজিটাল রূপান্তর",
      subtitle: "স্বয়ংক্রিয় রেজাল্ট ও মেধা মূল্যায়ন",
      desc: "আমাদের অটোমেটেড এক্সাম প্রসেসিং মডিউলের মাধ্যমে বিষয়ভিত্তিক ও শিফটভিত্তিক গ্রেডিং, জিপিএ এবং মেধা ক্রম (Merit List) নির্ভুলভাবে তৈরি করা হয়। অভিভাবকরা ড্যাশবোর্ড থেকেই সরাসরি স্কুলের প্যাডসহ প্রোগ্রেস রিপোর্ট ও মার্কশিট পিডিএফ ডাউনলোড করতে পারেন।",
      hadith: null,
      reference: null,
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "রেজাল্ট ও মূল্যায়ন",
      icon: FaGraduationCap,
      accentColor: "purple",
    },
    {
      id: "admission",
      title: "আগামীর আলোকিত দিনের জন্য সহজ ভর্তি প্রক্রিয়া",
      subtitle: "অনলাইন ভর্তি মডিউল",
      desc: "ঘরে বসেই নতুন শিক্ষাবর্ষের জন্য ডিজিটাল ফর্ম পূরণ, প্রয়োজনীয় ফাইল ও ছবি আপলোড এবং নিরাপদ পেমেন্ট গেটওয়ের মাধ্যমে আবেদন ফি পরিশোধের পূর্ণাঙ্গ সুবিধা রয়েছে। সম্পূর্ণ প্রক্রিয়াটি অত্যন্ত সহজ, দ্রুত এবং নিরাপদ।",
      hadith: "তোমরা সহজ করো, কঠিন করো না; সুসংবাদ দাও, বিদ্বেষ সৃষ্টি করো না।",
      reference: "সহীহ বুখারী: ৬৯",
      image: "/Image/Al-iman-image-2.jpeg?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "অনলাইন ভর্তি প্রক্রিয়া",
      icon: FaLaptopCode,
      accentColor: "amber",
    },
    {
      id: "communication",
      title: "তাৎক্ষণিক নোটিশ ও ডিজিটাল মেসেজিং সেবা",
      subtitle: "স্মার্ট যোগাযোগব্যবস্থা",
      desc: "জরুরি একাডেমিক নোটিশ, ছুটির তালিকা, উপস্থিতি এবং ফি জমা দেওয়ার তথ্য এসএমএসের মাধ্যমে অভিভাবকদের কাছে সঙ্গে সঙ্গে পৌঁছে দেওয়া হয়। ফলে প্রতিষ্ঠানের সাথে অভিভাবকদের সার্বক্ষণিক একটি নিরাপদ ও শক্তিশালী যোগাযোগ বজায় থাকে।",
      hadith: null,
      reference: null,
      image:
        "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "ডিজিটাল মেসেজিং ও নোটিশ",
      icon: FaBell,
      accentColor: "rose",
    },
  ],
  en: [
    {
      id: "about",
      title: "An Unprecedented Blend of Islamic Values & Modern Technology",
      subtitle: "About & Core Vision",
      desc: "Our primary objective is to nurture Islamic character and Sunnah values alongside modern integrated education under the national curriculum. Using advanced technology, we ensure a safe and quality learning environment for students.",
      hadith:
        "Whoever takes a path upon which he seeks knowledge, Allah will make the path to Paradise easy for him.",
      reference: "Sahih Muslim: 2699",
      image: "/Image/Al-iman-image.jpeg?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Islamic Environment & Education",
      icon: FaBookOpen,
      accentColor: "emerald",
    },
    {
      id: "portals",
      title: "Integrated Digital Portals for Transparency & Easy Management",
      subtitle: "Digital Academy & ERP Portals",
      desc: "Our system provides separate portals to build a digital bridge between parents, teachers, and administration. Parents can track attendance, pay pending fees, and view results from home while teachers easily submit attendance and exam marks digitally.",
      hadith:
        "Every one of you is a guardian and is responsible for his charges.",
      reference: "Sahih al-Bukhari: 2558",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Digital Portal Usage",
      icon: FaUserShield,
      accentColor: "blue",
    },
    {
      id: "results",
      title: "Digital Transformation of Accurate Evaluation & Results",
      subtitle: "Automated Result & Merit Evaluation",
      desc: "Our automated exam processing module accurately calculates subject-wise and shift-wise grading, GPA, and Merit Lists. Parents can directly download progress reports and PDF marksheet cards right from their dashboards.",
      hadith: null,
      reference: null,
      image:
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Results & Evaluation",
      icon: FaGraduationCap,
      accentColor: "purple",
    },
    {
      id: "admission",
      title: "Seamless Online Admission for a Brighter Tomorrow",
      subtitle: "Online Admission Module",
      desc: "Fill digital application forms from home, upload required documents and photos, and complete payment via secure payment gateways. The entire process is extremely simple, fast, and secure.",
      hadith:
        "Make things easy for people and do not make them difficult; give good tidings and do not repel them.",
      reference: "Sahih al-Bukhari: 69",
      image: "/Image/Al-iman-image-2.jpeg?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Online Admission Process",
      icon: FaLaptopCode,
      accentColor: "amber",
    },
    {
      id: "communication",
      title: "Instant Notice & Digital Messaging Services",
      subtitle: "Smart Communication System",
      desc: "Urgent academic notices, holiday lists, attendance updates, and fee alerts are delivered directly to parents via SMS. This ensures constant, reliable, and secure communication between parents and the institute.",
      hadith: null,
      reference: null,
      image:
        "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Digital Messaging & Notices",
      icon: FaBell,
      accentColor: "rose",
    },
  ],
};

// Helper: Get accent color classes
const getAccentStyles = (color: string) => {
  const styles = {
    emerald: {
      badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      icon: "text-emerald-400",
      glow: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/20",
      quote:
        "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20",
      quoteText: "text-emerald-200/90",
      quoteRef: "text-emerald-400",
      imageGlow: "from-emerald-500/20 to-emerald-500/10",
      accent: "bg-emerald-500",
      hoverGlow: "hover:shadow-emerald-500/20",
    },
    blue: {
      badge: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      icon: "text-blue-400",
      glow: "from-blue-500/20 to-blue-500/5",
      border: "border-blue-500/20",
      quote:
        "from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20",
      quoteText: "text-blue-200/90",
      quoteRef: "text-blue-400",
      imageGlow: "from-blue-500/20 to-blue-500/10",
      accent: "bg-blue-500",
      hoverGlow: "hover:shadow-blue-500/20",
    },
    purple: {
      badge: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      icon: "text-purple-400",
      glow: "from-purple-500/20 to-purple-500/5",
      border: "border-purple-500/20",
      quote:
        "from-purple-500/10 via-purple-500/5 to-transparent border-purple-500/20",
      quoteText: "text-purple-200/90",
      quoteRef: "text-purple-400",
      imageGlow: "from-purple-500/20 to-purple-500/10",
      accent: "bg-purple-500",
      hoverGlow: "hover:shadow-purple-500/20",
    },
    amber: {
      badge: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      icon: "text-amber-400",
      glow: "from-amber-500/20 to-amber-500/5",
      border: "border-amber-500/20",
      quote:
        "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20",
      quoteText: "text-amber-200/90",
      quoteRef: "text-amber-400",
      imageGlow: "from-amber-500/20 to-amber-500/10",
      accent: "bg-amber-500",
      hoverGlow: "hover:shadow-amber-500/20",
    },
    rose: {
      badge: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      icon: "text-rose-400",
      glow: "from-rose-500/20 to-rose-500/5",
      border: "border-rose-500/20",
      quote:
        "from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/20",
      quoteText: "text-rose-200/90",
      quoteRef: "text-rose-400",
      imageGlow: "from-rose-500/20 to-rose-500/10",
      accent: "bg-rose-500",
      hoverGlow: "hover:shadow-rose-500/20",
    },
  };
  return styles[color as keyof typeof styles] || styles.emerald;
};

// Variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 120,
      mass: 0.8,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95, rotateY: -5 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 100,
      delay: 0.3,
      mass: 1,
    },
  },
};

export default function ExtraSection() {
  const { language } = useLanguage();
  const currentSections = homeSectionsData[language] || homeSectionsData.bn;

  return (
    <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-20 md:py-32 space-y-32 md:space-y-44 overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />

      {currentSections.map((section, index) => {
        const isEven = index % 2 === 0;
        const IconComponent = section.icon;
        const accent = getAccentStyles(section.accentColor || "emerald");

        return (
          <section
            key={section.id}
            className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div
              className={`flex flex-col ${
                isEven ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-16 lg:gap-24`}
            >
              {/* Text Content Area */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-120px", amount: 0.2 }}
                variants={containerVariants}
                className="flex-1 space-y-8 text-left"
              >
                {/* Subtitle Badge */}
                <motion.div
                  variants={itemVariants}
                  className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-full ${accent.badge} border backdrop-blur-sm`}
                >
                  <IconComponent className={`${accent.icon} size-4`} />
                  <span className="text-xs md:text-sm font-medium tracking-wider uppercase">
                    {section.subtitle}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h2
                  variants={itemVariants}
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.08]"
                >
                  {section.title}
                </motion.h2>

                {/* Divider */}
                <motion.div
                  variants={itemVariants}
                  className={`w-12 h-1 ${accent.accent} rounded-full opacity-60`}
                />

                {/* Main Description */}
                <motion.p
                  variants={itemVariants}
                  className="text-slate-300/90 text-base md:text-lg leading-relaxed max-w-2xl font-light"
                >
                  {section.desc}
                </motion.p>

                {/* Hadith Box (If Available) */}
                {section.hadith && (
                  <motion.div
                    variants={itemVariants}
                    className={`relative p-6 md:p-8 rounded-2xl bg-gradient-to-br ${accent.quote} border backdrop-blur-sm transition-all duration-500 hover:shadow-xl ${accent.hoverGlow} hover:scale-[1.01]`}
                  >
                    <FaQuoteLeft
                      className={`absolute top-5 right-5 ${accent.icon}/15 text-3xl`}
                    />
                    <p
                      className={`${accent.quoteText} text-sm md:text-base font-serif italic leading-relaxed pr-10`}
                    >
                      &ldquo;{section.hadith}&rdquo;
                    </p>
                    <span
                      className={`block mt-3 text-xs md:text-sm font-semibold ${accent.quoteRef} tracking-wide`}
                    >
                      — {section.reference}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* Image Visual Area */}
              <motion.div
                variants={imageVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className="flex-1 w-full perspective-1000"
              >
                <div
                  className={`relative group rounded-3xl overflow-hidden bg-slate-900/30 border ${accent.border} transition-all duration-700 hover:shadow-2xl ${accent.hoverGlow}`}
                >
                  {/* Animated gradient overlay */}
                  <motion.div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${accent.imageGlow} rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                    animate={{
                      opacity: [0, 0.5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <div className="relative h-72 sm:h-80 md:h-96 lg:h-[480px] w-full overflow-hidden rounded-3xl">
                    <motion.img
                      src={section.image}
                      alt={section.imageAlt}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        type: "spring",
                        damping: 30,
                        stiffness: 150,
                        mass: 0.5,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 to-transparent opacity-30" />

                    {/* Floating accent dot */}
                    <motion.div
                      className={`absolute bottom-6 right-6 w-3 h-3 ${accent.accent} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
