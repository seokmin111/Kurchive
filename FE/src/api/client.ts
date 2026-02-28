import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
  timeout: 10000,
});

// 요청 인터셉터: 토큰 자동 첨부
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
console.log("API BASE:", import.meta.env.VITE_API_URL);

// 응답 인터셉터: 401/403이면 로그인으로
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url || "";

    const isAuthRequest =
      url.includes("/login") ||
      url.includes("/signup") ||
      url.includes("/validate_code") ||
      url.includes("/check_nickname") ||
      url.includes("/signup/check_id");

    if ((status === 401 || status === 403) && !isAuthRequest) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
);

export default client;
