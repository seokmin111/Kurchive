// src/api/client.ts
import axios from "axios";

const client = axios.create({
  baseURL: "http://152.69.228.114:8000/docs#/", // FastAPI 주소
  withCredentials: true,            // 로그인/쿠키 필요하면 활성화
});

export default client;

