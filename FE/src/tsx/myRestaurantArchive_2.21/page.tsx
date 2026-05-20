"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import ArchiveHeader from "../../components/common/ArchiveHeader";
import ArchiveSearchBar from "../../components/common/ArchiveSearchBar";
import ArchiveStatusMessage from "../../components/common/ArchiveStatusMessage";
import client from "../../api/client";
import { getMyPage, MyPageUser } from "../../api/mypage";
import RestaurantFavoriteCard, {
  FavoriteRestaurantItem,
} from "./components/RestaurantFavoriteCard";
import styles from "./page.module.css";

export default function RestaurantArchivePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<MyPageUser | null>(null);
  const [restaurants, setRestaurants] = useState<FavoriteRestaurantItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [userData, favRes] = await Promise.all([
          getMyPage(),
          client.get("/mypage/logs/favorite-restaurants"),
        ]);

        setUser(userData);

        const favData = Array.isArray(favRes.data) ? favRes.data : (favRes.data?.data || []);
        setRestaurants(favData);
      } catch (error: any) {
        console.error("Failed to load favorite restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ),
    [restaurants, searchQuery]
  );

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("아카이브에서 삭제하시겠습니까?")) return;

    try {
      await client.post(`/restaurants/${id}/favorite`);
      setRestaurants((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to remove favorite restaurant:", error);
      alert("식당을 아카이브에서 삭제하는 데 실패했습니다.");
    }
  };

  const emptyMessage = searchQuery
    ? "검색 결과가 없습니다."
    : "아직 저장한 식당이 없습니다.";

  return (
    <div className={styles.container}>
      <ArchiveHeader
        classNames={styles}
        onBack={() => navigate(-1)}
        onMyPage={() => navigate("/mypage")}
      />

      <div className={styles.pageTitle}>
        <span className={styles.username}>{user?.nickname || "사용자"}</span> 님이 찜한 식당
      </div>

      <ArchiveSearchBar
        classNames={styles}
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="즐겨찾기 내 검색"
        icon={<FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />}
      />

      <div className={styles.restaurantList}>
        {loading ? (
          <ArchiveStatusMessage variant="loading">로딩 중...</ArchiveStatusMessage>
        ) : filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <RestaurantFavoriteCard
              key={restaurant.id}
              restaurant={restaurant}
              onDelete={handleDeleteItem}
            />
          ))
        ) : (
          <ArchiveStatusMessage variant="empty">{emptyMessage}</ArchiveStatusMessage>
        )}
      </div>
    </div>
  );
}
