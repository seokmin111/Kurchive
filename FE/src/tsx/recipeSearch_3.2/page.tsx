"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import styles from "./page.module.css";

import { listRecipes, searchRecipes } from "../../api/recipe";

type Recipe = {
  id: number;
  title: string;
  base_serving: number;
  uploader_id: number;
  created_at: string;
  thumbnail_url?: string | null;
};


export default function RecipeSearchPage() {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [items, setItems] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const trimmed = useMemo(() => q.trim(), [q]);

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };

  const runSearch = async (keyword?: string) => {
  setLoading(true);
  setErrMsg("");

  try {
    let data;

    if (!keyword) {
      data = await listRecipes();   // ⭐ 전체 목록
    } else {
      data = await searchRecipes(keyword);  // ⭐ 검색
    }

    const list = Array.isArray(data) ? (data as Recipe[]) : [];
    const sorted = [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

    setItems(sorted);
  } catch (e: any) {
    console.error(e);
    setErrMsg("레시피를 불러오지 못했습니다.");
    setItems([]);
  } finally {
    setLoading(false);
  }
};

  const onSubmit = async (e?: React.FormEvent) => {
  e?.preventDefault();

  const keyword = trimmed;

  if (!keyword) {
    setErrMsg("");
    setSp({}, { replace: true });
    await runSearch();   // 전체 목록 다시 로드
    return;
  }

  setSp({ q: keyword }, { replace: true });
  await runSearch(keyword);
};

  // /recipe/search?q=xxx 로 직접 들어온 경우 자동 검색
  useEffect(() => {
  const urlQ = sp.get("q");

  if (urlQ && urlQ.trim()) {
    setQ(urlQ);
    runSearch(urlQ.trim());
  } else {
    runSearch();  // ⭐ 전체 레시피 로드
  }
}, []);

  return (
    <main className={styles.nomrg}>
      {/* 헤더 */}
      <div className={styles.header}>
        <Link to="/recipe">
          <button className={styles.back_btn}>
            &lt;
          </button>
        </Link>

        <br />
        <h1 className={styles.title} style={{ display: "inline" }}>
          커카이브
        </h1>
        <p className={styles.sub_title} style={{ display: "inline" }}>
          레시피 검색
        </p>
      </div>

      {/* 검색바 */}
      <form className={styles.search_container} onSubmit={onSubmit}>
        <input
          className={styles.input_box}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="레시피 이름을 입력해주세요."
          autoFocus
        />
        <button className={styles.search_btn} type="submit" aria-label="search" />
      </form>

      {/* 결과 리스트 */}
      <div className={styles.result_container}>
        {loading && <div className={styles.msg}>로딩중...</div>}

        {!loading && errMsg && <div className={styles.msg}>{errMsg}</div>}

        {!loading && !errMsg && trimmed && items.length === 0 && (
          <div className={styles.msg}>검색 결과가 없습니다.</div>
        )}

        {!loading &&
          !errMsg &&
          items.map((r) => (
            <div
              key={r.id}
              className={styles.recipe_item}
              onClick={() => navigate(`/recipe/${r.id}`)}
              style={{ cursor: "pointer" }}
              title="클릭해서 레시피 상세로 이동"
            >
              <h4 className={styles.recipe_title}>{r.title}</h4>
              <div className={styles.recipe_text}>기준 인분: {r.base_serving}</div>

              <div className={styles.recipe_descriptionContainer}>
                {r.thumbnail_url ? (
                  <img
                    src={r.thumbnail_url}
                    alt="thumbnail"
                    className={styles.recipe_icon}
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className={styles.recipe_icon} />
                )}

                <div className={styles.recipe_underContainer}>
                  <div className={styles.recipe_reviewer}>업로더 ID: {r.uploader_id}</div>
                  <div className={styles.recipe_date}>{formatDate(r.created_at)}</div>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className={styles.footer} />
    </main>
  );
}
