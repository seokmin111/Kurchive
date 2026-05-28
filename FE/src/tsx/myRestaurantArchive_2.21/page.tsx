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
import { useKurchiveI18n } from "../../i18n/LocaleContext";
import RestaurantFavoriteCard, {
  FavoriteRestaurantItem,
} from "./components/RestaurantFavoriteCard";
import styles from "./page.module.css";

const hydrateRestaurantThumbnails = async (
  restaurants: FavoriteRestaurantItem[],
): Promise<FavoriteRestaurantItem[]> => {
  return Promise.all(
    restaurants.map(async (restaurant) => {
      if (restaurant.thumbnail_url) return restaurant;

      try {
        const detailRes = await client.get(`/restaurants/${restaurant.id}`);
        const detail = detailRes.data?.data || detailRes.data;

        return {
          ...restaurant,
          thumbnail_url: detail?.thumbnail_url || restaurant.thumbnail_url,
        };
      } catch (error) {
        console.error("Failed to load restaurant thumbnail:", error);
        return restaurant;
      }
    }),
  );
};

export default function RestaurantArchivePage() {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const archive = messages.archiveCommon;

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

        const favData = Array.isArray(favRes.data) ? favRes.data : favRes.data?.data || [];
        const hydratedFavorites = await hydrateRestaurantThumbnails(favData);
        setRestaurants(hydratedFavorites);
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
    if (!window.confirm(archive.removeConfirm)) return;

    try {
      await client.post(`/restaurants/${id}/favorite`);
      setRestaurants((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to remove favorite restaurant:", error);
      alert(archive.removeRestaurantFailed);
    }
  };

  const emptyMessage = searchQuery
    ? archive.noSearchResults
    : archive.noSavedRestaurants;

  return (
    <div className={styles.container}>
      <ArchiveHeader
        classNames={styles}
        onBack={() => navigate(-1)}
        onMyPage={() => navigate("/mypage")}
      />

      <div className={styles.pageTitle}>
        {archive.savedRestaurantsTitle.replace(
          "{nickname}",
          user?.nickname || archive.userFallback
        )}
      </div>

      <ArchiveSearchBar
        classNames={styles}
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={archive.searchFavorites}
        icon={<FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />}
      />

      <div className={styles.restaurantList}>
        {loading ? (
          <ArchiveStatusMessage variant="loading">{messages.common.loading}</ArchiveStatusMessage>
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
