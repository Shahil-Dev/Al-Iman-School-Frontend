import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1",
  timeout: 10000, // ১০ সেকেন্ডের বেশি সময় লাগলে রিকোয়েস্ট টাইমআউট হবে
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Token from Cookies
axiosInstance.interceptors.request.use(
  (config) => {
    // শুধুমাত্র ক্লায়েন্ট সাইডে (Browser-এ) কুকি থেকে টোকেন রিড করার নিরাপদ উপায়
    if (typeof window !== "undefined") {
      const token = Cookies.get("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: global error handling & auth cleanup
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // ৪০১ unauthorized হলে (যেমন: টোকেন এক্সপায়ার হলে) লগইন পেজে রিডাইরেক্ট করা
      if (error.response.status === 401 && typeof window !== "undefined") {
        Cookies.remove("accessToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;