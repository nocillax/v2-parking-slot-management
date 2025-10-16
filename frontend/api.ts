import axios from "axios";
import { useAuthStore } from "@/stores/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  withCredentials: true, // Important for sending cookies (like the refresh token)
});

// Define paths that should not receive an Authorization header
const publicPaths = ["/auth/login", "/auth/register", "/auth/refresh-token"];

// Request interceptor to attach the access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && !publicPaths.some((path) => config.url?.startsWith(path))) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response, // On success, just return the response
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore.getState();

    // If a 401 Unauthorized error occurs, and the user was authenticated,
    // log them out and redirect to the login page.
    if (error.response?.status === 401 && authStore.isAuthenticated) {
      // Avoid redirect loops if the 401 is from the login page itself
      if (window.location.pathname !== "/login") {
        console.log("Session expired. Logging out.");
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }

    // For any other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default api;
