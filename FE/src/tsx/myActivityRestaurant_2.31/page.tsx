"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./page.module.css";
import client from "../../api/client"; 
import { getMyPage, MyPageUser } from "../../api/mypage";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

interface MyRestaurant {
  id: number;
  name: string;
  address?: string;
  rating?: number;
  thumbnail_url?: string;
  created_at?: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  const score = rating || 0;

  return (
    <div className={styles.ratingContainer}>
      {[1,2,3,4,5].map((star) => (
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

const RestaurantCard = ({ restaurant }: { restaurant: MyRestaurant }) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.restaurantCard}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
    >
      <div className={styles.cardContent}>
        <h3 className={styles.restaurantName}>{restaurant.name}</h3>

        <p className={styles.restaurantLocation}>
          {restaurant.address || "주소 정보 없음"}
        </p>

        <div className={styles.userInfo}>
          <span className={styles.userCircle}></span>
          <span className={styles.metaText}>
            내가 아카이빙
          </span>
        </div>

        <div className={styles.bottomRow}>
          <StarRating rating={restaurant.rating || 0} />
          <span className={styles.scoreText}>
            {restaurant.rating?.toFixed(1) || "0.0"}
          </span>
        </div>
      </div>

      <div
        className={`${styles.cardImage} ${
          restaurant.thumbnail_url ? styles.cardImageWithPhoto : ""
        }`}
        style={
          restaurant.thumbnail_url
            ? { backgroundImage: `url(${restaurant.thumbnail_url})` }
            : {}
        }
      >
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
  const [restaurants, setRestaurants] = useState<MyRestaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchData = async () => {
      try {

        setLoading(true);

        const [userData, res] = await Promise.all([
          getMyPage(),
          client.get("/mypage/logs/uploaded-restaurants")
        ]);

        setUser(userData);

        const data = Array.isArray(res.data)
          ? res.data
          : (res.data?.data || []);

        setRestaurants(data);

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, []);

  const filteredRestaurants = restaurants.filter((r) =>
    r.name.includes(searchQuery) ||
    (r.address && r.address.includes(searchQuery))
  );

  return (
    <div className={styles.container}>

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

        <button
          className={styles.myPageButton}
          onClick={() => navigate("/mypage")}
        >
          마이페이지
        </button>

      </header>

      <div className={styles.pageTitle}>
        <span className={styles.username}>
          {user?.nickname || "사용자"}
        </span>{" "}
        님의 식당 아카이브
      </div>

      <div className={styles.searchSection}>

        <div className={styles.searchBar}>

          <input
            type="text"
            className={styles.searchInput}
            placeholder="내 아카이브 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />

        </div>

      </div>

      <div className={styles.restaurantList}>

        {loading ? (
          <div style={{textAlign:"center",padding:"20px",color:"#888"}}>
            로딩 중...
          </div>

        ) : filteredRestaurants.length > 0 ? (

          filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))

        ) : (

          <div style={{textAlign:"center",padding:"40px",color:"#999"}}>
            {searchQuery
              ? "검색 결과가 없습니다."
              : "아직 아카이빙한 식당이 없습니다."}
          </div>

        )}

      </div>

    </div>
  );
}