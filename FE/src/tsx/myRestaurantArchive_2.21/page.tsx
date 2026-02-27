"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./page.module.css";
import client from "../../api/client"; 
import { getMyPage, getMyFavoriteRestaurants, FavoriteRestaurant, MyPageUser } from "../../api/mypage";

// 백엔드 DTO(FavoriteRestaurant)에는 UI에 필요한 일부 필드(이미지 등)가 없을 수 있으므로 확장
interface ExtendedRestaurant extends FavoriteRestaurant {
  summary?: string; 
  thumbnail_url?: string;
  addedAt?: string; 
}
// 별점 컴포넌트
const StarRating = ({ rating }: { rating: number }) => {
  const score = rating || 0;
  return (
    <div className={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= score ? styles.star : styles.starEmpty}
        >
          ★
        </span>
      ))}
    </div>
  );
};

// 식당 카드 컴포넌트
const RestaurantCard = ({ restaurant, onDelete }: { restaurant: ExtendedRestaurant; onDelete: (id: number) => void }) => {
  const navigate = useNavigate();

  return (
    <div 
      className={styles.restaurantCard} 
      onClick={() => navigate(`/restaurant/detail/${restaurant.id}`)}
    >
      <div className={styles.cardContent}>
        <h3 className={styles.restaurantName}>{restaurant.name}</h3>
        <p className={styles.restaurantLocation}>
          {restaurant.summary || restaurant.address || "주소 정보 없음"}
        </p>
        
        <div className={styles.userInfo}>
            <span className={styles.userCircle}></span>
            <span className={styles.metaText}>
                저장한 식당
            </span>
        </div>

        <div className={styles.bottomRow}>
             <StarRating rating={restaurant.rating || 0} />
             <span className={styles.scoreText}>{restaurant.rating?.toFixed(1) || "0.0"}</span>
        </div>
      </div>

      {/* ✅ imageUrl 대신 thumbnail_url 사용 */}
      <div
        className={`${styles.cardImage} ${restaurant.thumbnail_url ? styles.cardImageWithPhoto : ''}`}
        style={restaurant.thumbnail_url ? { backgroundImage: `url(${restaurant.thumbnail_url})` } : {}}
      >
        <button 
            className={styles.deleteButton} 
            onClick={(e) => {
                e.stopPropagation(); // 카드 클릭(상세페이지 이동) 방지
                onDelete(restaurant.id);
            }}
        >
            ✕
        </button>
        
        {!restaurant.thumbnail_url && (
           <div className={styles.noImageText}>
              <div>사진 없음</div>
           </div>
        )}
      </div>
    </div>
  );
};

export default function RestaurantArchivePage() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState<MyPageUser | null>(null);
  const [restaurants, setRestaurants] = useState<ExtendedRestaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      const [userData, favRes] = await Promise.all([
        getMyPage(),
        client.get('/mypage/logs/restaurants')
      ]);

      setUser(userData);

      const favData = Array.isArray(favRes.data)
        ? favRes.data
        : (favRes.data?.data || []);

      setRestaurants(favData);

    } catch (error: any) {
      console.error("데이터 로딩 실패:", error);
    } finally {
      setLoading(false);   // 👈 이게 빠져 있었다
    }
  };

  fetchData();
}, []);


  // 검색 기능
  const filteredRestaurants = restaurants.filter((r) => 
    r.name.includes(searchQuery) || 
    (r.address && r.address.includes(searchQuery))
  );

  // 삭제 핸들러 
  const handleDeleteItem = async (id: number) => {
    if(!window.confirm("아카이브에서 삭제하시겠습니까?")) return;
    
    try {
      // 이전에 만들어둔 즐겨찾기 토글 API를 호출하여 찜 해제 (이미 찜한 상태에서 post하면 취소됨)
      await client.post(`/restaurants/${id}/favorite`);
      
      // 상태 업데이트 (UI에서 즉시 제거)
      setRestaurants(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("즐겨찾기 삭제 실패:", error);
      alert("식당을 아카이브에서 삭제하는 데 실패했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      {/* --- 기존 마크업과 동일 --- */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <img 
            src="/backstep_white_background.png" 
            alt="뒤로가기" 
            className={styles.backButton}
            onClick={() => navigate(-1)}
          />
          <div className={styles.logoSection}>
            <span className={styles.logoSubtitle}>우리만의 미식 지도</span>
            <span className={styles.logo}>커카이브</span>
          </div>
        </div>
        <button className={styles.myPageButton} onClick={() => navigate('/mypage')}>
            마이페이지
        </button>
      </header>

      <div className={styles.pageTitle}>
        <span className={styles.username}>{user?.nickname || "사용자"}</span> 님의 식당 아카이브
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="즐겨찾기 내 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>

      <div className={styles.filterSection}>
        <span className={styles.filterLabel}>
          식당 아카이브에<br />필터 적용하기
        </span>
        <button className={styles.filterDropdown}>지역 <span>▼</span></button>
        <button className={styles.filterDropdown}>음식 종류 <span>▼</span></button>
      </div>

      <div className={styles.restaurantList}>
        {loading ? (
            <div style={{textAlign: 'center', padding: '20px', color: '#888'}}>로딩 중...</div>
        ) : filteredRestaurants.length > 0 ? (
            filteredRestaurants.map((restaurant) => (
            <RestaurantCard 
                key={restaurant.id} 
                restaurant={restaurant} 
                onDelete={handleDeleteItem}
            />
            ))
        ) : (
            <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
                {searchQuery ? "검색 결과가 없습니다." : "아직 저장한 식당이 없습니다."}
            </div>
        )}
      </div>
    </div>
  );
}