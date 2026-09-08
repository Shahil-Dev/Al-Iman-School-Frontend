import { useEffect, useState } from "react";
import axiosInstance from "@/src/lib/axiosInstance";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await axiosInstance.get("/auth/me");
        setUser(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  return { user, loading, error };
}
