import client from "./client";

export type SignupRequest = {
  userid: string;
  pw: string;
  pwConfirm: string;
  nickname: string;
  name: string;
  code: string;
};

export const signup = (body: SignupRequest) =>
  client.post("/signup", body).then(r => r.data);

export const checkIdDuplicate = (userid: string) =>
  client.get("/signup/check_id", { params: { userid } }).then(r => r.data);

export const checkNicknameDuplicate = (nickname: string) =>
  client.get("/check_nickname", { params: { nickname } }).then(r => r.data);

export const validateSignupCode = (code: string) =>
  client.post("/validate_code", { code }).then(r => r.data);

// 백엔드가 ID/PW 대문자 필드를 요구함
export const login = (ID: string, PW: string) =>
  client.post("/login", { ID, PW }).then(r => r.data);

export const logout = () =>
  client.post("/logout").then(r => r.data);