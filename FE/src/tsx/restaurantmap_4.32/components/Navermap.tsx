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

  // 지도 스크립트 로드
  useEffect(() => {
    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    if (!clientId) {
      console.error("VITE_NAVER_CLIENT_ID 없음");
      // ID가 없어도 로직 테스트를 위해 isMapLoaded를 true로 설정하여 진행 시도
      setIsMapLoaded(true); 
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
    script.onerror = () => {
        console.error("네이버 지도 스크립트 로드 실패");
        setIsMapLoaded(true); // 실패해도 디버그 UI는 보이게 처리
    };
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

  // 데이터 가져오기
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
    if (!isMapLoaded || !mapRef.current) return;

    // 네이버 객체 유효성 체크 (인증 실패 시 window.naver.maps가 null일 수 있음)
    if (!window.naver || !window.naver.maps) {
        console.warn("네이버 지도 객체가 로드되지 않았거나 인증에 실패했습니다. (지도 렌더링 건너뜀)");
        return;
    }

    try {
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

        // 마커 추가 로직
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
    } catch (error) {
        console.error("지도 렌더링 중 오류 발생 (인증 실패 가능성):", error);
        // 에러를 무시하고 넘어가서 UI가 깨지지 않게 함
    }

  }, [isMapLoaded, restaurants, userLocation]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* 지도 영역 (로딩 실패 시 회색 배경) */}
      <div ref={mapRef} style={{ width: "100%", height: "100%", backgroundColor: "#eee" }} />

      {/* Debug Overlay: 지도가 안 떠도 데이터는 여기서 확인 가능 */}
      <div style={{
        position: "absolute",
        top: "80px",
        left: "10px",
        width: "300px",
        maxHeight: "60vh",
        overflowY: "auto",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        border: "2px solid red",
        padding: "10px",
        zIndex: 1000,
        fontSize: "12px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{marginTop:0, color:"red", borderBottom:"1px solid red", paddingBottom:"5px"}}>🛠 데이터 확인용 (Map API Error 무시)</h3>
        <p><strong>내 위치:</strong> {userLocation ? `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}` : "수집 중..."}</p>
        <p><strong>검색된 식당 수:</strong> {restaurants.length}개</p>
        <hr style={{borderColor:"#ddd"}}/>
        <ul style={{paddingLeft:"20px", margin:0}}>
          {restaurants.map(r => (
            <li key={r.id} style={{marginBottom:"8px"}}>
              <strong>[{r.id}] {r.name}</strong>
              <div style={{color:"#666"}}>{r.summary || "설명 없음"}</div>
              <div style={{color:"#888", fontSize:"10px"}}>{r.address}</div>
            </li>
          ))}
        </ul>
        {restaurants.length === 0 && <p style={{color:"#999", textAlign:"center"}}>조건에 맞는 식당이 없습니다.</p>}
      </div>
    </div>
  );
}