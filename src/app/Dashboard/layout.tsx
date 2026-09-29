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
  FaUserPlus,
  FaGraduationCap,
  FaSun,
  FaMoon,
  FaGlobe,
  FaUserTie,
  FaClipboardList,
  FaMoneyCheckAlt,
  FaReceipt,
  FaIdCard,
  FaBell,
  FaSms,
  FaClock,
  FaPoll,
  FaChartLine,
  FaLayerGroup,
  FaUniversity,
  FaComments,
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
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const isBn = language === "bn";

  // Auto-expand active sub-menu on page load or navigation
  useEffect(() => {
    if (
      pathname.includes("/Dashboard/admissions") ||
      pathname.includes("/Dashboard/parentDashboard")
    ) {
      setOpenSubMenu("students");
    } else if (
      pathname.includes("/Dashboard/TeacherDashboard") ||
      pathname.includes("/Dashboard/pending-teachers") ||
      pathname.includes("/Dashboard/parents")
    ) {
      setOpenSubMenu("users_hr");
    } else if (pathname.includes("/Dashboard/attendance")) {
      setOpenSubMenu("attendance");
    } else if (
      pathname.includes("/Dashboard/exams") ||
      pathname.includes("/Dashboard/marks")
    ) {
      setOpenSubMenu("exams");
    } else if (pathname.includes("/Dashboard/academic")) {
      setOpenSubMenu("academic");
    } else if (
      pathname.includes("/Dashboard/accounts") ||
      pathname.includes("/Dashboard/payroll") ||
      pathname.includes("/Dashboard/payments")
    ) {
      setOpenSubMenu("accounts");
    } else if (
      pathname.includes("/Dashboard/documents") ||
      pathname.includes("/Dashboard/notices") ||
      pathname.includes("/Dashboard/sms") ||
      pathname.includes("/Dashboard/reviews")
    ) {
      setOpenSubMenu("communication");
    }
  }, [pathname]);

  const toggleSubMenu = (key: string) => {
    setOpenSubMenu((prev) => (prev === key ? null : key));
  };

  // Dynamic Navigation Items mapped with Backend API Modules
  const getNavItems = (): (NavItem & { key?: string })[] => {
    const role = user?.role || "SUPER_ADMIN";

    // 🔴 1. SUPER_ADMIN & ADMIN
    if (role === "SUPER_ADMIN") {
      return [
        {
          label: isBn ? "ওভারভিউ ও অ্যানালিটিক্স" : "Overview & Analytics",
          href: "/Dashboard/admin",
          icon: FaChartLine,
        },
        {
          key: "students",
          label: isBn ? "শিক্ষার্থী ব্যবস্থাপনা" : "Student Management",
          icon: FaUserGraduate,
          subItems: [
            {
              label: isBn ? "অনলাইন ভর্তি আবেদন" : "Admission Applications",
              href: "/Dashboard/admissions",
              icon: FaUserPlus,
            },
            {
              label: isBn ? "শিক্ষার্থী তালিকা" : "Enrolled Students",
              href: "/Dashboard/students",
              icon: FaGraduationCap,
            },
          ],
        },
        {
          key: "users_hr",
          label: isBn ? "শিক্ষক ও অভিভাবক" : "Teachers & Parents",
          icon: FaChalkboardTeacher,
          subItems: [
            {
              label: isBn ? "শিক্ষক তালিকা" : "All Teachers",
              href: "/Dashboard/teachers",
              icon: FaUsers,
            },
            {
              label: isBn
                ? "পেন্ডিং শিক্ষক আবেদন"
                : "Pending Teacher Approvals",
              href: "/Dashboard/pending-teachers",
              icon: FaUserClock,
            },
            {
              label: isBn ? "অভিভাবক ডাটাবেজ" : "Parent Accounts",
              href: "/Dashboard/parents",
              icon: FaUserTie,
            },
          ],
        },
        {
          key: "attendance",
          label: isBn ? "উপস্থিতি ব্যবস্থাপনা" : "Attendance System",
          icon: FaCalendarCheck,
          subItems: [
            {
              label: isBn ? "উপস্থিতি ইনপুট" : "Take Attendance",
              href: "/Dashboard/attendance",
              icon: FaClipboardList,
            },
            {
              label: isBn ? "উপস্থিতি রেকর্ডস" : "Attendance Records",
              href: "/Dashboard/attendance/records",
              icon: FaCalendarCheck,
            },
          ],
        },
        {
          key: "add subject and exams",
          label: isBn ? "বিষয়, পরীক্ষা ও ফলাফল" : "Exams & Results",
          icon: FaPoll,
          subItems: [
            {
              label: isBn ? "পরীক্ষা সেটআপ" : "Exams Management",
              href: "/Dashboard/exams",
              icon: FaBook,
            },
            {
              label: isBn ? "বিষয় সেটআপ" : "Subjects Management",
              href: "/Dashboard/academic/subjects",
              icon: FaBook,
            },
            {
              label: isBn ? "মার্কস এন্ট্রি" : "Mark Entry",
              href: "/Dashboard/marks",
              icon: FaClipboardList,
            },
            {
              label: isBn ? "মার্কশিট ও রেজাল্ট" : "Student Marksheets",
              href: "/Dashboard/exams/marksheet",
              icon: FaPoll,
            },
          ],
        },
        {
          key: "academic",
          href: "/Dashboard/academic",
          label: isBn ? "একাডেমিক সেটআপ" : "Academic Infrastructure",
          icon: FaUniversity,
        },
        {
          key: "accounts",
          label: isBn ? "হিসাব ও ফি বিভাগ" : "Finance & Accounts",
          icon: FaFileInvoiceDollar,
          subItems: [
            {
              label: isBn ? "ইনভয়েস তৈরি" : "Create Invoice",
              href: "/Dashboard/payments/create-invoice",
              icon: FaReceipt,
            },
            {
              label: isBn ? "ফি কালেকশন" : "Collect Payments",
              href: "/Dashboard/payments/collection-summary",
              icon: FaMoneyCheckAlt,
            },
            {
              label: isBn ? "বকেয়া রিপোর্ট" : "Due Fees Report",
              href: "/Dashboard/accounts/due-report",
              icon: FaFileInvoiceDollar,
            },
            {
              label: isBn ? "পে-রোল (Payroll)" : "Staff Payroll",
              href: "/Dashboard/payroll",
              icon: FaMoneyCheckAlt,
            },
          ],
        },
        {
          key: "communication",
          label: isBn ? "ডকুমেন্ট ও অ্যালার্ট" : "Documents & Communication",
          icon: FaBell,
          subItems: [
            {
              label: isBn ? "আইডি কার্ড ও প্রশংসা" : "ID Card & Testimonials",
              href: "/Dashboard/documents",
              icon: FaIdCard,
            },
            {
              label: isBn ? "নোটিশ বোর্ড" : "Notice Board",
              href: "/Dashboard/notices",
              icon: FaBell,
            },

            {
              label: isBn ? "অভিভাবক রিভিউ" : "Public Reviews",
              href: "/Dashboard/reviews/approval",
              icon: FaComments,
            },
          ],
        },
      ];
    }

    // 🟢 2. TEACHER
    if (role === "TEACHER") {
      return [
        {
          label: isBn ? "ওভারভিউ" : "Teacher Overview",
          href: "/Dashboard/TeacherDashboard",
          icon: FaHome,
        },
        {
          label: isBn ? "শিক্ষার্থী উপস্থিতি" : "Take Attendance",
          href: "/Dashboard/attendance",
          icon: FaCalendarCheck,
        },
        {
          label: isBn ? "পরীক্ষার নম্বর এন্ট্রি" : "Marks Entry",
          href: "/Dashboard/marks/entry",
          icon: FaClipboardList,
        },
        {
          label: isBn ? "ক্লাস রুটিন" : "Class Routine",
          href: "/Dashboard/my-routine",
          icon: FaClock,
        },
        {
          label: isBn ? "নোটিশসমূহ" : "Notices",
          href: "/Dashboard/notices",
          icon: FaBell,
        },
      ];
    }

    // 🟡 3. ACCOUNTS
    if (role === "ACCOUNTS") {
      return [
        {
          label: isBn ? "ওভারভিউ" : "Accounts Overview",
          href: "/Dashboard/accounts",
          icon: FaHome,
        },
        {
          label: isBn ? "ভর্তি আবেদন যাচাই" : "Admissions Check",
          href: "/Dashboard/admissions",
          icon: FaUserPlus,
        },
        {
          label: isBn ? "ফি কালেকশন" : "Fee Collections",
          href: "/Dashboard/payments/collection-summary",
          icon: FaFileInvoiceDollar,
        },
        {
          label: isBn ? "ইনভয়েস তৈরি" : "Generate Invoices",
          href: "/Dashboard/payments/create-invoice",
          icon: FaReceipt,
        },
        {
          label: isBn ? "বকেয়া তালিকা" : "Student Due Reports",
          href: "/Dashboard/accounts/due-report",
          icon: FaFileInvoiceDollar,
        },
        {
          label: isBn ? "শিক্ষক ও স্টাফ পে-রোল" : "Payrolls",
          href: "/Dashboard/payroll",
          icon: FaMoneyCheckAlt,
        },
      ];
    }

    // 🔵 4. PARENT
    if (role === "PARENT") {
      return [
        {
          label: isBn ? "আমার সন্তান" : "My Children",
          href: "/Dashboard/parentDashboard",
          icon: FaUserTie,
        },
        {
          label: isBn ? "উপস্থিতি ট্র্যাকার" : "Attendance Summary",
          href: "/Dashboard/parentDashboard/attendance",
          icon: FaCalendarCheck,
        },
        {
          label: isBn ? "ফলাফল ও মার্কশিট" : "Child Results",
          href: "/Dashboard/parentDashboard/results",
          icon: FaPoll,
        },
        {
          label: isBn ? "অনলাইন ফি ও ইনভয়েস" : "Fees & Receipts",
          href: "/Dashboard/parentDashboard/fees",
          icon: FaFileInvoiceDollar,
        },
        {
          label: isBn ? "মতামত/রিভিউ প্রদান" : "Post Review",
          href: "/Dashboard/reviews",
          icon: FaComments,
        },
      ];
    }

    // 🟣 5. STUDENT (DEFAULT)
    return [
      {
        label: isBn ? "আমার প্রোফাইল" : "My Profile",
        href: "/Dashboard/student",
        icon: FaHome,
      },
      {
        label: isBn ? "ক্লাস রুটিন" : "Class Routine",
        href: "/Dashboard/student/routine",
        icon: FaClock,
      },
      {
        label: isBn ? "আমার উপস্থিতি" : "My Attendance",
        href: "/Dashboard/student/attendance",
        icon: FaCalendarCheck,
      },
      {
        label: isBn ? "আমার ফলাফল" : "My Marksheet",
        href: "/Dashboard/student/results",
        icon: FaPoll,
      },
      {
        label: isBn ? "আমার আইডি কার্ড" : "Digital ID Card",
        href: "/Dashboard/student/id-card",
        icon: FaIdCard,
      },
      {
        label: isBn ? "টিউশন ফি ও বকেয়া" : "Invoices & Fees",
        href: "/Dashboard/student/fees",
        icon: FaFileInvoiceDollar,
      },
    ];
  };

  const navItems = getNavItems();
  const roleLabel = user?.role || "SUPER_ADMIN";
  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() || roleLabel.charAt(0);

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
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-50 w-[270px] shrink-0 bg-card border-r border-border flex flex-col justify-between ${
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
                Al-Iman{" "}
                <span className="text-muted-foreground font-normal">ERP</span>
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

          {/* Navigation Menu */}
          <nav
            aria-label="Primary"
            className="p-3 overflow-y-auto max-h-[calc(100vh-140px)]"
          >
            <p className="px-3 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              {isBn ? "ন্যাভিগেশন মেনু" : "Navigation"}
            </p>

            <ul className="space-y-1">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isSubMenu = !!item.subItems;
                const isExpanded = openSubMenu === item.key;
                const isActive = item.href ? pathname === item.href : false;
                const isChildActive = item.subItems?.some(
                  (sub) => pathname === sub.href,
                );

                if (isSubMenu) {
                  return (
                    <li key={item.key || idx} className="space-y-1">
                      <button
                        onClick={() => item.key && toggleSubMenu(item.key)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium tracking-tight transition-colors duration-150 ${
                          isChildActive
                            ? "text-primary font-semibold bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon
                            className={`text-[12.5px] shrink-0 ${
                              isChildActive ? "text-primary" : ""
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <FaChevronDown
                          className={`text-[10px] shrink-0 transition-transform duration-200 ${
                            isExpanded
                              ? "rotate-180 text-primary"
                              : "text-muted-foreground"
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
                            className="pl-3 space-y-1 border-l-2 border-border/60 ml-4 overflow-hidden"
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
                                    <SubIcon className="text-[11px] shrink-0" />
                                    <span className="truncate">
                                      {sub.label}
                                    </span>
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
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 4 }
                    }
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
                        whileHover={
                          prefersReducedMotion ? undefined : { scale: 1.06 }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 22,
                        }}
                      >
                        <Icon
                          className={`text-[12.5px] ${
                            isActive ? "text-primary" : ""
                          }`}
                        />
                      </motion.span>
                      <span className="relative truncate">{item.label}</span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* User Profile Footer + Logout */}
        <div className="p-3 border-t border-border space-y-2">
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
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12.5px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <FaSignOutAlt className="text-[12.5px] shrink-0" />
            <span>{isBn ? "লগআউট" : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
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

            {/* Language & Theme Controls */}
          </div>
        </header>

        {/* Dynamic Page Content Render */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
