"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./page.module.css";
import client from "../../api/client";

type Recipe = {
  id: number;
  title: string;
  base_serving: number;
  uploader_id: number;
  created_at: string; // FastAPI datetime -> ISO string
  thumbnail_url?: string | null;
};

export default function RecipeMainPage() {
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };

  const getRecipes = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const res = await client.get<Recipe[]>("/recipe/list");
      const list = Array.isArray(res.data) ? res.data : [];

      // 식당 메인처럼 최신 8개만
      const recent8 = [...list]
        .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
        .slice(0, 8);

      setRecipes(recent8);
    } catch (e: any) {
      console.error(e);
      if (e?.response?.status === 401) setErrMsg("로그인이 필요합니다. 다시 로그인해줘!");
      else setErrMsg("레시피 목록을 불러오지 못했어.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRecipes();
  }, []);

  return (
    <main className={styles.nomrg}>
      {/* 헤더 (식당 메인처럼) */}
      <div className={styles.header}>
        <Link to="/main">
          <button className={styles.back_btn}>
            &lt;<br />
            메인화면으로 <br /> 돌아가기
          </button>
        </Link>

        <br />
        <h1 className={styles.title} style={{ display: "inline" }}>
          커카이브
        </h1>
        <p className={styles.sub_title} style={{ display: "inline" }}>
          우리만의 미식 지도
        </p>
      </div>

      {/* 검색창 제거 / 아이보리 버튼만 */}
      <Link
        to="/recipe/search"
        style={{ textDecoration: "none" }}
      >
        <button className={styles.ivory_btn}>
          레시피 검색하기
        </button>
      </Link>


      {/* ✅ 식당처럼: 그 아래 빨간 아카이빙 버튼 */}
      <div className={styles.button_wrapper}>
        <Link to="/recipe/archive">
          <button className={styles.red_btn}>레시피 아카이빙</button>
        </Link>
      </div>

      {/* 하단 패널 (카드) */}
      <div className={styles.recipe_container}>
        {loading && <div style={{ gridColumn: "1 / -1" }}>로딩중...</div>}
        {!loading && errMsg && <div style={{ gridColumn: "1 / -1" }}>{errMsg}</div>}
        {!loading && !errMsg && recipes.length === 0 && (
          <div style={{ gridColumn: "1 / -1" }}>등록된 레시피가 없어!</div>
        )}

        {!loading &&
          !errMsg &&
          recipes.map((r) => (
            <div
              key={r.id}
              className={styles.recipe_item}
              onClick={() => navigate(`/recipe/${r.id}`)}
              style={{ cursor: "pointer" }}
              title="클릭해서 레시피 상세로 이동"
            >
              <div className={styles.recipe_contentCarrier}>
                <h4 className={styles.recipe_title}>{r.title}</h4>

                <div className={styles.recipe_text}>
                  기준 인분: {r.base_serving}
                </div>

                <div className={styles.recipe_descriptionContainer}>
                  <div className={styles.recipe_underContainer}>
                    <div className={styles.recipe_uploader}>
                      업로더: user_{r.uploader_id}
                    </div>

                    <div className={styles.recipe_date}>
                      {formatDate(r.created_at)}
                    </div>
                  </div>

                  {r.thumbnail_url && (
                    <img
                      src={r.thumbnail_url}
                      alt="thumbnail"
                      className={styles.recipe_thumbnail}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className={styles.footer}></div>
    </main>
  );
}
