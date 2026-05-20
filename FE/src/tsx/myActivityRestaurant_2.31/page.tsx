"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./page.module.css";
import client from "../../api/client"; 
import { getMyPage, MyPageUser } from "../../api/mypage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import ArchiveHeader from "../../components/common/ArchiveHeader";
import ArchiveItemCard from "../../components/common/ArchiveItemCard";
import ArchiveSearchBar from "../../components/common/ArchiveSearchBar";
import ArchiveStatusMessage from "../../components/common/ArchiveStatusMessage";

interface MyRestaurant {
  id: number;
  name: string;
  address?: string;
  rating?: number;
  thumbnail_url?: string;
  created_at?: string;
}

const RestaurantCard = ({ restaurant }: { restaurant: MyRestaurant }) => {
  const navigate = useNavigate();

  return (
    <ArchiveItemCard
      title={restaurant.name}
      description={restaurant.address || "주소 정보 없음"}
      metaLabel="내가 아카이빙"
      rating={restaurant.rating ?? 0}
      imageLabel="사진 없음"
      thumbnailUrl={restaurant.thumbnail_url}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
    />
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
  r.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
);

  return (
    <div className={styles.container}>
      <ArchiveHeader
        classNames={styles}
        onBack={() => navigate(-1)}
        onMyPage={() => navigate("/mypage")}
      />

      <div className={styles.pageTitle}>
        <span className={styles.username}>
          {user?.nickname || "사용자"}
        </span>{" "}
        님의 식당 아카이브
      </div>

      <ArchiveSearchBar
        classNames={styles}
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="내 아카이브 검색"
        icon={<FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />}
      />

      <div className={styles.restaurantList}>

        {loading ? (
          <ArchiveStatusMessage variant="loading">로딩 중...</ArchiveStatusMessage>

        ) : filteredRestaurants.length > 0 ? (

          filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))

        ) : (

          <ArchiveStatusMessage variant="empty">
            {searchQuery
              ? "검색 결과가 없습니다."
              : "아직 아카이빙한 식당이 없습니다."}
          </ArchiveStatusMessage>

        )}

      </div>

    </div>
  );
}
