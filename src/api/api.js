import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://172.26.121.196:5000";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;