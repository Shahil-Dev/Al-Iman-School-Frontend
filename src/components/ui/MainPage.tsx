"use client";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  FaGraduationCap,
  FaArrowRight,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaClock,
  FaChartLine,
  FaQuoteLeft,
  FaAward,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useLanguage } from "@/src/context/LanguageContext";

// ============ Multilingual Data ============
const slidesData = {
  en: [
    {
      id: 1,
      type: "brand",
      image: "/Image/logo aliman.jpg",
      tagline: "Al-Iman School & College",
      subTagline:
        "A Modern Educational Institute with Islamic Values (Following National Curriculum Bangla Version)",
    },
    {
      id: 2,
      type: "academics",
      title: "Nurturing Knowledge,",
      highlight: "Guided by Sunnah",
      desc: "Empowering young minds with modern academic excellence while grounding them deeply in Islamic moral values and character building.",
      image: "/Image/al-iman hero-3.jpeg",
      icon: FaGraduationCap,
      stats: [
        { value: "100%", label: "Pass Rate", icon: FaChartLine },
        { value: "A+", label: "Academic Distinction", icon: FaStar },
      ],
      ctaText: "Explore Academics",
      ctaLink: "/academics",
    },
    {
      id: 3,
      type: "speaker",
      image: "/Image/Shayek Harun Izhar.png",
      speaker: {
        quote:
          "True education expands the intellect while purifying the soul. Our goal is to craft future leaders who shine in both Dunya and Akhirah.",
        name: "Shayek Harun Izhar",
        role: "Islamic Scholar & Principal",
      },
    },
    {
      id: 4,
      type: "admission",
      title: "Build a Strong Foundation",
      highlight: "For Bright Tomorrow",
      desc: "Admissions are open for the upcoming academic session 2026-2027. Secure your child's seat in an environment of excellence.",
      image: "/Image/al-iman hero-4.jpeg",
      icon: FaAward,
      stats: [
        { value: "2000+", label: "Students", icon: FaUsers },
        { value: "25+", label: "Years Experience", icon: FaClock },
      ],
      ctaText: "Apply Now",
      ctaLink: "/admission",
    },
  ],
  bn: [
    {
      id: 1,
      type: "brand",
      image: "/Image/logo aliman.jpg",
      tagline: "আল-ঈমান স্কুল অ্যান্ড কলেজ",
      subTagline:
        "ইসলামী মূল্যবোধসম্পন্ন একটি আধুনিক শিক্ষা প্রতিষ্ঠান (জাতীয় শিক্ষাক্রম বাংলা মাধ্যম অনুসরণীয়)",
    },
    {
      id: 2,
      type: "academics",
      title: "জ্ঞানের আলোয় উদ্ভাসিত,",
      highlight: "সুন্নাহর পথ প্রদর্শনে",
      desc: "ইসলামী নৈতিক মূল্যবোধ ও চরিত্র গঠনের পাশাপাশি আধুনিক একাডেমিক উৎকর্ষতায় তরুণ মনকে সমৃদ্ধ করা আমাদের মূল লক্ষ্য।",
      image: "/Image/al-iman hero-3.jpeg",
      icon: FaGraduationCap,
      stats: [
        { value: "১০০%", label: "পাসের হার", icon: FaChartLine },
        { value: "এ+", label: "একাডেমিক সাফল্য", icon: FaStar },
      ],
      ctaText: "একাডেমিক তথ্য",
      ctaLink: "/academics",
    },
    {
      id: 3,
      type: "speaker",
      image: "/Image/Shayek Harun Izhar.png",
      speaker: {
        quote:
          "আমরা আল-ঈমান স্কুল প্রতিষ্ঠা করেছি জাতীয় মূল সিলেবাসকে প্রভাবিত করে সংস্কারের উদ্দেশ্যে। আমাদের লক্ষ্য হলো এমন শিক্ষার্থীদের গড়ে তোলা যারা দুনিয়াতেও এবং আখিরাতেও আলোকিত হবে।",
        name: "শায়েক হারুন ইজহার",
        role: "অধ্যক্ষ আল ঈমান স্কুল অ্যান্ড কলেজ",
      },
    },
    {
      id: 4,
      type: "admission",
      title: "দৃঢ় ভিত্তির ওপর গড়ে উঠুক",
      highlight: "উজ্জ্বল ভবিষ্যৎ",
      desc: "আগামী শিক্ষাবর্ষ ২০২৬-২০২৭ এর জন্য ভর্তি চলছে। একটি আদর্শ ও উৎকর্ষ পরিবেশে আপনার সন্তানের আসন নিশ্চিত করুন।",
      image: "/Image/al-iman hero-4.jpeg",
      icon: FaAward,
      stats: [
        { value: "২০০০+", label: "শিক্ষার্থী", icon: FaUsers },
        { value: "২৫+", label: "বছরের অভিজ্ঞতা", icon: FaClock },
      ],
    
   
    },
  ],
};

// ============ Constants & Types ============
interface SlideStats {
  value: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface Speaker {
  name: string;
  role: string;
  quote: string;
}

interface Slide {
  id: number;
  type: "brand" | "academics" | "speaker" | "admission";
  title?: string;
  highlight?: string;
  desc?: string;
  image: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  tagline?: string;
  subTagline?: string;
  stats?: SlideStats[];
  ctaText?: string;
  ctaLink?: string;
  speaker?: Speaker;
}

const SPRING_CONFIG = { damping: 25, stiffness: 150, mass: 0.5 };
const AUTOPLAY_DELAY = 6000;

// ============ Mouse Gradient ============
const MouseTrackingGradient = memo(() => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const springX = useSpring(mouseX, SPRING_CONFIG);
  const springY = useSpring(mouseY, SPRING_CONFIG);
  const reduceMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current || reduceMotion) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    },
    [mouseX, mouseY, reduceMotion],
  );

  const gradientX = useTransform(springX, (x) => x ?? 0);
  const gradientY = useTransform(springY, (y) => y ?? 0);

  const background = useTransform(
    [gradientX, gradientY],
    ([latestX, latestY]) =>
      `radial-gradient(circle at ${latestX}px ${latestY}px, rgba(79, 70, 229, 0.25), transparent 80%)`,
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 overflow-hidden bg-[#0F172A]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#090D16]" />
      <motion.div className="absolute inset-0" style={{ background }} />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
});
MouseTrackingGradient.displayName = "MouseTrackingGradient";

// ============ Slide Content Component ============
const SlideContent = memo(({ slide }: { slide: Slide }) => {
  const reduceMotion = useReducedMotion();

  if (slide.type === "brand") {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.2,
            duration: 1,
            type: "spring",
            ...SPRING_CONFIG,
          }}
          className="relative flex flex-col items-center"
        >
          <div className="relative w-24 h-24 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full p-1.5 bg-white/10 border border-white/20 mb-4 md:mb-8 overflow-hidden backdrop-blur-md">
            <Image
              src={slide.image}
              alt="Al-Iman School Logo"
              width={192}
              height={192}
              className="w-full h-full object-cover rounded-full relative z-10"
              priority
            />
          </div>
          <h1 className="text-2xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
            {slide.tagline}
          </h1>
          <p className="mt-3 md:mt-6 text-indigo-200 font-medium text-xs md:text-xl tracking-wide max-w-3xl">
            {slide.subTagline}
          </p>
        </motion.div>
      </div>
    );
  }

  if (slide.type === "speaker" && slide.speaker) {
    return (
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 px-2 md:px-8">
        {/* Quote Section */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <div className="p-2.5 md:p-3.5 rounded-2xl bg-amber-400/10 text-amber-300 mb-3 md:mb-6 border border-amber-400/20 backdrop-blur-md">
            <FaQuoteLeft className="text-xl md:text-3xl" />
          </div>
          <blockquote className="text-sm md:text-2xl lg:text-3xl font-serif italic text-slate-100 leading-relaxed tracking-wide mb-4 md:mb-6">
            &ldquo;{slide.speaker.quote}&rdquo;
          </blockquote>
          <div>
            <h3 className="text-amber-400 font-bold text-base md:text-2xl tracking-wide">
              {slide.speaker.name}
            </h3>
            <p className="text-slate-300 text-xs md:text-base mt-0.5 md:mt-1 font-medium">
              {slide.speaker.role}
            </p>
          </div>
        </div>

        {/* Photocard Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative group shrink-0"
        >
          {/* Card Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-indigo-500/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-500" />

          <div className="relative w-48 h-64 md:w-72 md:h-96 rounded-2xl bg-slate-900/60 border border-white/15 p-3 md:p-4 backdrop-blur-xl shadow-2xl flex flex-col justify-end overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />

            <Image
              src={slide.image}
              alt={slide.speaker.name}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            />

            <div className="relative z-20 text-center pb-1 md:pb-2">
              <span className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] md:text-xs font-semibold backdrop-blur-md mb-1 md:mb-2">
                Principle
              </span>
              <h4 className="text-white font-bold text-xs md:text-xl drop-shadow-md">
                {slide.speaker.name}
              </h4>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.15] mb-3 md:mb-6 tracking-tight">
        {slide.title} <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
          {slide.highlight}
        </span>
      </h1>
      <p className="text-slate-200 text-xs md:text-xl max-w-2xl font-normal mb-5 md:mb-8 leading-relaxed">
        {slide.desc}
      </p>
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
        {slide.ctaLink && (
          <Link
            href={slide.ctaLink}
            className="inline-flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-xl transition-all shadow-lg text-xs md:text-base"
          >
            {slide.ctaText}
            <FaArrowRight size={14} />
          </Link>
        )}
        {slide.stats && (
          <div className="flex gap-6 md:gap-10 border-t md:border-t-0 md:border-l border-white/20 pt-3 md:pt-0 md:pl-10">
            {slide.stats.map((stat, i) => (
              <div key={i} className="flex items-start gap-2.5 md:gap-3">
                {stat.icon && (
                  <div className="p-2 md:p-2.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <stat.icon size={16} />
                  </div>
                )}
                <div>
                  <p className="text-xl md:text-4xl font-extrabold text-white tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[9px] md:text-[11px] uppercase tracking-wider text-amber-200/80 font-medium mt-0.5 md:mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
SlideContent.displayName = "SlideContent";

// ============ Main Component ============
export default function SchoolHero() {
  const { language } = useLanguage();

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reduceMotion = useReducedMotion();

  const activeSlides = slidesData[language] || slidesData["bn"];

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isPaused && !reduceMotion) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % activeSlides.length);
      }, AUTOPLAY_DELAY);
    }
  }, [isPaused, reduceMotion, activeSlides.length]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % activeSlides.length);
    startTimer();
  }, [startTimer, activeSlides.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrent(
      (prev) => (prev - 1 + activeSlides.length) % activeSlides.length,
    );
    startTimer();
  }, [startTimer, activeSlides.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTimer]);

  const currentSlide = activeSlides[current] || activeSlides[0];

  return (
    <section
      className="h-[85vh] lg:h-screen w-full relative overflow-hidden flex items-start lg:items-center justify-center pb-12 lg:pb-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-full w-full lg:w-[98%] lg:mx-auto lg:mt-[2vh] lg:rounded-[24px] overflow-hidden shadow-2xl">
        {/* Background Layer */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`bg-${current}-${language}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {currentSlide.type === "brand" ? (
              <MouseTrackingGradient />
            ) : currentSlide.type === "speaker" ? (
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#020617]">
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                  }}
                />
              </div>
            ) : (
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={currentSlide.image}
                  alt="Al-Iman School & College"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/70" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Content Layer */}
        <div className="relative z-10 h-full w-full flex items-center justify-center pt-20 pb-12 md:pt-36 lg:pt-40 lg:pb-20 px-4 md:px-12 lg:px-24">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`content-${current}-${language}`}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.6 }}
              className="w-full h-full flex flex-col justify-center"
            >
              <SlideContent slide={currentSlide} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-14 md:h-14 rounded-full bg-black/20 hover:bg-indigo-600 border border-white/20 flex items-center justify-center text-white backdrop-blur-md"
        >
          <FaChevronLeft size={16} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-14 md:h-14 rounded-full bg-black/20 hover:bg-indigo-600 border border-white/20 flex items-center justify-center text-white backdrop-blur-md"
        >
          <FaChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
