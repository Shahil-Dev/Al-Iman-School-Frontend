import axios from "axios";
import Cookies from "js-cookie";

// Fallback API Base URL for safety
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Required for cross-site cookie/credentials verification
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
    if (
      error.response &&
      error.response.status === 401 &&
      typeof window !== "undefined"
    ) {
      // Clear all Auth cookies and localStorage on unauthorized access
      Cookies.remove("accessToken", { path: "/" });
      Cookies.remove("userRole", { path: "/" });
      Cookies.remove("studentId", { path: "/" });
      localStorage.removeItem("userInfo");

      const currentPath = window.location.pathname.toLowerCase();
      // Auto redirect to login if session expires inside any dashboard route
      if (currentPath !== "/login" && currentPath.includes("dashboard")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;