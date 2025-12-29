import client from "./client";

// 태그
export const getTagCategories = () =>
  client.get("/api/tag-categories").then(r => r.data);

export const getTags = (params?: { category_id?: number; parent_id?: number | null }) =>
  client.get("/api/tags", { params }).then(r => r.data);

export const searchTags = (q: string) =>
  client.get("/api/tags/search", { params: { q } }).then(r => r.data);

// 지역
export const getRegions = (parent_id?: number) =>
  client.get("/api/regions", { params: parent_id ? { parent_id } : {} }).then(r => r.data);

// 식당
export type CreateRestaurantBody = {
  name: string;
  location_link: string;
  location_tag_id: number;
  rating?: number;
  summary: string;
  description: string;
  price_min: number;
  price_max: number;
  tag_ids: number[];
};

export const createRestaurant = (body: CreateRestaurantBody) =>
  client.post("/api/restaurants", body).then(r => r.data);

export const searchRestaurantsByName = (q: string) =>
  client.get("/api/restaurants/search", { params: { q } }).then(r => r.data);

export const listRestaurants = (params?: {
  region_id?: number;
  tag_ids?: number[];      // [1,2,3]
  price_min?: number;
  price_max?: number;
}) =>
  client.get("/api/restaurants", {
    params: {
      ...params,
      tag_ids: params?.tag_ids?.join(","),
    },
  }).then(r => r.data);

export const getRestaurantDetail = (restaurantId: number) =>
  client.get(`/api/restaurants/${restaurantId}`).then(r => r.data);

// 지도용: 근처/뷰포트
export const listRestaurantsNearby = (params: {
  lat: number; lon: number;
  radius_km?: number;
  tag_ids?: number[];
  price_min?: number;
  price_max?: number;
  limit?: number;
}) =>
  client.get("/api/restaurants/nearby", {
    params: { ...params, tag_ids: params.tag_ids?.join(",") },
  }).then(r => r.data);

export const listRestaurantsViewport = (params: {
  min_lat: number; min_lon: number; max_lat: number; max_lon: number;
  tag_ids?: number[];
  price_min?: number;
  price_max?: number;
  limit?: number;
}) =>
  client.get("/api/restaurants/viewport", {
    params: { ...params, tag_ids: params.tag_ids?.join(",") },
  }).then(r => r.data);
