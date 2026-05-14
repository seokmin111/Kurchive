import { useNavigate } from "react-router-dom";
import ArchiveItemCard from "../../../components/common/ArchiveItemCard";

export interface FavoriteRestaurantItem {
  id: number;
  name: string;
  address?: string;
  rating?: number;
  summary?: string;
  thumbnail_url?: string;
}

type Props = {
  restaurant: FavoriteRestaurantItem;
  onDelete: (id: number) => void;
};

export default function RestaurantFavoriteCard({ restaurant, onDelete }: Props) {
  const navigate = useNavigate();

  return (
    <ArchiveItemCard
      title={restaurant.name}
      description={restaurant.summary || restaurant.address || "주소 정보 없음"}
      metaLabel="저장한 식당"
      rating={restaurant.rating ?? 0}
      imageLabel="사진 없음"
      thumbnailUrl={restaurant.thumbnail_url}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      onDelete={() => onDelete(restaurant.id)}
    />
  );
}
