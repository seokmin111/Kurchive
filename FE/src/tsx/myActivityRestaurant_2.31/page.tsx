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
import { useKurchiveI18n } from "../../i18n/LocaleContext";

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
  const { messages } = useKurchiveI18n();
  const archive = messages.archiveCommon;

  return (
    <ArchiveItemCard
      title={restaurant.name}
      description={restaurant.address || archive.noAddress}
      metaLabel={archive.archivedByMe}
      rating={restaurant.rating ?? 0}
      imageLabel={messages.common.noPhoto}
      thumbnailUrl={restaurant.thumbnail_url}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
    />
  );
};

export default function RestaurantArchivePage() {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const archive = messages.archiveCommon;

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
          client.get("/mypage/logs/uploaded-restaurants"),
        ]);

        setUser(userData);

        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to load data:", error);
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
        {archive.restaurantArchiveTitle.replace(
          "{nickname}",
          user?.nickname || archive.userFallback
        )}
      </div>

      <ArchiveSearchBar
        classNames={styles}
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={archive.searchMyArchive}
        icon={<FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />}
      />

      <div className={styles.restaurantList}>
        {loading ? (
          <ArchiveStatusMessage variant="loading">{messages.common.loading}</ArchiveStatusMessage>
        ) : filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))
        ) : (
          <ArchiveStatusMessage variant="empty">
            {searchQuery
              ? archive.noSearchResults
              : archive.noArchivedRestaurants}
          </ArchiveStatusMessage>
        )}
      </div>
    </div>
  );
}
