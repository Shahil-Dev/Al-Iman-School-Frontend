"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/context/UserContext";
import { FaSpinner } from "react-icons/fa";

export default function DashboardRootPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      const role = user?.role;
      if (role === "STUDENT") {
        router.replace("/Dashboard/studentDashboard");
      } else if (role === "PARENT") {
        router.replace("/Dashboard/parentDashboard");
      } else if (role === "TEACHER") {
        router.replace("/Dashboard/TeacherDashboard");
      } else if (role === "ACCOUNTS") {
        router.replace("/Dashboard/accounts");
      } else {
        router.replace("/Dashboard/admin");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs font-medium">
      <FaSpinner className="animate-spin text-primary text-2xl" />
      <p>Redirecting to your Dashboard...</p>
    </div>
  );
}