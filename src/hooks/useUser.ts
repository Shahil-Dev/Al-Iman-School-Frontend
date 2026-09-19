import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axiosInstance from "@/src/lib/axiosInstance";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      const token = Cookies.get("accessToken");

      // ১. টোকেন না থাকলে এপিআই কল করারই দরকার নেই (লুপ ঠেকাবে)
      if (!token || token === "undefined" || token === "null") {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.get("/auth/me");
        setUser(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load user profile");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  return { user, loading, error };
}