import client from "./client";

export const getMyPage = () =>
  client.get("/api/mypage").then(r => r.data);

export const updateNickname = (nickname: string) =>
  client.put("/api/mypage/info/nickname", { nickname }).then(r => r.data);

export const updatePassword = (currentPW: string, newPW: string) =>
  client.put("/api/mypage/info/password", { currentPW, newPW }).then(r => r.data);

export const getMyFavoriteRestaurants = () =>
  client.get("/api/mypage/logs/restaurants").then(r => r.data);

export const withdrawal = () =>
  client.delete("/api/mypage/withdrawal").then(r => r.data);
