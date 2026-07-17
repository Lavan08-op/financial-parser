import axios from "axios";

const API = axios.create({ baseURL: "https://financial-parser-4e4u.onrender.com" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
