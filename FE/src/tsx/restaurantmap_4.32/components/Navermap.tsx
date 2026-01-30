import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../../api/client";
import style from "../page.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus, faLocationCrosshairs, faXmark } from "@fortawesome/free-solid-svg-icons";

// 이미지 정보 인터페이스
interface RestaurantImage {
  id: number;
  image_url: string;
  is_cover: boolean;
}

// 태그 정보 인터페이스
interface Tag {
  id: number;
  name: string;
}

// 식당 정보 인터페이스
interface Restaurant {
  id: number;
  name: string;
  address: string;
  location_link: string;
  latitude: number;
  longitude: number;
  summary: string;
  rating?: number;
  images?: RestaurantImage[];
  tags?: Tag[]; // 태그 배열 추가
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface NaverMapProps {
  restaurantIds: number[];
}

export default function NaverMap({ restaurantIds }: NaverMapProps) {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null); 
  const markersRef = useRef<any[]>([]);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  //  네이버 지도 스크립트 로드
  useEffect(() => {
    if (window.naver && window.naver.maps) {
      setIsMapLoaded(true);
      return;
    }

    const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
    if (!clientId) {
      console.error("VITE_NAVER_CLIENT_ID 환경변수가 없습니다.");
      return;
    }

    const script = document.createElement("script");
    //  ncpClientId -> ncpKeyId
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`; 
    script.async = true;
    script.onload = () => setIsMapLoaded(true);
    script.onerror = () => {
        console.error("네이버 지도 스크립트 로드 실패");
        // 스크립트 로드 실패하더라도 UI가 깨지지 않도록 처리 (필요시)
    };
    document.head.appendChild(script);
  }, []);

  // 2. 내 위치 가져오기
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => console.warn("위치 정보 수집 실패", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // 3. 식당 데이터 가져오기
  useEffect(() => {
    if (!restaurantIds || restaurantIds.length === 0) {
      setRestaurants([]);
      return;
    }

    const fetchMapData = async () => {
      try {
        const promises = restaurantIds.map((id) =>
          client.get(`/restaurants/${id}`).then((res) => res.data).catch(() => null)
        );
        const results = await Promise.all(promises);
        setRestaurants(results.filter((r) => r && r.id));
      } catch (err) {
        console.error(err);
      }
    };
    fetchMapData();
  }, [restaurantIds]);

  // 4. 지도 초기화 및 마커 렌더링
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    if (!window.naver || !window.naver.maps) return;

    let centerLat = 37.5665;
    let centerLng = 126.9780;
    let initialZoom = 16; 

    //  [수정] 중심 좌표 결정 로직 개선
    // 1순위: 내 위치가 있고 식당 데이터가 있다면, "내 위치에서 가장 가까운 식당"을 중심으로 잡음
    if (userLocation && restaurants.length > 0) {
        let minDist = Infinity;
        let closestRest = restaurants[0];

        restaurants.forEach(r => {
            if (r.latitude && r.longitude) {
                // 간단한 거리 계산 (제곱합)
                const dist = Math.pow(r.latitude - userLocation.latitude, 2) + 
                             Math.pow(r.longitude - userLocation.longitude, 2);
                if (dist < minDist) {
                    minDist = dist;
                    closestRest = r;
                }
            }
        });
        
        centerLat = closestRest.latitude;
        centerLng = closestRest.longitude;
    } 
    // 2순위: 내 위치만 있으면 내 위치 중심
    else if (userLocation) {
        centerLat = userLocation.latitude;
        centerLng = userLocation.longitude;
    }
    // 3순위: 식당만 있으면 첫번째 식당 중심
    else if (restaurants.length > 0) {
        centerLat = restaurants[0].latitude || centerLat;
        centerLng = restaurants[0].longitude || centerLng;
    }

    // 지도 인스턴스 생성 또는 중심 이동
    if (!mapInstance.current) {
        mapInstance.current = new window.naver.maps.Map(mapRef.current, {
            center: new window.naver.maps.LatLng(centerLat, centerLng),
            zoom: initialZoom,
            zoomControl: false, 
            scaleControl: false,
            mapDataControl: false,
        });

        window.naver.maps.Event.addListener(mapInstance.current, 'click', () => {
            setSelectedRestaurant(null);
        });
    } else {
        // 데이터가 변경(필터링 등)되었을 때 중심 이동
        const newCenter = new window.naver.maps.LatLng(centerLat, centerLng);
        mapInstance.current.panTo(newCenter);
    }

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // 마커 렌더링 (핀 + 라벨)
    restaurants.forEach((r) => {
        if (r.latitude && r.longitude) {
            const contentHtml = `
              <div class="${style.markerContainer}">
                <div class="${style.markerPin}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="24" height="24">
                    <path fill="#8B0029" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
                    <circle cx="192" cy="192" r="60" fill="white"/>
                  </svg>
                </div>
                <div class="${style.markerLabel}">${r.name}</div>
              </div>
            `;

            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(r.latitude, r.longitude),
                map: mapInstance.current,
                title: r.name,
                icon: {
                    content: contentHtml,
                    size: new window.naver.maps.Size(100, 60),
                    anchor: new window.naver.maps.Point(50, 30), // 핀 끝부분이 좌표에 오도록
                }
            });

            window.naver.maps.Event.addListener(marker, 'click', () => {
                setSelectedRestaurant(r);
                mapInstance.current.panTo(new window.naver.maps.LatLng(r.latitude, r.longitude));
            });

            markersRef.current.push(marker);
        }
    });

    // 내 위치 마커
    if (userLocation) {
        new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(userLocation.latitude, userLocation.longitude),
            map: mapInstance.current,
            zIndex: 100,
            icon: {
                content: `<div style="width:16px;height:16px;background:#1e90ff;border:3px solid white;border-radius:50%;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>`,
                anchor: new window.naver.maps.Point(8, 8),
            },
        });
    }

  }, [isMapLoaded, restaurants, userLocation]);

  // 컨트롤 핸들러
  const handleZoomIn = () => {
    if (mapInstance.current) {
        mapInstance.current.setZoom(mapInstance.current.getZoom() + 1, true);
    }
  };

  const handleZoomOut = () => {
    if (mapInstance.current) {
        mapInstance.current.setZoom(mapInstance.current.getZoom() - 1, true);
    }
  };

  const handleMoveToLocation = () => {
    if (!mapInstance.current) return;
    if (userLocation) {
        const newCenter = new window.naver.maps.LatLng(userLocation.latitude, userLocation.longitude);
        mapInstance.current.panTo(newCenter);
        mapInstance.current.setZoom(16, true);
    } else {
        alert("현재 위치 정보를 가져오는 중입니다.");
    }
  };

  const handleCardClick = () => {
    if (selectedRestaurant) {
        navigate(`/restaurant/detail/${selectedRestaurant.id}`);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", backgroundColor: "#f5f5f5" }} />

      <div className={style.mapControls}>
        <button className={style.controlBtn} onClick={handleMoveToLocation} title="내 위치">
            <FontAwesomeIcon icon={faLocationCrosshairs} />
        </button>
        <div style={{height: '10px'}} /> 
        <button className={style.controlBtn} onClick={handleZoomIn} title="확대">
            <FontAwesomeIcon icon={faPlus} />
        </button>
        <button className={style.controlBtn} onClick={handleZoomOut} title="축소">
            <FontAwesomeIcon icon={faMinus} />
        </button>
      </div>

      {/* 정보창 */}
      {selectedRestaurant && (
        <div className={style.infoWindow} onClick={handleCardClick}>
            <button 
                className={style.infoClose} 
                onClick={(e) => { e.stopPropagation(); setSelectedRestaurant(null); }}
            >
                <FontAwesomeIcon icon={faXmark} />
            </button>
            
            <div className={style.infoContent}>
                {selectedRestaurant.images && selectedRestaurant.images.length > 0 ? (
                   <img 
                     src={selectedRestaurant.images[0].image_url} 
                     alt={selectedRestaurant.name} 
                     className={style.infoThumb} 
                   />
                ) : (
                   <div className={style.infoThumb} /> 
                )}

                <div className={style.infoText}>
                    <h3 className={style.infoName}>{selectedRestaurant.name}</h3>
                    
                    {/*   태그 표시 영역 */}
                    {selectedRestaurant.tags && selectedRestaurant.tags.length > 0 && (
                        <div className={style.tagContainer}>
                            {selectedRestaurant.tags.map((tag) => (
                                <span key={tag.id} className={style.tagBadge}>#{tag.name}</span>
                            ))}
                        </div>
                    )}
                    
                    <div className={style.infoMeta}>
                        ⭐ {selectedRestaurant.rating ? selectedRestaurant.rating.toFixed(1) : "0.0"} 
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}