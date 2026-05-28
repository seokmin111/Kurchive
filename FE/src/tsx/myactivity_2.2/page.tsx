"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./page.module.css";
// ✅ client 직접 임포트
import client from "../../api/client";
import { useKurchiveI18n } from "../../i18n/LocaleContext";

type RecentItem = {
  id: number;
  type: "restaurant" | "recipe";
  name?: string;
  title?: string;
  rating?: number | null;
  base_serving?: number;
  created_at?: string;
};

export default function MyActivity() {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const myPage = messages.myPage;

  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [restaurantCount, setRestaurantCount] = useState(0);
  const [recipeCount, setRecipeCount] = useState(0);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // 1. 식당 & 레시피 찜 목록 동시 가져오기
        const [restRes, recipeRes] = await Promise.all([
          client.get("/mypage/logs/favorite-restaurants"),
          client.get("/mypage/logs/favorite-recipes"),
        ]);

        const restData = Array.isArray(restRes.data)
          ? restRes.data
          : restRes.data?.data || [];
        const recipeData = Array.isArray(recipeRes.data)
          ? recipeRes.data
          : recipeRes.data?.data || [];

        setRestaurantCount(restData.length);
        setRecipeCount(recipeData.length);

        // 2. 두 배열을 합치기 위해 각 데이터에 type 식별자 추가
        const restaurantsWithType = restData.map((item: any) => ({
          ...item,
          type: "restaurant",
        }));
        const recipesWithType = recipeData.map((item: any) => ({
          ...item,
          type: "recipe",
        }));

        // 3. 합친 후 최신순(created_at 역순)으로 정렬
        const combined = [...restaurantsWithType, ...recipesWithType].sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });

        // 4. 상위 3개만 잘라서 저장
        setRecentItems(combined.slice(0, 3));
      } catch (err) {
        console.error("Failed to load recent activity", err);
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
          alt={messages.common.back}
          className={style.backstep_button}
          onClick={() => navigate(-1)}
        />

        <div className={style.titleGroup}>
          <span className={style.subTitle}>{messages.brand.tagline}</span>
          <h1 className={style.mainTitle}>{messages.brand.name}</h1>
        </div>

        <button className={style.myPageButton} onClick={() => navigate("/mypage")}>
          {myPage.title}
        </button>
      </header>

      {/* 2. 메인 컨텐츠 (즐겨찾기 목록) */}
      <section className={style.favoritesSection}>
        <h2 className={style.sectionTitle}>{myPage.activity.favorites}</h2>
        <div className={style.underline} />

        <img src="/curson_logo.png" alt="Background Logo" className={style.blurImage} />

        {/* 카드 컨테이너 */}
        <div className={style.cardContainer}>
          {/* 식당 목록 카드 */}
          <div className={style.listItem} onClick={() => navigate("/my-restaurant-favorite")}>
            <span className={style.listText}>{myPage.actions.restaurants}</span>
            <div className={style.listRight}>
              <div className={style.heartCount}>
                <span className={style.heartIcon}>♡</span>
                {/* 찜한 식당 개수 표시 */}
                <span>{restaurantCount}</span>
              </div>
            </div>
            <span className={style.arrow}>{">"}</span>
          </div>

          {/* 레시피 목록 카드 */}
          <div className={style.listItem2} onClick={() => navigate("/my-recipe-favorite")}>
            <span className={style.listText}>{myPage.actions.recipes}</span>
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
        <p className={style.recentTitle}>{myPage.activity.recentTitle}</p>
        <div className={style.underline2} />

        <div className={style.recentItems}>
          {recentItems.length > 0 ? (
            recentItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className={style.recentCard}
                // ✅ 식당인지 레시피인지 type에 따라 주소를 다르게 연결 (detail 안 들어감)
                onClick={() => navigate(`/${item.type}/${item.id}`)}
              >
                {/* ✅ 식당은 name, 레시피는 title을 표시 */}
                <div className={style.recentCardName}>
                  {item.type === "restaurant" ? item.name : item.title}
                </div>

                {/* ✅ 식당은 별점, 레시피는 인분을 표시 */}
                <div className={style.recentCardRating}>
                  {item.type === "restaurant"
                    ? `${myPage.activity.rating} ${
                        item.rating != null ? item.rating.toFixed(1) : "0.0"
                      }`
                    : messages.archiveCommon.serves.replace(
                        "{count}",
                        String(item.base_serving)
                      )}
                </div>
              </div>
            ))
          ) : (
            <span className={style.emptyMsg}>{myPage.activity.emptyRecent}</span>
          )}
        </div>
      </section>
    </div>
  );
}
