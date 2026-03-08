"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./page.module.css";
import { getMyPage, MyPageUser, getMyUploadedRecipes, MyRecipeLog } from "../../api/mypage";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const RecipeCard = ({ recipe }: { recipe: MyRecipeLog }) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.restaurantCard}
      onClick={() => navigate(`/recipe/${recipe.id}`)}
    >
      <div className={styles.cardContent}>
        <h3 className={styles.restaurantName}>{recipe.title}</h3>

        <p className={styles.restaurantLocation}>
          기본 {recipe.base_serving}인분
        </p>

        <div className={styles.userInfo}>
          <span className={styles.userCircle}></span>
          <span className={styles.metaText}>
            내가 업로드
          </span>
        </div>

        <div className={styles.bottomRow}>
          <span className={styles.scoreText}>
            {recipe.created_at
              ? new Date(recipe.created_at).toLocaleDateString()
              : ""}
          </span>
        </div>
      </div>

      <div className={styles.cardImage}>
        <div className={styles.noImageText}>
          <div>레시피</div>
        </div>
      </div>
    </div>
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

      <header className={styles.header}>

        <div className={styles.headerLeft}>

          <img
            src="/backstep_white_background.png"
            alt="뒤로가기"
            className={styles.backButton}
            onClick={() => navigate(-1)}
          />

          <div className={styles.logoSection}>
            <span className={styles.logoSubtitle}>우리만의 미식 지도</span>
            <span className={styles.logo}>커카이브</span>
          </div>

        </div>

        <button
          className={styles.myPageButton}
          onClick={() => navigate("/mypage")}
        >
          마이페이지
        </button>

      </header>

      <div className={styles.pageTitle}>
        <span className={styles.username}>
          {user?.nickname || "사용자"}
        </span>{" "}
        님의 레시피 아카이브
      </div>

      <div className={styles.searchSection}>

        <div className={styles.searchBar}>

          <input
            type="text"
            className={styles.searchInput}
            placeholder="내 레시피 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className={styles.searchIcon}
          />

        </div>

      </div>

      <div className={styles.restaurantList}>

        {loading ? (

          <div style={{ textAlign: "center", padding: "20px", color: "#888" }}>
            로딩 중...
          </div>

        ) : filteredRecipes.length > 0 ? (

          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
            />
          ))

        ) : (

          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            {searchQuery
              ? "검색 결과가 없습니다."
              : "아직 업로드한 레시피가 없습니다."}
          </div>

        )}

      </div>

    </div>
  );
}