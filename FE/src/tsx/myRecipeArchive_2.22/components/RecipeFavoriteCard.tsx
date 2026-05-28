import { useNavigate } from "react-router-dom";
import ArchiveItemCard from "../../../components/common/ArchiveItemCard";
import { useKurchiveI18n } from "../../../i18n/LocaleContext";

export interface FavoriteRecipeItem {
  id: number;
  title: string;
  base_serving: number;
  thumbnail_url?: string;
  created_at?: string;
}

type Props = {
  recipe: FavoriteRecipeItem;
  onDelete: (id: number) => void;
};

export default function RecipeFavoriteCard({ recipe, onDelete }: Props) {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const archive = messages.archiveCommon;
  const dateText = recipe.created_at
    ? new Date(recipe.created_at).toLocaleDateString()
    : "";

  return (
    <ArchiveItemCard
      title={recipe.title}
      description={archive.serves.replace("{count}", String(recipe.base_serving))}
      metaLabel={archive.savedRecipe}
      dateText={dateText}
      imageLabel={archive.noPhoto}
      thumbnailUrl={recipe.thumbnail_url}
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      onDelete={() => onDelete(recipe.id)}
    />
  );
}
