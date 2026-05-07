import client from "./client";

// -------- Type Definitions (DTO) --------

// 식당 생성,수정 시에 보낼 데이터타입
export type RestaurantBody = {
  name: string;
  location_link: string;       // 지도 링크
  location_tag_id: number;     // Region ID
  rating?: number;             // 0~5
  summary: string;             // 한줄요약
  description: string;         // 설명
  price_min: number;
  price_max: number;
  tag_ids: number[];           // 태그 ID 배열 [1, 3, 5]
};

// 이미지 메타정보 수정 타입
export type ImagePatchBody = {
  is_cover?: boolean;
  caption?: string;
  sort_order?: number;
};

// -------- API Functions --------

// Read 관련

// 1. 태그/카테고리/지역 조회
export const getTagCategories = () =>
  client.get("/api/tag-categories").then(r => r.data);

export const getTags = (params?: { category_id?: number; parent_id?: number | null }) =>
  client.get("/api/tags", { params }).then(r => r.data);

export const searchTags = (q: string) =>
  client.get("/api/tags/search", { params: { q } }).then(r => r.data);

export const getRegions = (parent_id?: number) =>
  client.get("/api/regions", { params: parent_id ? { parent_id } : {} }).then(r => r.data);


// 2. 식당 목록 조회 (필터링)
export const listRestaurants = (params?: {
  region_id?: number;
  tag_ids?: number[];
  price_min?: number;
  price_max?: number;
  min_rating?: number;
  max_rating?: number;
}) =>
  client.get("/api/restaurants", {
    params: {
      ...params,
      tag_ids: params?.tag_ids?.join(","), // 배열 ->  문자열 변환
    },
  }).then(r => r.data);

// 3. 식당 상세조회
export const getRestaurantDetail = (restaurantId: number) =>
  client.get(`/api/restaurants/${restaurantId}`).then(r => r.data);

// 4. 이름으로 식당 검색
export const searchRestaurantsByName = (q: string) =>
  client.get("/api/restaurants/search", { params: { q } }).then(r => r.data);

// 5. 지도용: 근처/뷰포트 검색
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


// Create 생성 관련

// 식당 텍스트 정보 등록
// 이미지는 여기서 등록 X, 리턴받은 ID를 이용해 별도로 업로드할 것 
export const createRestaurant = (body: RestaurantBody) =>
  client.post("/api/restaurants", body).then(r => r.data);


// Update 관련

// 식당 정보 수정
export const updateRestaurant = (restaurantId: number, body: RestaurantBody) =>
  client.put(`/api/restaurants/${restaurantId}`, body).then(r => r.data);

// 이미지 메타정보 수정 (대표사진 등)
export const updateImageMeta = (restaurantId: number, imageId: number, body: ImagePatchBody) =>
  client.patch(`/api/restaurants/${restaurantId}/images/${imageId}`, body).then(r => r.data);


// Delete 관련

// 식당 삭제
export const deleteRestaurant = (restaurantId: number) =>
  client.delete(`/api/restaurants/${restaurantId}`).then(r => r.data);

// 특정 이미지 삭제
export const deleteRestaurantImage = (restaurantId: number, imageId: number) =>
  client.delete(`/api/restaurants/${restaurantId}/images/${imageId}`).then(r => r.data);


// 이미지 업로드 (Create/Update 공용)

/**
 * 식당 이미지 업로드
 * @param restaurantId 식당 ID
 * @param files 업로드할 파일 배열
 * @param replace true면 기존 이미지를 싹 지우고 새로 올림
 */
export const uploadRestaurantImages = (
  restaurantId: number, 
  files: File[], 
  replace: boolean = false
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return client.post(`/api/restaurants/${restaurantId}/images`, formData, {
    params: { replace },
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);
};
