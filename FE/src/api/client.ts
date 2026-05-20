import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  timeout: 10000,
});

client.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("admin_token");

  console.log("REQUEST TOKEN:", token);

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

console.log("API BASE:", import.meta.env.VITE_API_URL);

client.interceptors.response.use(
  (res) => res,
  (err) => {
    // 디버깅 중에는 토큰 자동 삭제 금지
    return Promise.reject(err);
  }
);

export default client;