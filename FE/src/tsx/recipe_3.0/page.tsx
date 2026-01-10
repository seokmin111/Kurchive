"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./page.module.css";

import { listRecipes, searchRecipes } from "../../api/recipe";
console.log("✅ RecipeSearchPage loaded v2");

type RecipeListItem = {
  id: number;
  title: string;
  base_serving: number;
  uploader_id: number;
  created_at: string;
  thumbnail_url?: string | null;
};

const MAX_RECENT = 8;
const MAX_SUGGEST = 8;

export default function RecipeSearchPage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [suggestions, setSuggestions] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string>("");

  // 3.0: 처음 진입 시 최근 8개
  useEffect(() => {
    loadRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRecent = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const data = await listRecipes();

      const recent = (Array.isArray(data) ? data : [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
        .slice(0, MAX_RECENT);

      setRecipes(recent);
    } catch (e) {
      setErrMsg("레시피 목록을 불러오지 못했어요.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // 3.2: 입력 중 연관검색어 (디바운스)
  useEffect(() => {
    const q = keyword.trim();

    if (!q) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchRecipes(q);
        setSuggestions((Array.isArray(data) ? data : []).slice(0, MAX_SUGGEST));
      } catch {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [keyword]);

  // 3.3: 검색 완료 페이지로 이동
  const goResults = (q: string) => {
    const query = q.trim();
    if (!query) return;
    navigate(`/recipe/search/results?q=${encodeURIComponent(query)}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goResults(keyword);
  };

  const showSuggest = keyword.trim().length > 0;

  return (
    <main className={styles.nomrg}>
      {/* 헤더 */}
      <div className={styles.header}>
        <br />
        <h1 className={styles.title} style={{ display: "inline" }}>
          커카이브
        </h1>
        <p className={styles.sub_title} style={{ display: "inline" }}>
          우리만의 미식 지도
        </p>
      </div>

      {/* 검색 */}
      <form className={styles.search_container} onSubmit={onSubmit}>
      <input
        className={styles.input_box}
        placeholder="레시피(요리 이름)를 입력해주세요"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <button type="submit" className={styles.search_btn} aria-label="레시피 검색" />

      {/* form 안에 있어야 absolute가 검색창 기준으로 붙음 */}
      {showSuggest && (
        <ul className={styles.suggestion_list}>
          {suggestions.length === 0 ? (
            <li className={styles.suggestion_empty}>연관 검색어가 없습니다.</li>
          ) : (
            suggestions.map((r) => (
              <li key={r.id} onClick={() => goResults(r.title)}>
                {r.title}
              </li>
            ))
          )}
        </ul>
      )}
    </form>


      {/* 상단 버튼 */}
      <div className={styles.button_wrapper}>
        <Link to="/">
          <button className={styles.back_btn}>
            &lt;
            <br />
            메인화면으로
            <br />
            돌아가기
          </button>
        </Link>

        <Link to="/recipe/archive">
          <button className={styles.red_btn}>레시피 아카이빙</button>
        </Link>
      </div>

      {/* 에러 */}
      {!loading && errMsg && <div style={{ padding: 12 }}>{errMsg}</div>}

      {/* 로딩 */}
      {loading && <div style={{ padding: 12 }}>불러오는 중…</div>}

      {/* 3.0 최근 8개: 입력 중에는 숨김 */}
      {!showSuggest && (
        <div className={styles.recipe_container}>
          {!loading &&
            !errMsg &&
            recipes.map((r) => (
              <Link
                key={r.id}
                to={`/recipe/${r.id}`}
                className={styles.recipe_item}
                style={{ textDecoration: "none" }}
              >
                <div className={styles.recipe_contentCarrier}>
                  <h4 className={styles.recipe_title}>{r.title}</h4>

                  <div className={styles.recipe_text}>
                    기준 인분: {r.base_serving}
                  </div>

                  <div className={styles.recipe_descriptionContainer}>
                    <div className={styles.recipe_icon} />
                    <div className={styles.recipe_underContainer}>
                      <div className={styles.recipe_reviewer}>
                        업로더 ID: {r.uploader_id}
                      </div>
                      <div className={styles.recipe_date}>
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString()
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

          {!loading && !errMsg && recipes.length === 0 && (
            <div style={{ padding: 12 }}>레시피가 없습니다.</div>
          )}
        </div>
      )}

      <div className={styles.footer} />
    </main>
  );
}
