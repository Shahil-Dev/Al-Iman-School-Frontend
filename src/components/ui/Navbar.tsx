"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@base-ui/react";
import {
  FaBars,
  FaChevronRight,
  FaSignInAlt,
  FaTimes,
  FaGlobe,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useLanguage } from "@/src/context/LanguageContext";
import { useUser } from "@/src/hooks/useUser";

const navigationItems = [
  { href: "/", bnLabel: "হোম", enLabel: "Home" },
  { href: "/about", bnLabel: "আমাদের সম্পর্কে", enLabel: "About Us" },
  { href: "/notices", bnLabel: "নোটিশ বোর্ড", enLabel: "Notice Board" },
  { href: "/teachers", bnLabel: "শিক্ষক মণ্ডলী", enLabel: "Teachers" },
  {
    href: "/admission",
    bnLabel: "অনলাইন ভর্তি",
    enLabel: "Online Admission",
    accent: true,
  },
];

const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

export const NavbarMain = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const handleProtectedNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const protectedPaths = [
      "/notices",
      "/teachers",
      "/admission",
    ];
    if (protectedPaths.includes(href) && !user) {
      e.preventDefault();
      router.push(`/login?callbackUrl=${encodeURIComponent(href)}`);
    }
  };

  return (
    <header
      onKeyDown={handleKeyDown}
      className={`sticky top-0 z-50 transition-shadow duration-300 ${
        scrolled
          ? "border-b border-[#1a1a1a]/10 dark:border-white/10 bg-white/98 dark:bg-slate-900/98 shadow-md backdrop-blur-sm"
          : "border-b border-[#1a1a1a]/5 dark:border-white/5 bg-white/95 dark:bg-slate-900/95"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between sm:h-[5rem]">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Al-Iman School home"
            className="group flex min-w-0 items-center gap-3 outline-none rounded-xl focus-visible:ring-2 focus-visible:ring-[#B8860B]"
          >
            <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] text-white shadow-md transition-all duration-300 group-hover:-translate-y-0.5 sm:h-12 sm:w-12">
              <Image
                src="/Image/logo aliman.jpg"
                alt="Al-Iman School Logo"
                fill
                sizes="(max-width: 640px) 44px, 48px"
                className="object-cover"
                priority
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[1.1rem] font-bold tracking-tight text-[#1a1a1a] dark:text-white sm:text-xl">
                {t("আল-ঈমান স্কুল", "Al-Iman School")}
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 md:flex"
          >
            {navigationItems.map(({ href, bnLabel, enLabel, accent }) => (
              <Link
                key={href}
                href={href}
                onClick={(e) => handleProtectedNavigation(e, href)}
                aria-current={isActive(href) ? "page" : undefined}
                className={`group relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] ${
                  accent
                    ? "text-[#B8860B] hover:text-[#9a6f0a]"
                    : isActive(href)
                      ? "text-[#1a1a1a] dark:text-white"
                      : "text-[#4a4a52] dark:text-slate-300 hover:text-[#1a1a1a] dark:hover:text-white"
                }`}
              >
                {t(bnLabel, enLabel)}
                <span
                  className={`absolute inset-x-3 bottom-0.5 h-[2px] origin-left rounded-full transition-transform duration-300 ease-out ${
                    isActive(href)
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  } ${accent ? "bg-[#B8860B]" : "bg-[#1a1a1a] dark:bg-white"}`}
                />
              </Link>
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={toggleLanguage}
              type="button"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#1a1a1a]/15 dark:border-white/15 text-xs font-bold text-[#1a1a1a] dark:text-white hover:bg-[#1a1a1a]/5 dark:hover:bg-white/10 transition-colors"
              title="Switch Language"
            >
              <FaGlobe className="text-[#B8860B] text-sm" />
              <span>{language === "bn" ? "ENG" : "বাংলা"}</span>
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                type="button"
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#1a1a1a]/15 dark:border-white/15 text-[#1a1a1a] dark:text-amber-400 hover:bg-[#1a1a1a]/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? (
                  <FaSun className="text-base" />
                ) : (
                  <FaMoon className="text-base" />
                )}
              </button>
            )}

            {user ? (
              <Link
                href="/Dashboard"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#B8860B]/30 bg-[#1a1a1a] dark:bg-[#B8860B] text-white dark:text-slate-950 font-bold text-base shadow-md hover:scale-105 transition-transform overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
                title="Go to Dashboard"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User Avatar"}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  <span>
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
              >
                <Button className="group flex h-11 items-center gap-2 rounded-xl bg-[#1a1a1a] dark:bg-[#B8860B] px-5 text-sm font-semibold text-white dark:text-slate-950 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2d2d2d] dark:hover:bg-[#a0750a]">
                  <FaSignInAlt className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  {t("পোর্টাল লগইন", "Portal Login")}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <Link
                href="/Dashboard"
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#B8860B]/30 bg-[#1a1a1a] dark:bg-[#B8860B] text-white dark:text-slate-950 font-bold text-sm overflow-hidden"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User Avatar"}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <span>
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={toggleLanguage}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#1a1a1a]/15 dark:border-white/15 text-xs font-bold text-[#1a1a1a] dark:text-white"
            >
              <FaGlobe className="text-[#B8860B]" />
              <span>{language === "bn" ? "ENG" : "বাংলা"}</span>
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                type="button"
                className="grid h-9 w-9 place-items-center rounded-lg border border-[#1a1a1a]/15 dark:border-white/15 text-[#1a1a1a] dark:text-amber-400"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <FaSun /> : <FaMoon />}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={
                isOpen ? "Close navigation menu" : "Open navigation menu"
              }
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#1a1a1a]/15 dark:border-white/15 bg-white dark:bg-slate-800 text-lg text-[#4a4a52] dark:text-white transition-all duration-200 hover:border-[#B8860B]/40 hover:text-[#B8860B]"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation"
            initial={
              prefersReducedMotion ? { opacity: 1 } : { height: 0, opacity: 0 }
            }
            animate={{ height: "auto", opacity: 1 }}
            exit={
              prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }
            }
            transition={
              prefersReducedMotion ? { duration: 0.15 } : springConfig
            }
            className="border-t border-[#1a1a1a]/10 dark:border-white/10 bg-white dark:bg-slate-900 md:hidden overflow-hidden"
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto max-w-7xl px-4 py-4 sm:px-6"
            >
              <div className="space-y-1">
                {navigationItems.map(
                  ({ href, bnLabel, enLabel, accent }, index) => (
                    <motion.div
                      key={href}
                      initial={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 0, y: 8 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { delay: index * 0.05, ...springConfig }
                      }
                    >
                      <Link
                        href={href}
                        onClick={(e) => {
                          closeMenu();
                          handleProtectedNavigation(e, href);
                        }}
                        aria-current={isActive(href) ? "page" : undefined}
                        className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                          accent
                            ? "bg-[#B8860B]/10 text-[#9a6f0a] dark:text-[#B8860B]"
                            : isActive(href)
                              ? "bg-[#1a1a1a]/5 dark:bg-white/10 text-[#1a1a1a] dark:text-white"
                              : "text-[#4a4a52] dark:text-slate-300 hover:bg-[#1a1a1a]/5 dark:hover:bg-white/5"
                        }`}
                      >
                        {t(bnLabel, enLabel)}
                        <FaChevronRight
                          className={`text-xs transition-transform duration-200 group-hover:translate-x-0.5 ${
                            accent
                              ? "text-[#B8860B]"
                              : isActive(href)
                                ? "text-[#1a1a1a] dark:text-white"
                                : "text-[#4a4a52]/40"
                          }`}
                        />
                      </Link>
                    </motion.div>
                  ),
                )}
              </div>

              {!user && (
                <div className="mt-4 border-t border-[#1a1a1a]/10 dark:border-white/10 pt-4">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]"
                  >
                    <Button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] dark:bg-[#B8860B] text-sm font-semibold text-white dark:text-slate-950 shadow-md">
                      <FaSignInAlt />
                      {t("পোর্টাল লগইন", "Portal Login")}
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};