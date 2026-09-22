"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useUser } from "@/src/context/UserContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { useTheme } from "next-themes";
import {
  FaUserShield,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaFileInvoiceDollar,
  FaCalendarCheck,
  FaBook,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome,
  FaChevronDown,
  FaUserClock,
  FaUsers,
} from "react-icons/fa";

type SubNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: SubNavItem[];
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useUser();
  const { language } = useLanguage();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const isBn = language === "bn";

  // Auto-expand menu if current pathname matches any sub-item
  useEffect(() => {
    if (pathname.includes("/dashboard/teachers") || pathname.includes("/dashboard/pending-teachers")) {
      setOpenSubMenu("teachers");
    }
  }, [pathname]);

  const toggleSubMenu = (key: string) => {
    setOpenSubMenu((prev) => (prev === key ? null : key));
  };

  const getNavItems = (): (NavItem & { key?: string })[] => {
    const role = user?.role || "SUPER_ADMIN";

    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      return [
        { label: isBn ? "ওভারভিউ" : "Overview", href: "/Dashboard/admin", icon: FaHome },
        { label: isBn ? "ভর্তি আবেদন" : "Admissions", href: "/Dashboard/admissions", icon: FaUserGraduate },
        { label: isBn ? "শিক্ষার্থী ব্যবস্থাপনা" : "Students", href: "/Dashboard/students", icon: FaUserGraduate },
        {
          key: "teachers",
          label: isBn ? "শিক্ষক" : "Teachers",
          icon: FaChalkboardTeacher,
          subItems: [
            {
              label: isBn ? "শিক্ষক তালিকা" : "All Teachers",
              href: "/Dashboard/teachers",
              icon: FaUsers,
            },
            {
              label: isBn ? "আবেদন ও অনুমোদন" : "Pending Approvals",
              href: "/Dashboard/pending-teachers",
              icon: FaUserClock,
            },
          ],
        },
        { label: isBn ? "একাডেমিক সেটআপ" : "Academic", href: "/Dashboard/academic", icon: FaBook },
        { label: isBn ? "হিসাব বিভাগ" : "Accounts", href: "/Dashboard/accounts", icon: FaFileInvoiceDollar },
      ];
    }

    if (role === "TEACHER") {
      return [
        { label: isBn ? "ওভারভিউ" : "Overview", href: "/Dashboard/teacher", icon: FaHome },
        { label: isBn ? "হাজিরা ইনপুট" : "Attendance", href: "/Dashboard/teacher/attendance", icon: FaCalendarCheck },
        { label: isBn ? "নম্বর এন্ট্রি" : "Marks Entry", href: "/Dashboard/teacher/marks", icon: FaBook },
      ];
    }

    if (role === "ACCOUNTS") {
      return [
        { label: isBn ? "ওভারভিউ" : "Overview", href: "/Dashboard/accounts", icon: FaHome },
        { label: isBn ? "ফি কালেকশন" : "Fee Collections", href: "/Dashboard/accounts/fees", icon: FaFileInvoiceDollar },
        { label: isBn ? "পে-রোল" : "Payrolls", href: "/Dashboard/accounts/payroll", icon: FaFileInvoiceDollar },
      ];
    }

    return [
      { label: isBn ? "আমার প্রোফাইল" : "My Profile", href: "/Dashboard/student", icon: FaHome },
      { label: isBn ? "ফলাফল" : "Results", href: "/Dashboard/student/results", icon: FaBook },
    ];
  };

  const navItems = getNavItems();
  const roleLabel = user?.role || "SUPER_ADMIN";
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || roleLabel.charAt(0);

  const spring = prefersReducedMotion
    ? { type: "tween" as const, duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 34, mass: 0.9 };

  return (
    <div className="min-h-screen bg-muted/20 flex text-foreground font-sans antialiased">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            key="overlay"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/45 cursor-default"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-[264px] shrink-0 bg-card border-r border-border flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          transition: prefersReducedMotion
            ? "none"
            : "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-5 border-b border-border">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-semibold text-[15px] tracking-tight text-foreground group"
            >
              <span className="relative w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20 group-hover:ring-primary/40 transition-[box-shadow] duration-200">
                <FaUserShield className="text-[13px]" />
              </span>
              <span>
                Al-Iman <span className="text-muted-foreground font-normal">ERP</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="lg:hidden -mr-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Navigation */}
          <nav aria-label="Primary" className="p-3">
            <p className="px-3 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              {isBn ? "মেনু" : "Menu"}
            </p>

            <ul className="space-y-1">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isSubMenu = !!item.subItems;
                const isExpanded = openSubMenu === item.key;
                const isActive = item.href ? pathname === item.href : false;
                const isChildActive = item.subItems?.some((sub) => pathname === sub.href);

                if (isSubMenu) {
                  return (
                    <li key={item.key || idx} className="space-y-1">
                      <button
                        onClick={() => item.key && toggleSubMenu(item.key)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium tracking-tight transition-colors duration-150 ${
                          isChildActive
                            ? "text-primary font-semibold bg-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`text-[12.5px] ${isChildActive ? "text-primary" : ""}`} />
                          <span>{item.label}</span>
                        </div>
                        <FaChevronDown
                          className={`text-[10px] transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </button>

                      {/* Nested Sub-Menu Items */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="pl-4 space-y-1 border-l-2 border-border/60 ml-4 overflow-hidden"
                          >
                            {item.subItems?.map((sub) => {
                              const SubIcon = sub.icon;
                              const isSubActive = pathname === sub.href;

                              return (
                                <li key={sub.href}>
                                  <Link
                                    href={sub.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
                                      isSubActive
                                        ? "text-primary bg-primary/10 font-semibold"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                    }`}
                                  >
                                    <SubIcon className="text-[11px]" />
                                    <span>{sub.label}</span>
                                  </Link>
                                </li>
                              );
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                }

                return (
                  <motion.li
                    key={item.href}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.22,
                      delay: prefersReducedMotion ? 0 : idx * 0.025,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                  >
                    <Link
                      href={item.href || "#"}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative flex items-center gap-3 pl-3 pr-2.5 py-2 rounded-lg text-[13px] font-medium tracking-tight transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isActive
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          transition={spring}
                          className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-primary/20"
                          aria-hidden="true"
                        />
                      )}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active-bar"
                          transition={spring}
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full bg-primary"
                          aria-hidden="true"
                        />
                      )}
                      <motion.span
                        className="relative shrink-0"
                        whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
                        transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      >
                        <Icon className={`text-[12.5px] ${isActive ? "text-primary" : ""}`} />
                      </motion.span>
                      <span className="relative truncate">{item.label}</span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* User + Logout */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-muted/40">
            <div className="w-8 h-8 rounded-full bg-primary/12 text-primary flex items-center justify-center font-semibold text-[11px] ring-1 ring-primary/20 shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-foreground truncate leading-tight">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.1em] leading-tight mt-0.5 truncate">
                {roleLabel.replace("_", " ")}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-2 w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <FaSignOutAlt className="text-[12.5px] shrink-0" />
            <span>{isBn ? "লগআউট" : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-card/80 supports-[backdrop-filter]:bg-card/70 backdrop-blur-md border-b border-border sticky top-0 z-30">
          <div className="h-full flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="lg:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <FaBars className="text-[15px]" />
              </button>
              <h1
                className="text-[13.5px] font-semibold tracking-tight text-foreground truncate"
                aria-live="polite"
              >
                {isBn ? "ড্যাশবোর্ড ম্যানেজমেন্ট" : "Dashboard Management"}
              </h1>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}