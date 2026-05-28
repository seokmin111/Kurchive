import { useNavigate } from "react-router-dom";
import ArchiveItemCard from "../../../components/common/ArchiveItemCard";
import { useKurchiveI18n } from "../../../i18n/LocaleContext";

export interface FavoriteRestaurantItem {
  id: number;
  name: string;
  address?: string;
  rating?: number;
  summary?: string;
  thumbnail_url?: string | null;
}

type Props = {
  restaurant: FavoriteRestaurantItem;
  onDelete: (id: number) => void;
};

export default function RestaurantFavoriteCard({ restaurant, onDelete }: Props) {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const archive = messages.archiveCommon;

  return (
    <ArchiveItemCard
      title={restaurant.name}
      description={restaurant.summary || restaurant.address || archive.noAddress}
      metaLabel={archive.savedRestaurant}
      rating={restaurant.rating ?? 0}
      imageLabel={messages.common.noPhoto}
      thumbnailUrl={restaurant.thumbnail_url}
      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
      onDelete={() => onDelete(restaurant.id)}
    />
  );
}
