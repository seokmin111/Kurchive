"use client";

import styles from "./page.module.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { listRecipes, searchRecipes } from "../../api/recipe";

export default function RecipeSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 처음 들어오면 전체 레시피
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await listRecipes();
      setRecipes(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();

    if (!keyword.trim()) {
      loadAll();
      return;
    }

    setLoading(true);
    try {
      const data = await searchRecipes(keyword);
      setRecipes(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.nomrg}>
      <div className={styles.header}>
        <br />
        <h1 className={styles.title} style={{ display: "inline" }}>커카이브</h1>
        <p className={styles.sub_title} style={{ display: "inline" }}>
          우리만의 미식 지도
        </p>
      </div>

      <form className={styles.search_container} onSubmit={onSubmit}>
        <input
          className={styles.input_box}
          placeholder="레시피(요리 이름)를 입력해주세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button className={styles.search_btn}></button>
      </form>

      <div className={styles.button_wrapper}>
        <Link to="/">
          <button className={styles.back_btn}>&lt;<br />메인화면으로<br />돌아가기</button>
        </Link>
        <Link to="/recipe/edit">
          <button className={styles.red_btn}>레시피 아카이빙</button>
        </Link>
      </div>

      {loading && <div style={{ padding: 12 }}>불러오는 중…</div>}

      <div className={styles.recipe_container}>
        {recipes.map((r) => (
          <div className={styles.recipe_item} key={r.id}>
            <div className={styles.recipe_contentCarrier}>
              <h4 className={styles.recipe_title}>{r.title}</h4>

              <div className={styles.recipe_text}>
                기준 인분: {r.base_serving}
              </div>

              <div className={styles.recipe_descriptionContainer}>
                <div className={styles.recipe_icon}></div>
                <div className={styles.recipe_underContainer}>
                  <div className={styles.recipe_reviewer}>
                    업로더 ID: {r.uploader_id}
                  </div>
                  <div className={styles.recipe_date}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}

        {!loading && recipes.length === 0 && (
          <div style={{ padding: 12 }}>레시피가 없습니다.</div>
        )}
      </div>

      <div className={styles.footer}></div>
    </main>
  );
}
