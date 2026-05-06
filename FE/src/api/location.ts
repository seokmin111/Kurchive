import client from "./client";

// -------- Type Definitions (DTO) --------

//api 추가 위해서 api 폴더 내에 이렇게 추가하는게 일반적

export type ExtractLocationResponse = {
  ok: boolean;
  address?: string;
  lat?: number;
  lng?: number;
  name?: string;
  road_address?: string;
  source?: string;
  detail?: string;
};

export type GeocodeResponse = {
  ok: boolean;
  lat?: number;
  lng?: number;
  address?: string;
  detail?: string;
};

// -------- API Functions --------

/**
 * 지도 링크에서 주소, 위도, 경도 추출
 * @param locationLink 지도 링크 (Kakao, Naver, Google)
 * @returns 주소, 위도, 경도 및 메타 정보
 */
export const extractLocationFromLink = (locationLink: string) =>
  client.post<ExtractLocationResponse>("/locations/extract", {
    location_link: locationLink,
  }).then(r => r.data);

/**
 * 주소에서 위도, 경도 추출 (카카오 API 사용 역지오코딩)
 * @param address 주소 문자열
 * @returns 위도, 경도 및 검증된 주소
 */
export const geocodeAddress = (address: string) =>
  client.post<GeocodeResponse>("/locations/geocode", {
    address: address,
  }).then(r => r.data);
