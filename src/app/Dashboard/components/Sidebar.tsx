"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  Calendar,
  FileText,
  Receipt,
  Settings,
} from "lucide-react";

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const getMenuItems = () => {
    const common = [
      { name: "Dashboard", href: "/Dashboard", icon: LayoutDashboard },
      { name: "Routine", href: "/Dashboard/routine", icon: Calendar },
      { name: "Notices", href: "/Dashboard/notices", icon: FileText },
    ];

    if (role === "SUPER_ADMIN" || role === "ACCOUNTS") {
      return [
        ...common,
        { name: "Academic", href: "/Dashboard/academic", icon: BookOpen },
        { name: "Students", href: "/Dashboard/students", icon: GraduationCap },
        { name: "Teachers", href: "/Dashboard/teachers", icon: Users },
        { name: "Parents", href: "/Dashboard/parents", icon: UserCheck },
        { name: "Fees & Invoices", href: "/Dashboard/payments", icon: Receipt },
        { name: "Settings", href: "/Dashboard/settings", icon: Settings },
      ];
    }

    if (role === "TEACHER") {
      return [
        ...common,
        { name: "My Classes", href: "/Dashboard/classes", icon: BookOpen },
        { name: "Attendance", href: "/Dashboard/attendance", icon: UserCheck },
        { name: "Marks Entry", href: "/Dashboard/marks", icon: FileText },
      ];
    }

    if (role === "STUDENT" || role === "PARENT") {
      return [
        ...common,
        { name: "My Marks", href: "/Dashboard/marks", icon: FileText },
        { name: "Attendance", href: "/Dashboard/attendance", icon: UserCheck },
        { name: "Invoices", href: "/Dashboard/invoices", icon: Receipt },
      ];
    }

    return common;
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="text-xl font-bold border-b border-slate-700 pb-4 mb-6 text-center tracking-wide text-emerald-400">
          Al-Iman School
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 text-center">
        Role:{" "}
        <span className="text-emerald-400 font-semibold">
          {role || "Loading..."}
        </span>
      </div>
    </aside>
  );
}
