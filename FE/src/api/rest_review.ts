// src/api/review.ts
import client from "./client";

export type ReviewCreatePayload = {
  content: string;
  rating: number;
  menus: string[];
};

export type Review = {
  id: number;
  content: string;
  rating: number;
  user_id: number | null;
  nickname?: string;
  menus: string[];
  images: string[];
  created_at: string;
  like_count?: number;
  dislike_count?: number;
};

export async function getRestaurantReviews(
  restaurantId: number
): Promise<Review[]> {
  const res = await client.get(`/restaurants/${restaurantId}/reviews`);

  return res.data.map((review: Review) => ({
    ...review,
    images: review.images ?? [],
    menus: review.menus ?? [],
  }));
}

export async function createRestaurantReview(
  restaurantId: number,
  payload: ReviewCreatePayload
) {
  const res = await client.post(`/restaurants/${restaurantId}/reviews`, payload);
  return res.data;
}

export async function updateReview(
  reviewId: number,
  payload: ReviewCreatePayload
) {
  const res = await client.patch(`/reviews/${reviewId}`, payload);
  return res.data;
}

export async function deleteReview(reviewId: number) {
  const res = await client.delete(`/reviews/${reviewId}`);
  return res.data;
}