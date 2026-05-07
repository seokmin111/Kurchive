"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import client from "../../api/client";
import styles from "./page.module.css"; 

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

export default function RestaurantSearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const q = (params.get("q") || "").trim();
  const region_id = (params.get("region_id") || "").trim();
  const tag_ids = (params.get("tag_ids") || "").trim();
  const price_min = (params.get("price_min") || "").trim();
  const price_max = (params.get("price_max") || "").trim();
  const min_rating = (params.get("min_rating") || "").trim();

  const [items, setItems] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setErrMsg("");

      try {
        if (q) {
          const res = await client.get("/restaurants/search", {
            params: { q },
          });
          setItems(Array.isArray(res.data) ? res.data : []);
          return;
        }

        const res = await client.get("/restaurants", {
          params: {
            ...(region_id ? { region_id } : {}),
            ...(tag_ids ? { tag_ids } : {}),
            ...(price_min ? { price_min } : {}),
            ...(price_max ? { price_max } : {}),
            ...(min_rating ? { min_rating } : {}),
          },
        });

        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          setItems([]);
          setErrMsg("로그인이 만료되었습니다. 다시 로그인해주시기 바랍니다!");
          return;
        }
        console.error(err);
        setItems([]);
        setErrMsg(
          "검색 결과를 불러오지 못했습니다. 네트워크/서버 상태를 확인해주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q, region_id, tag_ids, price_min, price_max, min_rating]);

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <span className={styles.back} onClick={() => navigate(-1)}>
          ←
        </span>
        <span className={styles.searchTitle}>검색 결과</span>
      </div>

      {loading && <p>로딩중...</p>}
      {!loading && errMsg && <p className={styles.empty}>{errMsg}</p>}
      {!loading && !errMsg && items.length === 0 && (
        <p className={styles.empty}>검색 결과가 없습니다</p>
      )}

      <div className={styles.list}>
        {items.map((r) => (
          <div
            key={r.id}
            className={styles.card}
            onClick={() => navigate(`/restaurant/${r.id}`)} // ✅ 추가
            style={{ cursor: "pointer" }} // ✅ 선택(UX)
            role="button"                 // ✅ 선택(접근성)
            tabIndex={0}                  // ✅ 선택(키보드)
            onKeyDown={(e) => {           // ✅ 선택(Enter로 이동)
              if (e.key === "Enter") navigate(`/restaurant/${r.id}`);
            }}
          >
            <div className={styles.cardLeft}>
              <div className={styles.name}>{r.name}</div>
              <div className={styles.sub}>{r.address || "주소 정보 없음"}</div>

              <div className={styles.ratingRow}>
                ⭐ {r.rating ?? 0}
                {" · "}
                {`${r.price_min}원` ?? "-"} ~ {`${r.price_max}원` ?? "-"}
              </div>

              {r.summary ? <div className={styles.sub}>{r.summary}</div> : null}
            </div>

            <div className={styles.cardRight}>
              <span className={styles.cardRightText}>음식 사진</span>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
