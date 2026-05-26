"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./page.module.css";
import client from "../../api/client";
import LanguageSelect from "../../components/LanguageSelect";
import { useKurchiveI18n } from "../../i18n/LocaleContext";

type Recipe = {
  id: number;
  title: string;
  base_serving: number;
  uploader_id: number;
  uploader?: {
    id: number;
    nickname: string;
  };
  created_at: string;
  thumbnail_url?: string | null;
};

export default function RecipeMainPage() {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const recipeMain = messages.recipeMain;

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
      if (e?.response?.status === 401) setErrMsg(recipeMain.loginRequired);
      else setErrMsg(recipeMain.loadFailed);
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
        <button
          className={styles.back_btn}
          onClick={() => navigate("/")}
          >
          &lt;
        </button>
        <h1 className={styles.title} style={{ display: "inline" }}>
          {messages.brand.name}
        </h1>
        <p className={styles.sub_title} style={{ display: "inline" }}>
          {messages.brand.tagline}
        </p>
        <div className={styles.languageSlot}>
          <LanguageSelect />
        </div>
      </div>

      {/* 검색창 제거 / 아이보리 버튼만 */}
      <Link to="/recipe/search">
        <button className={styles.ivory_btn}>
          {recipeMain.search}
        </button>
      </Link>
      <Link to="/recipe/archive">
        <button className={styles.red_btn}>{recipeMain.archive}</button>
      </Link>

      {/* 하단 패널 (카드) */}
      <div className={styles.recipe_container}>
        <div className={styles.scroll_area}>
          {loading && <div style={{ gridColumn: "1 / -1" }}>{recipeMain.loading}</div>}
          {!loading && errMsg && <div style={{ gridColumn: "1 / -1" }}>{errMsg}</div>}
          {!loading && !errMsg && recipes.length === 0 && (
            <div style={{ gridColumn: "1 / -1" }}>{recipeMain.empty}</div>
          )}

          {!loading &&
            !errMsg &&
            recipes.map((r) => (
              <div
                key={r.id}
                className={styles.recipe_item}
                onClick={() => navigate(`/recipe/${r.id}`)}
                style={{ cursor: "pointer" }}
                title={recipeMain.detailTitle}
              >
                <div className={styles.recipe_contentCarrier}>
                  <h4 className={styles.recipe_title}>{r.title}</h4>

                  <div className={styles.recipe_text}>
                    {recipeMain.baseServing}: {r.base_serving}
                  </div>

                  <div className={styles.recipe_descriptionContainer}>
                    <div className={styles.recipe_underContainer}>
                      <div className={styles.recipe_uploader}>
                        {recipeMain.uploader}: {r.uploader?.nickname ?? `user_${r.uploader_id}`}
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
      </div>

      <div className={styles.footer}></div>
    </main>
  );
}
