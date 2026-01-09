import { useEffect, useRef, useState } from "react";
import client from "../../../api/client";

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
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    if (!clientId) {
      console.error("네이버 맵 Client ID가 없습니다. FE/.env 파일을 확인해주세요.");
      return;
    }

    if (window.naver && window.naver.maps) {
      setIsMapLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    script.async = true;
    script.onload = () => setIsMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // 내 위치
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => console.warn(err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // 데이터가져오기
  useEffect(() => {
    if (!restaurantIds || restaurantIds.length === 0) {
      setRestaurants([]);
      return;
    }

    const fetchMapData = async () => {
      setIsLoading(true);
      try {
        const promises = restaurantIds.map((id) =>
          client.get(`/restaurants/${id}`).then((res) => res.data).catch(() => null)
        );
        const results = await Promise.all(promises);
        setRestaurants(results.filter((r) => r && r.id));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMapData();
  }, [restaurantIds]);

  // 지도 그리기
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !window.naver) return;

    let centerLat = 37.5665;
    let centerLng = 126.9780;

    if (restaurants.length > 0) {
      centerLat = restaurants[0].latitude || centerLat;
      centerLng = restaurants[0].longitude || centerLng;
    } else if (userLocation) {
      centerLat = userLocation.latitude;
      centerLng = userLocation.longitude;
    }

    const map = new window.naver.maps.Map(mapRef.current, {
      center: new window.naver.maps.LatLng(centerLat, centerLng),
      zoom: 15,
    });

    const markers: any[] = [];

    // 식당 마커
    restaurants.forEach((r) => {
      if (r.latitude && r.longitude) {
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(r.latitude, r.longitude),
          map: map,
          title: r.name,
        });
        markers.push(marker);
      }
    });

    // 내 위치 마커
    if (userLocation) {
      new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(userLocation.latitude, userLocation.longitude),
        map: map,
        zIndex: 100,
        icon: {
          content: `<div style="width:14px;height:14px;background:#8B0029;border:2px solid white;border-radius:50%;"></div>`,
          anchor: new window.naver.maps.Point(7, 7),
        },
      });
    }

    if (markers.length > 1) {
      const bounds = new window.naver.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend(m.getPosition()));
      if (userLocation) bounds.extend(new window.naver.maps.LatLng(userLocation.latitude, userLocation.longitude));
      map.fitBounds(bounds, { margin: 50 });
    }
  }, [isMapLoaded, restaurants, userLocation]);

  if (!isMapLoaded) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>지도 스크립트 로딩 중...</div>;
  if (isLoading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%'}}>식당 정보 로딩 중...</div>;

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}