"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Megaphone, 
  Settings 
} from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";
import { cn } from "cn";

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      title: t("ড্যাশবোর্ড", "Dashboard"),
      href: "/Dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t("একাডেমিক সেটআপ", "Academic Setup"),
      href: "/Dashboard/academic",
      icon: BookOpen,
    },
    {
      title: t("ভর্তি আবেদন", "Admissions"),
      href: "/Dashboard/admissions",
      icon: GraduationCap,
    },
    {
      title: t("শিক্ষক ও স্টাফ", "Teachers & Staff"),
      href: "/Dashboard/teachers",
      icon: Users,
    },
    {
      title: t("নোটিশ বোর্ড", "Notice Board"),
      href: "/Dashboard/notices",
      icon: Megaphone,
    },
    {
      title: t("সেটিংস", "Settings"),
      href: "/Dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen p-4 flex flex-col">
      <div className="mb-8 px-4 py-2">
        <h2 className="text-xl font-bold text-primary">
          {t("আল-ঈমান স্কুল", "Al-Iman School")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("অ্যাডমিন প্যানেল", "Admin Panel")}
        </p>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}