"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/context/UserContext";
import { FaSpinner } from "react-icons/fa";

export default function DashboardEntryPage() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const role = user?.role || "SUPER_ADMIN";

    switch (role) {
      case "SUPER_ADMIN":
      case "ADMIN":
        router.replace("/Dashboard/admin");
        break;
      case "ACCOUNTS":
        router.replace("/Dashboard/accounts");
        break;
      case "TEACHER":
        router.replace("/Dashboard/teacher");
        break;
      case "STUDENT":
      case "PARENT":
        router.replace("/Dashboard/student");
        break;
      default:
        router.replace("/Dashboard/admin");
    }
  }, [user, router]);

  return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <FaSpinner className="animate-spin text-2xl text-primary" />
      <p className="text-xs font-semibold">Redirecting to your portal...</p>
    </div>
  );
}
