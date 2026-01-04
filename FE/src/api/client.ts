import axios from "axios";

const client = axios.create({
  baseURL: "http://146.56.117.219:8000/api",
  withCredentials: false, // 쿠키 안 쓰면 false가 안전
  timeout: 10000,         // 멈춘 것처럼 보이는 거 방지
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
    const url = err?.config?.url || "";

    // 로그인/회원가입 관련 요청에서는 강제 리다이렉트 금지
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
