"use client";

import { useUser } from "@/src/hooks/useUser";
import AdminAnalytics from "./components/AdminAnalytics";

export default function DashboardPage() {
  const { user } = useUser();

  if (user?.role === "SUPER_ADMIN" || user?.role === "ACCOUNTS") {
    return <AdminAnalytics />;
  }

  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800">
        Welcome Back, <span className="text-emerald-600">{user?.email}</span>
      </h2>
      <p className="text-slate-500 mt-2">
        You are logged in as{" "}
        <span className="font-semibold text-slate-700 capitalize">
          {user?.role}
        </span>
        . Select options from the sidebar to manage your account.
      </p>
    </div>
  );
}
