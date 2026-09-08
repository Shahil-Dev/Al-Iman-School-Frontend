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
  FaBookOpen,
  FaAward,
  FaArrowRight,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaUsers,
  FaClock,
  FaChartLine,
  FaMagic,
  FaUserShield,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback, memo } from "react";

// ============ Types ============
interface SlideStats {
  value: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface Slide {
  id: number;
  type: "brand" | "academics" | "facilities" | "admission";
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
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

// ============ Data ============
const slides: Slide[] = [
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
    title: "Empowering Minds,",
    highlight: "Shaping Futures",
    desc: "Combining modern academic curriculum with strong moral values to foster critical thinkers, innovators, and compassionate leaders.",
    image: "/Image/al-iman hero-3.jpeg",
    icon: FaGraduationCap,
    stats: [
      { value: "100%", label: "Pass Rate", icon: FaChartLine },
      { value: "A+", label: "Academic Distinction", icon: FaStar },
    ],
  },
  {
    id: 3,
    type: "facilities",
    title: "Modern Facilities,",
    highlight: "Holistic Growth",
    desc: "State-of-the-art science labs, multimedia classrooms, rich libraries, and sports fields for complete mental & physical development.",
    image: "/Image/al-iman hero-2.jpeg",
    icon: FaBookOpen,
    stats: [
      { value: "50+", label: "Expert Faculty", icon: FaUsers },
      { value: "Smart", label: "Classrooms", icon: FaBuilding },
    ],
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
  },
];

// ============ Constants ============
const SPRING_CONFIG = {
  damping: 25,
  stiffness: 150,
  mass: 0.5,
};

const AUTOPLAY_DELAY = 6000;

// ============ Sub-Components ============
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
      <motion.div
        className="absolute inset-0"
        style={{
          background: background,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      {!reduceMotion && (
        <>
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl"
          />
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl"
          />
        </>
      )}
    </div>
  );
});

MouseTrackingGradient.displayName = "MouseTrackingGradient";

const SlideContent = memo(({ slide }: { slide: Slide; slideIndex: number }) => {
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
          <motion.div
            animate={
              reduceMotion
                ? {}
                : {
                    boxShadow: [
                      "0 0 40px rgba(79, 70, 229, 0.2)",
                      "0 0 80px rgba(79, 70, 229, 0.4)",
                      "0 0 40px rgba(79, 70, 229, 0.2)",
                    ],
                  }
            }
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-28 h-28 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full p-1.5 bg-white/10 border border-white/20 mb-6 md:mb-8 overflow-hidden backdrop-blur-md"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-transparent" />
            <Image
              src={slide.image}
              alt="Al-Iman School Logo"
              width={192}
              height={192}
              className="w-full h-full object-cover rounded-full relative z-10"
              priority
            />
            <div className="absolute inset-0 rounded-full ring-1 ring-white/30" />
          </motion.div>

          <motion.h1
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.35,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight"
          >
            Al-Iman School & College
          </motion.h1>

          <motion.p
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 md:mt-6 text-indigo-200 font-medium text-sm md:text-xl tracking-wide flex items-center gap-2 justify-center"
          >
            {slide.subTagline}
          </motion.p>

          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.65,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          ></motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Slide Title */}
      <motion.h1
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.15] mb-4 md:mb-6 tracking-tight"
      >
        {slide.title} <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
          {slide.highlight}
        </span>
      </motion.h1>

      {/* Description */}
      <motion.p
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-slate-200 text-sm md:text-xl max-w-2xl font-normal mb-6 md:mb-8 leading-relaxed"
      >
        {slide.desc}
      </motion.p>

      {/* CTA & Stats Wrapper */}
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {slide.ctaLink && (
            <Link
              href={slide.ctaLink}
              className="group inline-flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm md:text-base hover:scale-[1.02] active:scale-[0.98]"
            >
              {slide.ctaText}
              <FaArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          )}
          {slide.secondaryCtaLink && (
            <Link
              href={slide.secondaryCtaLink}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-4 rounded-xl border border-white/20 transition-all backdrop-blur-md text-sm md:text-base hover:scale-[1.02] active:scale-[0.98]"
            >
              {slide.secondaryCtaText}
            </Link>
          )}
        </div>

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
                  <p className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[10px] md:text-[11px] uppercase tracking-wider text-amber-200/80 font-medium mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
});

SlideContent.displayName = "SlideContent";

// ============ Main Component ============
export default function SchoolHero() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reduceMotion = useReducedMotion();

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!isPaused && !reduceMotion) {
      intervalRef.current = setInterval(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
      }, AUTOPLAY_DELAY);
    }
  }, [isPaused, reduceMotion]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    startTimer();
  }, [startTimer]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    startTimer();
  }, [startTimer]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Autoplay timer
  useEffect(() => {
    startTimer();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTimer]);

  const currentSlide = slides[current];

  return (
    <section
      className="h-[70vh] lg:h-screen w-full relative overflow-hidden flex items-center justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="School hero carousel"
    >
      <div className="relative h-full min-h-screen lg:min-h-[92vh] w-full lg:w-[98%] lg:mx-auto lg:mt-[2vh] lg:rounded-[24px] overflow-hidden shadow-2xl">
        {/* Background Layer */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`bg-${current}`}
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
                <motion.div
                  initial={reduceMotion ? { scale: 1 } : { scale: 1.08 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: reduceMotion ? 0 : 6,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentSlide.image}
                    alt="Al-Iman School & College"
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-slate-950/70" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-transparent" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Content Layer */}
        <div className="relative z-10 h-full w-full flex items-center justify-center pt-28 pb-16 md:pt-36 lg:pt-40 lg:pb-20 px-6 md:px-12 lg:px-24">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`content-${current}`}
              initial={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: direction * 40 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: direction * -40 }
              }
              transition={{
                duration: reduceMotion ? 0 : 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full"
            >
              <SlideContent slide={currentSlide} slideIndex={current} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <motion.button
          onClick={handlePrev}
          whileHover={reduceMotion ? {} : { scale: 1.05 }}
          whileTap={reduceMotion ? {} : { scale: 0.95 }}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-14 md:h-14 rounded-full bg-black/20 hover:bg-indigo-600 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Previous slide"
        >
          <FaChevronLeft size={20} />
        </motion.button>
        <motion.button
          onClick={handleNext}
          whileHover={reduceMotion ? {} : { scale: 1.05 }}
          whileTap={reduceMotion ? {} : { scale: 0.95 }}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 md:w-14 md:h-14 rounded-full bg-black/20 hover:bg-indigo-600 border border-white/20 flex items-center justify-center text-white backdrop-blur-md transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Next slide"
        >
          <FaChevronRight size={20} />
        </motion.button>

        {/* Slide Counter */}
        <div className="absolute top-28 right-8 z-20 hidden md:flex items-center gap-3 text-white/50 bg-black/30 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
          <span className="text-lg font-bold text-amber-400">
            {String(current + 1).padStart(2, "0")}
          </span>
          <span className="w-6 h-px bg-white/30" />
          <span className="text-xs text-slate-300">
            {String(slides.length).padStart(2, "0")}F
          </span>
        </div>

        {/* Top Progress Line */}
        {!reduceMotion && !isPaused && (
          <motion.div
            key={`bar-${current}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: AUTOPLAY_DELAY / 1000, ease: "linear" }}
            className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-amber-400 to-indigo-500 origin-left z-30"
          />
        )}
      </div>
    </section>
  );
}
