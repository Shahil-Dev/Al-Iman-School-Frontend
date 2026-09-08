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
  FaAward
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useLanguage } from "@/src/context/LanguageContext"; // Context Import

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
      image: "/Image/al-iman hero-2.jpeg",
      speaker: {
        quote:
          "True education expands the intellect while purifying the soul. Our goal is to craft future leaders who shine in both Dunya and Akhirah.",
        name: "Dr. Al-Hasan Mahmood",
        role: "Islamic Scholar & Chief Advisor",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
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
      image: "/Image/al-iman hero-2.jpeg",
      speaker: {
        quote:
          "প্রকৃত শিক্ষা আত্মার পরিশুদ্ধির সাথে সাথে বুদ্ধিমত্তার বিকাশ ঘটায়। আমাদের লক্ষ্য এমন নেতা তৈরি করা যারা দুনিয়া ও আখিরাত উভয় ক্ষেত্রেই সফল হবেন।",
        name: "ড. আল-হাসান মাহমুদ",
        role: "ইসলামিক স্কলার ও প্রধান উপদেষ্টা",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
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
      ctaText: "ভর্তি আবেদন",
      ctaLink: "/admission",
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
  image: string;
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
    [mouseX, mouseY, reduceMotion]
  );

  const gradientX = useTransform(springX, (x) => x ?? 0);
  const gradientY = useTransform(springY, (y) => y ?? 0);

  const background = useTransform(
    [gradientX, gradientY],
    ([latestX, latestY]) =>
      `radial-gradient(circle at ${latestX}px ${latestY}px, rgba(79, 70, 229, 0.25), transparent 80%)`
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
          transition={{ delay: 0.2, duration: 1, type: "spring", ...SPRING_CONFIG }}
          className="relative flex flex-col items-center"
        >
          <div className="relative w-28 h-28 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full p-1.5 bg-white/10 border border-white/20 mb-6 md:mb-8 overflow-hidden backdrop-blur-md">
            <Image
              src={slide.image}
              alt="Al-Iman School Logo"
              width={192}
              height={192}
              className="w-full h-full object-cover rounded-full relative z-10"
              priority
            />
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight">
            {slide.tagline}
          </h1>
          <p className="mt-4 md:mt-6 text-indigo-200 font-medium text-sm md:text-xl tracking-wide max-w-3xl">
            {slide.subTagline}
          </p>
        </motion.div>
      </div>
    );
  }

  if (slide.type === "speaker" && slide.speaker) {
    return (
      <div className="w-full max-w-6xl mx-auto h-full flex flex-col justify-between py-6 md:py-10 relative">
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4 md:px-12 my-auto">
          <div className="p-3 md:p-4 rounded-full bg-amber-400/10 text-amber-300 mb-4 md:mb-6 border border-amber-400/20 backdrop-blur-md">
            <FaQuoteLeft className="text-2xl md:text-4xl" />
          </div>
          <blockquote className="text-xl md:text-3xl lg:text-4xl font-serif italic text-white leading-relaxed max-w-4xl tracking-wide">
            &ldquo;{slide.speaker.quote}&rdquo;
          </blockquote>
        </div>
        <div className="self-end flex items-center gap-4 bg-slate-900/80 p-3 md:p-4 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl mt-6">
          <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
            <img src={slide.speaker.image} alt={slide.speaker.name} className="object-cover w-full h-full" />
          </div>
          <div className="pr-2 md:pr-4">
            <h4 className="text-white font-bold text-base md:text-xl">{slide.speaker.name}</h4>
            <p className="text-amber-300/90 text-xs md:text-sm font-medium">{slide.speaker.role}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.15] mb-4 md:mb-6 tracking-tight">
        {slide.title} <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
          {slide.highlight}
        </span>
      </h1>
      <p className="text-slate-200 text-sm md:text-xl max-w-2xl font-normal mb-6 md:mb-8 leading-relaxed">
        {slide.desc}
      </p>
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
        {slide.ctaLink && (
          <Link
            href={slide.ctaLink}
            className="inline-flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg text-sm md:text-base"
          >
            {slide.ctaText}
            <FaArrowRight size={16} />
          </Link>
        )}
        {slide.stats && (
          <div className="flex gap-8 md:gap-10 border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-10">
            {slide.stats.map((stat, i) => (
              <div key={i} className="flex items-start gap-3">
                {stat.icon && (
                  <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <stat.icon size={18} />
                  </div>
                )}
                <div>
                  <p className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">{stat.value}</p>
                  <p className="text-[10px] md:text-[11px] uppercase tracking-wider text-amber-200/80 font-medium mt-1">
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
  const { language } = useLanguage(); // Context থেকে ল্যাঙ্গুয়েজ রিড করা হচ্ছে

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
    setCurrent((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
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
      className="h-[75vh] lg:h-screen w-full relative overflow-hidden flex items-center justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-full min-h-screen lg:min-h-[92vh] w-full lg:w-[98%] lg:mx-auto lg:mt-[2vh] lg:rounded-[24px] overflow-hidden shadow-2xl">
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
        <div className="relative z-10 h-full w-full flex items-center justify-center pt-28 pb-16 md:pt-36 lg:pt-40 lg:pb-20 px-6 md:px-12 lg:px-24">
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
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-14 md:h-14 rounded-full bg-black/20 hover:bg-indigo-600 border border-white/20 flex items-center justify-center text-white backdrop-blur-md"
        >
          <FaChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-14 md:h-14 rounded-full bg-black/20 hover:bg-indigo-600 border border-white/20 flex items-center justify-center text-white backdrop-blur-md"
        >
          <FaChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}