import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});
