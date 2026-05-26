"use client";

import styles from "./page.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import client from "../../api/client";
import LanguageSelect from "../../components/LanguageSelect";
import { useKurchiveI18n } from "../../i18n/LocaleContext";


type Restaurant = {
  id: number;
  name: string;
  address?: string | null;
  rating?: number | null;
  summary?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  thumbnail_url?: string | null;
  created_at?: number;
  uploaded_by: number;

  uploader?: {
    id: number;
    nickname: string;
  };
};
export default function RestaurantSearchPage() {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const restaurantMain = messages.restaurantMain;
  const short = (s?: string | null, n = 24) =>
    (s ?? "").length > n ? (s ?? "").slice(0, n) + "…" : (s ?? "");

  const formatDate = (ts?: number) => {
    if (!ts) return "";
    const d = new Date(ts * 1000); // 초 → ms
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  };


  const [items, setItems] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const getRestaurants = async () => {

    setLoading(true);
    setErrMsg("");
    try {
      const res = await client.get("/restaurants");
      console.log(res.data);
    //  최신순 정렬 기준이 없으면 일단 id 큰 게 최신이라고 가정
    const list = Array.isArray(res.data) ? res.data : [];
    const recent8 = [...list]
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .slice(0, 8);

    setItems(recent8);
    } catch (e: any) {
      console.error(e);
      if (e?.response?.status === 401) {
        setErrMsg(restaurantMain.loginRequired);
      } else {
        setErrMsg(restaurantMain.loadFailed);
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

      <Link to="/restaurant/search">
        <button className={styles.ivory_btn}>{restaurantMain.search}</button>
      </Link>

      <Link to="/restaurant/archive">
        <button className={styles.red_btn}>{restaurantMain.archive}</button>
      </Link>

      {/* 실데이터 렌더 */}
      <div className={styles.restaurant_container}>
        <div className={styles.scroll_area}>
        {loading && <div style={{ gridColumn: "1 / -1" }}>{restaurantMain.loading}</div>}
        {!loading && errMsg && (
          <div style={{ gridColumn: "1 / -1" }}>{errMsg}</div>
        )}
        
        {!loading &&
          !errMsg &&
          items.map((r) => (
            <div
              key={r.id}
              className={styles.restaurant_item}
              onClick={() => navigate(`/restaurant/${r.id}`)}
              style={{ cursor: "pointer" }}
              title={restaurantMain.detailTitle}
            >
              <div className={styles.restaurant_contentCarrier}>
                <h4 className={styles.restaurant_title}>{r.name}</h4>

                <div className={styles.restaurant_text}>
                  {r.summary ? short(r.summary, 24) : restaurantMain.noSummary}
                </div>

                <div className={styles.restaurant_descriptionContainer}>
                  <div className={styles.restaurant_underContainer}>
                    <div className={styles.restaurant_reviewer}>⭐ {r.rating ?? 0}</div>

                    <div className={styles.restaurant_uploader}>
                      {restaurantMain.uploader}: {r.uploader?.nickname ?? `user_${r.uploaded_by}`}
                    </div>

                    <div className={styles.restaurant_address}>
                      {r.address ?? restaurantMain.noAddress}
                    </div>
                  </div>

                  {r.thumbnail_url ? (
                    <img
                      src={r.thumbnail_url}
                      alt="thumbnail"
                      className={styles.restaurant_thumbnail}
                      style={{ objectFit: "cover" }}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          className={styles.mapFab}
          onClick={() => navigate("/restaurant/map")}
          aria-label={restaurantMain.mapAriaLabel}
        >
          <img
            src="/map.svg"
            alt={restaurantMain.mapAlt}
            className={styles.mapFabIcon}
          />
          <span className={styles.mapFabText}>{restaurantMain.map}</span>
        </button>

        {!loading && !errMsg && items.length === 0 && (
          <div style={{ gridColumn: "1 / -1" }}>{restaurantMain.empty}</div>
        )}
      </div>

      <div className={styles.footer}></div>
    </main>
  );
}
