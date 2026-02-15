"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./page.module.css";
import { getMyFavoriteRestaurants, FavoriteRestaurant } from "../../api/mypage";

export default function MyActivity() {
  const navigate = useNavigate();
  
  // 최근 저장한 식당 목록 상태
  const [recentItems, setRecentItems] = useState<FavoriteRestaurant[]>([]);

  useEffect(() => {
    // 찜한 식당 목록 가져오기 API 호출
    getMyFavoriteRestaurants()
      .then((data) => {
        // 최신순으로 보여주기 위해 배열 역순 정렬 (API가 오래된 순이라면)
        // 만약 API가 이미 최신순이라면 .reverse() 제거
        const sorted = [...data].reverse();
        setRecentItems(sorted);
      })
      .catch((err) => console.error("최근 활동 로딩 실패", err));
  }, []);

  return (
    <div className={style.mainPage}>
      {/* 1. 상단 헤더 */}
      <header className={style.topBar}>
        {/* 뒤로가기 버튼 */}
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

        {/* 배경 로고 (흐릿하게) */}
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
            onClick={() => navigate('/my-restaurant-archive')} // App.tsx에 등록된 경로로 이동
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
            onClick={() => navigate('/my-recipe-archive')} // App.tsx에 등록된 경로로 이동
          >
            <span className={style.listText}>레시피 목록</span>
            <div className={style.listRight}>
              <div className={style.heartCount}>
                <span className={style.heartIcon}>♡</span>
                <span>0</span> {/* 레시피 API 연동 전 0 처리 */}
              </div>
            </div>
            <span className={style.arrow}>›</span>
          </div>
        </div>
      </section>

      {/* 3. 최근 활동 섹션 (하단 스크롤 영역) */}
      <section className={style.recentSection}>
        <div className={style.dotNode}></div>
        <p className={style.recentTitle}>내가 최근 저장한 식당 &amp;레시피</p>
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