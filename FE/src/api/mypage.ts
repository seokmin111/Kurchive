import client from "./client";
import {
  MyPageUser,
  FavoriteRestaurant,
  MessageResponse,
} from "@/types/mypage";

export const getMyPage = (): Promise<MyPageUser> =>
  client.get("/mypage").then(r => r.data);

export const updateNickname = (
  nickname: string
): Promise<MessageResponse> =>
  client.put("/mypage/info/nickname", { nickname }).then(r => r.data);

export const updatePassword = (
  currentPW: string,
  newPW: string
): Promise<MessageResponse> =>
  client
    .put("/mypage/info/password", { currentPW, newPW })
    .then(r => r.data);

export const getMyFavoriteRestaurants = (): Promise<FavoriteRestaurant[]> =>
  client.get("/mypage/logs/restaurants").then(r => r.data);

export const withdrawal = (): Promise<MessageResponse> =>
  client.delete("/mypage/withdrawal").then(r => r.data);

export interface MyPageUser {
  id: number;
  is_admin: boolean;
  name: string;
  nickname: string;
  role: "member" | "staff" | "admin";
  created_at: string | null;
}

export interface FavoriteRestaurant {
  id: number;
  name: string;
  address?: string;
  rating?: number;
}

export interface MessageResponse {
  message: string;
}
