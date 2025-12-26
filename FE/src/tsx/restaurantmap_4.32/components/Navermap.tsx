"use client";

import { useEffect, useRef, useState } from "react";

interface Restaurant {
  id: number;
  name: string;
  address: string;
  location_link: string;
  latitude: number;
  longitude: number;
  summary: string;
}
interface UserLocation {
  latitude: number;
  longitude: number;
}

interface NaverMapProps {
  restaurantIds: number[];
}
export default function NaverMap({ restaurantIds }: NaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  function getLocation() {
    // Geolocation API 지원 여부 확인
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (error) => {
          console.error(`위치 정보를 가져올 수 없습니다: ${error.message}`);
        },
        {
          enableHighAccuracy: true, // 정확도 우선 모드
          timeout: 10000, // 10초 이내에 응답 없으면 에러 발생
          maximumAge: 0, // 항상 최신 위치 정보 수집
        }
      );
    } else {
      console.warn("브라우저가 위치 서비스를 지원하지 않습니다.");
    }
  }
  // 🔴 2. 핵심 로직: 단일 ID API를 여러 번 호출하고 결과를 통합합니다.
  useEffect(() => {
    if (!restaurantIds || restaurantIds.length === 0) {
      setRestaurants([]);
      return;
    }

    const fetchMapData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("access token");

      try {
        // ID 목록을 순회하며 개별 API 호출 Promise를 생성합니다.
        const fetchPromises = restaurantIds.map((id) => {
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/${id}`;

          return fetch(apiUrl, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => {
              if (!res.ok) {
                console.error(
                  `Error fetching data for ID ${id}: ${res.status}`
                );
                return null;
              }
              return res.json();
            })
            .catch((error) => {
              console.error(`Network error for ID ${id}:`, error);
              return null;
            });
        });

        // 모든 호출이 완료될 때까지 기다립니다.
        const results = await Promise.all(fetchPromises);

        // 유효한 결과(null이 아닌)만 필터링하여 상태에 저장합니다.
        const validRestaurants: Restaurant[] = results.filter(
          (data): data is Restaurant => data !== null
        );

        setRestaurants(validRestaurants);
      } catch (err) {
        console.error("Failed to fetch map data:", err);
        setRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapData();
  }, [restaurantIds]);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (isLoading || restaurants.length === 0 || !mapRef.current) return;
    if (!window.naver || !window.naver.maps) return;

    const initMap = () => {
      // 지도 중심점 설정: 사용자 위치가 있다면 사용자 위치, 없다면 첫 번째 식당 위치
      const centerTarget =
        userLocation || (restaurants.length > 0 ? restaurants[0] : null);
      if (!centerTarget) return;

      const map = new window.naver.maps.Map(mapRef.current as HTMLElement, {
        center: new window.naver.maps.LatLng(
          centerTarget.latitude,
          centerTarget.longitude
        ),
        zoom: 15,
      });

      // 지도에 모든 식당 마커 표시
      restaurants.forEach((rest) => {
        // 위도(latitude)와 경도(longitude)를 사용하여 마커 생성
        new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(rest.latitude, rest.longitude),
          map,
          title: rest.name,
        });
      });

      // 사용자 위치 마커 표시
      if (userLocation) {
        new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(
            userLocation.latitude,
            userLocation.longitude
          ),
          map,
          title: "내 위치",
          icon: {
            content:
              '<div style="width:10px; height:10px; background-color:red; border-radius:50%; border:2px solid white;"></div>',
            anchor: new window.naver.maps.Point(5, 5),
          },
        });
      }
    };

    // 네이버 지도 SDK가 로드되었는지 확인 후 지도 초기화
    if (window.naver && window.naver.maps) {
      initMap();
    } else {
      window.addEventListener("load", initMap);
      return () => window.removeEventListener("load", initMap);
    }
  }, [userLocation, restaurants, isLoading]);

  // 로딩 및 데이터 없음 상태 표시
  if (isLoading) {
    return (
      <div
        style={{
          width: "100%",
          height: "940px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        지도 데이터를 로딩 중입니다...
      </div>
    );
  }

  if (restaurants.length === 0 && restaurantIds.length > 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "940px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        검색 결과에 해당하는 식당 정보를 불러올 수 없거나, API 호출에
        실패했습니다.
      </div>
    );
  }

  return <div ref={mapRef} style={{ width: "100%", height: "940px" }} />;
}
