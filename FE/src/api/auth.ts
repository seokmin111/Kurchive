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
  client.post("/api/signup", body).then(r => r.data);

export const checkIdDuplicate = (userid: string) =>
  client.get("/api/signup/check_id", { params: { userid } }).then(r => r.data);

export const checkNicknameDuplicate = (nickname: string) =>
  client.get("/api/check_nickname", { params: { nickname } }).then(r => r.data);

export const validateSignupCode = (code: string) =>
  client.post("/api/validate_code", { code }).then(r => r.data);

export const login = (ID: string, PW: string) =>
  client.post("/api/login", { ID, PW }).then(r => r.data);
