import { configureAxios } from "@/lib/axios";
import { AUTH_TOKEN_KEY } from "@/constants/api";

export function initializeAuthConfig() {
  configureAxios({
    getToken: () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem(AUTH_TOKEN_KEY);
      }
      return null;
    },
    onError: (error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Token retrieval error:", error);
      }
    },
  });
}
