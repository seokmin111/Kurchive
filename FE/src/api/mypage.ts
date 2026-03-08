import client from "./client";

export const getMyPage = (): Promise<MyPageUser> =>
  client.get("/mypage").then(r => r.data);

export const updateNickname = (nickname: string): Promise<MessageResponse> =>
  client.put("/mypage/info/nickname", { nickname }).then(r => r.data);

export const updatePassword = (currentPW: string, newPW: string) =>
  client.put("/mypage/info/password", { currentPW, newPW });

export const getMyFavoriteRestaurants = (): Promise<FavoriteRestaurant[]> =>
  client.get("/mypage/logs/favorite-restaurants").then(r => r.data);

export const withdrawal = (): Promise<MessageResponse> =>
  client.delete("/mypage/withdrawal").then(r => r.data);

// 내가 업로드한 레시피 조회
export const getMyUploadedRecipes = (): Promise<MyRecipeLog[]> =>
  client.get("/mypage/logs/uploaded-recipes").then(r => r.data);

// 내가 업로드한 식당 조회
export const getMyUploadedRestaurants = (): Promise<MyRestaurantLog[]> =>
  client.get("/mypage/logs/uploaded-restaurants").then(r => r.data);



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
  thumbnail_url?: string | null;
}

export interface MessageResponse {
  message: string;
}

export interface MyRecipeLog {
  id: number;
  title: string;
  base_serving: number;
  created_at: string | null;
}

export interface MyRestaurantLog {
  id: number;
  name: string;
  address: string;
  rating: number;
  created_at: number; // float timestamp
}