"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./page.module.css";
import { getMyPage, MyPageUser, getMyUploadedRecipes, MyRecipeLog } from "../../api/mypage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import ArchiveHeader from "../../components/common/ArchiveHeader";
import ArchiveItemCard from "../../components/common/ArchiveItemCard";
import ArchiveSearchBar from "../../components/common/ArchiveSearchBar";
import ArchiveStatusMessage from "../../components/common/ArchiveStatusMessage";

const RecipeCard = ({ recipe }: { recipe: MyRecipeLog }) => {
  const navigate = useNavigate();
  const dateText = recipe.created_at
    ? new Date(recipe.created_at).toLocaleDateString()
    : "";

  return (
    <ArchiveItemCard
      title={recipe.title}
      description={`기본 ${recipe.base_serving}인분`}
      metaLabel="내가 업로드"
      dateText={dateText}
      imageLabel="레시피"
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    />
  );
};

export default function RecipeArchivePage() {

  const navigate = useNavigate();

  const [user, setUser] = useState<MyPageUser | null>(null);
  const [recipes, setRecipes] = useState<MyRecipeLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchData = async () => {

      try {

        setLoading(true);

        const [userData, recipesData] = await Promise.all([
          getMyPage(),
          getMyUploadedRecipes()
        ]);

        setUser(userData);
        setRecipes(recipesData);

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }

    };

    fetchData();

  }, []);

  const filteredRecipes = recipes.filter((r) =>
    r.title.includes(searchQuery)
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
        님의 레시피 아카이브
      </div>

      <ArchiveSearchBar
        classNames={styles}
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="내 레시피 검색"
        icon={<FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />}
      />

      <div className={styles.restaurantList}>

        {loading ? (
          <ArchiveStatusMessage variant="loading">로딩 중...</ArchiveStatusMessage>

        ) : filteredRecipes.length > 0 ? (

          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
            />
          ))

        ) : (

          <ArchiveStatusMessage variant="empty">
            {searchQuery
              ? "검색 결과가 없습니다."
              : "아직 업로드한 레시피가 없습니다."}
          </ArchiveStatusMessage>

        )}

      </div>

    </div>
  );
}
