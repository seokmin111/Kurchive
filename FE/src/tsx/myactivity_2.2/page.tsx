"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./page.module.css";
// ✅ client 직접 임포트
import client from "../../api/client";

export default function MyActivity() {
  const navigate = useNavigate();
  
  // 최근 저장한 식당 목록 상태
  const [recentItems, setRecentItems] = useState<any[]>([]);
  // 레시피 찜 개수 상태 추가
  const [recipeCount, setRecipeCount] = useState(0);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // 1. 식당 찜 목록 가져오기 (백엔드에서 이미 최신순 정렬됨)
        const restRes = await client.get('/mypage/logs/restaurants');
        // 응답이 배열인지 { data: [...] } 구조인지 안전하게 파싱
        const restData = Array.isArray(restRes.data) ? restRes.data : (restRes.data?.data || []);
        setRecentItems(restData);

        // 2. 레시피 찜 목록 가져오기 (개수 표시용)
        const recipeRes = await client.get('/mypage/logs/favorite-recipes');
        const recipeData = Array.isArray(recipeRes.data) ? recipeRes.data : (recipeRes.data?.data || []);
        setRecipeCount(recipeData.length);
        
      } catch (err) {
        console.error("최근 활동 로딩 실패", err);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <div className={style.mainPage}>
      {/* 1. 상단 헤더 */}
      <header className={style.topBar}>
        <img
          src="/backstep_white_background.png" 
          alt="Back"
          className={style.backstep_button}
          onClick={() => navigate(-1)}
        />
        
        <div className={style.titleGroup}>
          <span className={style.subTitle}>우리만의 미식 지도</span>
          <h1 className={style.mainTitle}>커카이브</h1>
        </div>

        <button className={style.myPageButton} onClick={() => navigate('/mypage')}>
          마이페이지
        </button>
      </header>

      {/* 2. 메인 컨텐츠 (즐겨찾기 목록) */}
      <section className={style.favoritesSection}>
        <h2 className={style.sectionTitle}>즐겨찾기 목록</h2>
        <div className={style.underline} />

        <img
          src="/curson_logo.png"
          alt="Background Logo"
          className={style.blurImage}
        />

        {/* 카드 컨테이너 */}
        <div className={style.cardContainer}>
          {/* 식당 목록 카드 */}
          <div 
            className={style.listItem} 
            onClick={() => navigate('/my-restaurant-archive')} 
          >
            <span className={style.listText}>식당 목록</span>
            <div className={style.listRight}>
              <div className={style.heartCount}>
                <span className={style.heartIcon}>♡</span>
                {/* 찜한 식당 개수 표시 */}
                <span>{recentItems.length}</span>
              </div>
            </div>
            <span className={style.arrow}>›</span>
          </div>

          {/* 레시피 목록 카드 */}
          <div 
            className={style.listItem2} 
            onClick={() => navigate('/my-recipe-archive')} 
          >
            <span className={style.listText}>레시피 목록</span>
            <div className={style.listRight}>
              <div className={style.heartCount}>
                <span className={style.heartIcon}>♡</span>
                {/* 찜한 레시피 개수 표시 */}
                <span>{recipeCount}</span>
              </div>
            </div>
            <span className={style.arrow}>›</span>
          </div>
        </div>
      </section>

      {/* 3. 최근 활동 섹션 (하단 스크롤 영역) */}
      <section className={style.recentSection}>
        <div className={style.dotNode}></div>
        <p className={style.recentTitle}>내가 최근 저장한 식당 &amp; 레시피</p>
        <div className={style.underline2} />
        
        <div className={style.recentItems}>
          {recentItems.length > 0 ? (
            recentItems.map((item) => (
              <div 
                key={item.id} 
                className={style.recentCard}
                onClick={() => navigate(`/restaurant/detail/${item.id}`)}
              >
                <div className={style.recentCardName}>{item.name}</div>
                <div className={style.recentCardRating}>★ {item.rating?.toFixed(1) || "0.0"}</div>
              </div>
            ))
          ) : (
            <span className={style.emptyMsg}>최근 저장한 항목이 없습니다.</span>
          )}
        </div>
      </section>
    </div>
  );
}