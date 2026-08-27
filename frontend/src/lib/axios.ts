// src/lib/axios.ts
import axios from "axios";

const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== "undefined") {
    if (envUrl) {
      const hostname = window.location.hostname;
      if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
        return envUrl.replace("localhost", hostname).replace("127.0.0.1", hostname);
      }
      return envUrl;
    }
    return "/api";
  }

  return envUrl || "http://localhost:8000/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
