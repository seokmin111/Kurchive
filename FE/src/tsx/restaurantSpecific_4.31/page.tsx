"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "./page.module.css";
import client from "../../api/client"; // 기존 프로젝트에서 쓰던 axios client

type Tag = { id: number; name: string };
type Region = { id: number; name: string; parent_id?: number | null; depth?: number | null };
type Image = { id: number; image_url: string; created_at: number; is_cover?: boolean };

type RestaurantDetail = {
  id: number;
  name: string;

  uploaded_by: number;  

  address?: string | null;
  location_link: string;
  region?: Region | null;
  tags: Tag[];
  rating: number;
  summary: string;
  description: string;
  price_min: number;
  price_max: number;
  images?: Image[];
};



function formatPrice(min?: number, max?: number) {
  const a = min ?? 0;
  const b = max ?? 0;
  const f = (n: number) => n.toLocaleString("ko-KR");
  if (!a && !b) return "가격 정보 없음";
  if (a === b) return `${f(a)}원`;
  return `${f(a)}원 ~ ${f(b)}원`;
}

function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, Math.round(value ?? 0)));
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: 18,
            lineHeight: 1,
            color: i < v ? "#8B0029" : "#e6c6d0",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function RestaurantSpecific() {
  const [canSave, setCanSave] = useState<boolean>(true);

  const nav = useNavigate();
  const { restaurantId } = useParams(); // 라우트가 /restaurants/:restaurantId 라는 가정

  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const myUserIdStr = localStorage.getItem("user_id");
  const myUserId = myUserIdStr ? Number(myUserIdStr) : null;

  const isAuthor = myUserId !== null && restaurant?.uploaded_by === myUserId;

  useEffect(() => {
  if (restaurant) {
    console.log("restaurant:", restaurant);
  }
}, [restaurant]);


  useEffect(() => {
    const id = Number(restaurantId);
    if (!id || Number.isNaN(id)) {
      setErr("잘못된 식당 ID");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await client.get(`/restaurants/${id}`);
        setRestaurant(res.data);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "식당 정보를 불러오지 못했어.");
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId]);

  const coverUrl = useMemo(() => {
    const imgs = restaurant?.images ?? [];
    const cover = imgs.find((x) => x.is_cover);
    return (cover?.image_url ?? imgs[0]?.image_url) || "";
  }, [restaurant]);

  // 태그: 너 UI에서는 ["서울","종로/중구","인도 음식"] 처럼 한 줄로 보여줘야 하니
  // 지역 + 식당태그 합쳐서 그대로 칩으로 뿌림
  const tagLabels = useMemo(() => {
    const regionName = restaurant?.region?.name ? [restaurant.region.name] : [];
    const restTags = (restaurant?.tags ?? []).map((t) => t.name);
    return Array.from(new Set([...regionName, ...restTags]));
  }, [restaurant]);

  // 추천 메뉴는 API에 필드가 없으니(현재 백엔드 타입에도 없음) 기존 더미 유지/혹은 빈 배열로 바꿔도 됨
  const recMenus = ["김치찌개", "된장찌개", "제육볶음"];

  if (loading) {
    return (
      <div className={style.main}>
        <div style={{ marginTop: 40, color: "#666" }}>불러오는 중...</div>
      </div>
    );
  }

  if (err || !restaurant) {
    return (
      <div className={style.main}>
        <div className={style.navbar}>
          <img
            src="../../public/backstep_white_background.png"
            width="15px"
            style={{ cursor: "pointer" }}
            onClick={() => nav(-1)}
          />
          <div className={style.nav_title}>식당 이름</div>
          {isAuthor && <span>수정</span>}

        </div>
        <div style={{ width: "100%", color: "#8B0029" }}>{err || "데이터 없음"}</div>
      </div>
    );
  }

  return (
    <div className={style.main}>
      <div className={style.navbar}>
        <img
          src="../../public/backstep_white_background.png"
          width="15px"
          style={{ cursor: "pointer" }}
          onClick={() => nav(-1)}
        />
        <div className={style.nav_title}>{restaurant.name}</div>
        <span>저장 버튼</span>
      </div>

      <div className={style.upper_boxes}>
        {/* 사진 */}
        <div className={style.leftBox} style={{ overflow: "hidden" }}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8B0029",
                fontWeight: 700,
              }}
            >
              사진
            </div>
          )}
        </div>

        {/* 오른쪽 박스: 한줄평/주소/가격대 */}
        <div className={style.rightBox} style={{ padding: 14, boxSizing: "border-box" }}>
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", rowGap: 14 }}>
            <div style={{ color: "#8B0029", fontWeight: 800 }}>한줄평</div>
            <div style={{ color: "#333" }}>{restaurant.summary}</div>

            <div style={{ color: "#8B0029", fontWeight: 800 }}>주소</div>
            <div style={{ color: "#333" }}>{restaurant.address ?? "주소 정보 없음"}</div>

            <div style={{ color: "#8B0029", fontWeight: 800 }}>가격대</div>
            <div style={{ color: "#333" }}>
              {formatPrice(restaurant.price_min, restaurant.price_max)}
            </div>
          </div>
        </div>
      </div>

      <div className={style.recommend}>
        <div className={style.rec_point}>추천 정도 {restaurant.rating}점</div>
        {/* "별이 다섯 개" → 실제 별 UI */}
        <Stars value={restaurant.rating} />
      </div>

      <div className={style.map}>
        <img src="" alt="" />
        <div>
          맵링크 :{" "}
          <a href={restaurant.location_link} target="_blank" rel="noreferrer">
            {restaurant.location_link}
          </a>
        </div>
      </div>

      <div className={style.tags}>
        <div className={style.tags_title}>태그</div>
        {tagLabels.length ? (
          tagLabels.map((tag) => <div key={tag} className={style.tags_tag}>{tag}</div>)
        ) : (
          <div className={style.tags_tag}>태그 없음</div>
        )}
      </div>

      <div className={style.line}></div>

      <div className={style.middle_container}>
        <div className={style.rec_menus}>
          <div className={style.rec_menus_title}>추천 메뉴</div>
          {recMenus.map((item) => (
            <div key={item} className={style.rec_menus_menu}>
              {item}
            </div>
          ))}
        </div>

        <div className={style.rec_menus_pictures}>
          {(restaurant.images ?? []).length ? (
            restaurant.images!.map((img) => (
              <div key={img.id} className={style.rec_menus_pictures_picture}>
                <img
                  src={img.image_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 15 }}
                />
              </div>
            ))
          ) : (
            <div
            style={{
              width: "100%",
              fontWeight: 700,
              color: "#8B0029",
              margin: "4px 0 0 4px",
            }}>
            사진
          </div>
              )}
            </div>
          </div>
          <div className={style.line}></div>
              <div>이 식당에는 등록된 사진이 없습니다.</div>
          <div className={style.line}></div>

      {/* 상세 후기 타이틀 */}
      <div
        style={{
          width: "100%",
          fontWeight: 700,
          color: "#8B0029",
          margin: "12px 0 8px 4px",
        }}
      >
        상세 후기
      </div>

      {/* 장문 후기 박스 */}
      <div className={style.lower_box} style={{ padding: 16, boxSizing: "border-box" }}>
        <div style={{ whiteSpace: "pre-wrap" }}>
          {restaurant.description}
        </div>
      </div>

    </div>
  );
}
