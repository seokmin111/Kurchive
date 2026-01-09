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

  // 0. 지도 스크립트 로드
  useEffect(() => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    if (!clientId) {
      console.error("VITE_NAVER_CLIENT_ID 없음");
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

  // 1. 내 위치
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

  // 2. 데이터 가져오기
  useEffect(() => {
    // ID 배열이 비어있으면 데이터 초기화
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

  // 3. 지도 그리기
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

    // 마커 추가 로직...
    const markers: any[] = [];
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

    if (userLocation) {
        new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(userLocation.latitude, userLocation.longitude),
            map: map,
            icon: {
                content: `<div style="width:14px;height:14px;background:#8B0029;border:2px solid white;border-radius:50%;"></div>`,
                anchor: new window.naver.maps.Point(7, 7),
            },
        });
    }

    if (markers.length > 1) {
        const bounds = new window.naver.maps.LatLngBounds();
        markers.forEach((m) => bounds.extend(m.getPosition()));
        map.fitBounds(bounds, { margin: 50 });
    }

  }, [isMapLoaded, restaurants, userLocation]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* 지도 영역 */}
      <div ref={mapRef} style={{ width: "100%", height: "100%", backgroundColor: "#eee" }} />

      {/* ✅ Debug Overlay (지도 로딩 실패 시 데이터 확인용) */}
      <div style={{
        position: "absolute",
        top: "80px",
        left: "10px",
        width: "300px",
        maxHeight: "60vh",
        overflowY: "auto",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        border: "2px solid red",
        padding: "10px",
        zIndex: 1000,
        fontSize: "12px",
        borderRadius: "8px"
      }}>
        <h3 style={{marginTop:0, color:"red"}}>🛠 DEBUG MODE</h3>
        <p><strong>내 위치:</strong> {userLocation ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : "수집 중..."}</p>
        <p><strong>불러온 식당 수:</strong> {restaurants.length}개</p>
        <hr/>
        <ul style={{paddingLeft:"20px", margin:0}}>
          {restaurants.map(r => (
            <li key={r.id} style={{marginBottom:"4px"}}>
              <strong>[{r.id}] {r.name}</strong><br/>
              {r.summary || "설명 없음"}
            </li>
          ))}
        </ul>
        {restaurants.length === 0 && <p style={{color:"#999"}}>표시할 데이터가 없습니다.</p>}
      </div>
    </div>
  );
}