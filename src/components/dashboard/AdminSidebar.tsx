"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UserCheck, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Settings 
} from "lucide-react";

// Define structural interface for navigation items
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Admission Requests",
    href: "/dashboard/admin/admissions",
    icon: UserCheck,
  },
  {
    title: "Students",
    href: "/dashboard/admin/students",
    icon: GraduationCap,
  },
  {
    title: "Teachers",
    href: "/dashboard/admin/teachers",
    icon: Users,
  },
  {
    title: "Academic",
    href: "/dashboard/admin/academic",
    icon: BookOpen,
  },
  {
    title: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen p-4 flex flex-col justify-between">
      <div>
        {/* Branding header */}
        <div className="px-3 py-4 mb-6">
          <h2 className="text-xl font-bold tracking-wider text-emerald-400">
            AL-IMAN ADMIN
          </h2>
          <p className="text-xs text-slate-400 mt-1">Management Portal</p>
        </div>

        {/* Dynamic navigation links */}
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / System status info */}
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">Al-Iman Admin v1.0</p>
        <p className="mt-0.5">Role: Super Admin</p>
      </div>
    </aside>
  );
}