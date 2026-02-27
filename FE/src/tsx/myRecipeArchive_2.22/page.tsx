"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./page.module.css";
import client from "../../api/client"; 
import { getMyPage, MyPageUser } from "../../api/mypage";

// 백엔드 반환 DTO 형태에 맞춘 FavoriteRecipe 인터페이스
interface FavoriteRecipe {
  id: number;
  title: string;
  base_serving: number;
  thumbnail_url?: string;
  created_at?: string;
}

// 레시피 카드 컴포넌트
const RecipeCard = ({ recipe, onDelete }: { recipe: FavoriteRecipe; onDelete: (id: number) => void }) => {
  const navigate = useNavigate();

  return (
    <div 
      className={styles.restaurantCard} 
      onClick={() => navigate(`/recipe/detail/${recipe.id}`)}
    >
      <div className={styles.cardContent}>
        {/* CSS 클래스명은 기존 구조(restaurantName)를 유지하며 데이터만 레시피 정보로 바인딩합니다 */}
        <h3 className={styles.restaurantName}>{recipe.title}</h3>
        <p className={styles.restaurantLocation}>
          기본 {recipe.base_serving}인분
        </p>
        
        <div className={styles.uploader}>
          <div className={styles.redcircle}></div>
          <div>
            <div className={styles.uploader_name}>저장한 레시피</div>
            <div className={styles.uploader_date}>
              {recipe.created_at ? new Date(recipe.created_at).toLocaleDateString() : ""}
            </div>
          </div>
        </div>
      </div>
      
      <div
        className={`${styles.cardImage} ${recipe.thumbnail_url ? styles.cardImageWithPhoto : ""}`}
        style={recipe.thumbnail_url ? { backgroundImage: `url(${recipe.thumbnail_url})` } : {}}
      >
        <button 
          className={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation(); // 카드 전체 클릭(상세 이동) 방지
            onDelete(recipe.id);
          }}
        >
          ✕
        </button>
        
        {!recipe.thumbnail_url && (
          <div className={styles.imagePlaceholder}>
            <span className={styles.imageIcon}>🖼</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function RecipeArchivePage() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState<MyPageUser | null>(null);
  const [recipes, setRecipes] = useState<FavoriteRecipe[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 내 정보와 찜한 레시피 목록 동시 호출
        const [userData, recipesRes] = await Promise.all([
          getMyPage(),
          client.get<FavoriteRecipe[]>('/mypage/logs/favorite-recipes')
        ]);
        
        setUser(userData);
        // 백엔드에서 최신순 정렬해서 넘겨주므로 그대로 사용
        setRecipes(recipesRes.data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 검색 기능 (레시피 제목 기준)
  const filteredRecipes = recipes.filter((r) => 
    r.title.includes(searchQuery)
  );

  // 삭제(찜 해제) 핸들러
  const handleDeleteItem = async (id: number) => {
    if(!window.confirm("아카이브에서 삭제하시겠습니까?")) return;
    
    try {
      // 레시피 즐겨찾기 토글(해제) API 호출
      await client.post(`/recipe/${id}/favorite`);
      
      // 상태 즉시 반영
      setRecipes(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("즐겨찾기 삭제 실패:", error);
      alert("레시피를 아카이브에서 삭제하는 데 실패했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>{'<'}</button>
          <div className={styles.logoSection}>
            <span className={styles.logoSubtitle}>우리만의 미식 지도</span>
            <span className={styles.logo}>커카이브</span>
          </div>
        </div>
        <button className={styles.myPageButton} onClick={() => navigate('/mypage')}>
          마이페이지
        </button>
      </header>

      {/* 페이지 제목 */}
      <div className={styles.pageTitle}>
              <span className={styles.username}>{user?.nickname || "사용자"}</span> 님의 식당 아카이브
       </div>

      {/* 검색바 */}
      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="즐겨찾기 내 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      </div>

      {/* 레시피 리스트 */}
      <div className={styles.restaurantList}>
        {loading ? (
          <div style={{textAlign: 'center', padding: '20px', color: '#888'}}>로딩 중...</div>
        ) : filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeCard 
              key={recipe.id} 
              recipe={recipe} 
              onDelete={handleDeleteItem} 
            />
          ))
        ) : (
          <div style={{textAlign: 'center', padding: '40px', color: '#999'}}>
            {searchQuery ? "검색 결과가 없습니다." : "아직 저장한 레시피가 없습니다."}
          </div>
        )}
      </div>
    </div>
  );
}