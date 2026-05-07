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
import RecipeFavoriteCard, { FavoriteRecipeItem } from "./components/RecipeFavoriteCard";
import styles from "./page.module.css";

export default function RecipeArchivePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<MyPageUser | null>(null);
  const [recipes, setRecipes] = useState<FavoriteRecipeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [userData, recipesRes] = await Promise.all([
          getMyPage(),
          client.get<FavoriteRecipeItem[]>("/mypage/logs/favorite-recipes"),
        ]);

        setUser(userData);
        setRecipes(recipesRes.data);
      } catch (error) {
        console.error("Failed to load favorite recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRecipes = useMemo(
    () =>
      recipes.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ),
    [recipes, searchQuery]
  );

  const handleDeleteItem = async (id: number) => {
    if (!window.confirm("아카이브에서 삭제하시겠습니까?")) return;

    try {
      await client.post(`/recipe/${id}/favorite`);
      setRecipes((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to remove favorite recipe:", error);
      alert("레시피를 아카이브에서 삭제하는 데 실패했습니다.");
    }
  };

  const emptyMessage = searchQuery
    ? "검색 결과가 없습니다."
    : "아직 저장한 레시피가 없습니다.";

  return (
    <div className={styles.container}>
      <ArchiveHeader
        classNames={styles}
        onBack={() => navigate(-1)}
        onMyPage={() => navigate("/mypage")}
      />

      <div className={styles.pageTitle}>
        <span className={styles.username}>{user?.nickname || "사용자"}</span> 님 찜한 레시피
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
        ) : filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeFavoriteCard
              key={recipe.id}
              recipe={recipe}
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
