"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./page.module.css";

import RestaurantFormPage from '../restaurant_archive_4.1/page';

export default function RecipeSearchPage() {
  const [keyword, setKeyword] = useState("");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 처음 진입 시 전체 레시피 로드
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

  const onSubmit = async (e: React.FormEvent) => {
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
        <button
          type="submit"
          className={styles.search_btn}
          aria-label="레시피 검색"
        />
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

        <Link to="/recipe/edit">
          <button className={styles.red_btn}>레시피 아카이빙</button>
        </Link>
      </div>

      {/* 로딩 */}
      {loading && (
        <div style={{ padding: 12 }}>
          불러오는 중…
        </div>
      )}

      {/* 레시피 목록 */}
      <div className={styles.recipe_container}>
        {recipes.map((r) => (
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
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {!loading && recipes.length === 0 && (
          <div style={{ padding: 12 }}>
            레시피가 없습니다.
          </div>
        )}
      </div>

            <div className={styles.button_wrapper}>
                <Link to="/">
                    <button className={styles.back_btn}>&lt;<br />메인화면으로 <br /> 돌아가기</button>
                </Link>
                
                <Link to="/recipe/archive">
                    <button className={styles.red_btn}>레시피 아카이빙</button>
                </Link>
            </div>

            <div className={styles.recipe_container}>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.recipe_item}>
                    <div className={styles.recipe_contentCarrier}>
                    <h4 className={styles.recipe_title}>음식 이름</h4>
                    <div className={styles.recipe_text}>뭔가 내용이 들어갈듯</div>
                    <div className={styles.recipe_descriptionContainer}>
                        <div className={styles.recipe_icon}></div>
                        <div className={styles.recipe_underContainer}>
                            <div className={styles.recipe_reviewer}>reviewer name</div>
                            <div className={styles.recipe_date}>Date</div>
                        </div>
                    </div>
                    </div>
                </div>
                
            </div>

            <div className={styles.footer}></div>
        </main>
    );
}
