// src/api/client.ts
import axios from "axios";

const client = axios.create({
  baseURL: "http://152.69.228.114:8000/api", // FastAPI 주소
  withCredentials: true,            // 로그인/쿠키 필요하면 활성화
});

export default client;

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);


