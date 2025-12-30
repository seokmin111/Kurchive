"use client";

import styles from "./page.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import client from "../../api/client";

type Restaurant = {
  id: number;
  name: string;
  address?: string | null;
  rating?: number | null;
  summary?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  thumbnail_url?: string | null;
};

export default function RestaurantSearchPage() {
  const navigate = useNavigate();
  const short = (s?: string | null, n = 24) =>
    (s ?? "").length > n ? (s ?? "").slice(0, n) + "…" : (s ?? "");



  const [items, setItems] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const getRestaurants = async () => {
    setLoading(true);
    setErrMsg("");
    try {
      const res = await client.get("/restaurants");

    //  최신순 정렬 기준이 없으면 일단 id 큰 게 최신이라고 가정
    const list = Array.isArray(res.data) ? res.data : [];
    const recent8 = [...list]
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .slice(0, 8);

    setItems(recent8);
    } catch (e: any) {
      console.error(e);
      if (e?.response?.status === 401) {
        setErrMsg("로그인이 필요합니다. 다시 로그인해줘!");
      } else {
        setErrMsg("식당 목록을 불러오지 못했어.");
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRestaurants();
  }, []);

  return (
    <main className={styles.nomrg}>
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

      <Link to="/restaurant/search">
        <button className={styles.ivory_btn}>식당 검색하기</button>
      </Link>

      <div className={styles.button_wrapper}>
        <Link to="/restaurant/archive">
          <button className={styles.red_btn}>식당 아카이빙</button>
        </Link>
      </div>

      {/* 실데이터 렌더 */}
      <div className={styles.restaurant_container}>
        {loading && <div style={{ gridColumn: "1 / -1" }}>로딩중...</div>}
        {!loading && errMsg && (
          <div style={{ gridColumn: "1 / -1" }}>{errMsg}</div>
        )}
        

        {!loading &&
          !errMsg &&
          items.map((r) => (
            <div
              key={r.id}
              className={styles.restaurant_item}
              onClick={() => navigate(`/restaurant/search/results?q=${encodeURIComponent(r.name)}`)}
              style={{ cursor: "pointer" }}
              title="클릭해서 검색 결과로 이동"
            >
              <div className={styles.restaurant_contentCarrier}>
                <h4 className={styles.restaurant_title}>{r.name}</h4>
                <div className={styles.restaurant_text}>
                    {r.summary ? short(r.summary, 24) : "요약 없음"}
                </div>

                <div className={styles.restaurant_descriptionContainer}>
                  {/* 썸네일 있으면 이미지, 없으면 기존 빨간 원 */}
                  {r.thumbnail_url ? (
                    <img
                      src={r.thumbnail_url}
                      alt="thumbnail"
                      className={styles.restaurant_icon}
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className={styles.restaurant_icon}></div>
                  )}

                  <div className={styles.restaurant_underContainer}>
                    <div className={styles.restaurant_reviewer}>
                      ⭐ {r.rating ?? 0} · {r.price_min ?? "-"} ~ {r.price_max ?? "-"}
                    </div>
                    <div className={styles.restaurant_date}>
                      {r.address ?? "주소 정보 없음"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {!loading && !errMsg && items.length === 0 && (
          <div style={{ gridColumn: "1 / -1" }}>등록된 식당이 없어!</div>
        )}
      </div>

      <div className={styles.footer}></div>
    </main>
  );
}
