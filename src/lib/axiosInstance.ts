import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = Cookies.get("accessToken");
      if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && typeof window !== "undefined") {
      // টোকেন ভুল বা এক্সপায়ার হলে ক্লিয়ার করে দিন
      Cookies.remove("accessToken");
      Cookies.remove("userRole");

      // শুধুমাত্র যদি ইউজার অলরেডি /login পেজে না থাকে এবং প্রটেক্টেড পেজে থাকে তবেই রিডাইরেক্ট করবে
      const currentPath = window.location.pathname.toLowerCase();
      if (currentPath !== "/login" && currentPath.startsWith("/dashboard")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;