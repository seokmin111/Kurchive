import { useNavigate } from "react-router-dom";
import ArchiveItemCard from "../../../components/common/ArchiveItemCard";

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
  const dateText = recipe.created_at
    ? new Date(recipe.created_at).toLocaleDateString()
    : "";

  return (
    <ArchiveItemCard
      title={recipe.title}
      description={`기본 ${recipe.base_serving}인분`}
      metaLabel="저장한 레시피"
      dateText={dateText}
      imageLabel="레시피"
      thumbnailUrl={recipe.thumbnail_url}
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      onDelete={() => onDelete(recipe.id)}
    />
  );
}
