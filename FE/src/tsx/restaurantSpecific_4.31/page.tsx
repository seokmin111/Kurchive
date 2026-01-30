"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "./page.module.css";
import client from "../../api/client"; 

type Tag = { id: number; name: string };
type Region = { id: number; name: string; parent_id?: number | null; depth?: number | null };
type Image = { id: number; image_url: string; created_at: number; is_cover?: boolean };

type RestaurantDetail = {
  id: number;
  name: string;
  uploaded_by: number | string;  
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
  const nav = useNavigate();
  const { restaurantId } = useParams(); 

  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // 내 정보 불러오기 (경로 중복 해결을 위해 client 직접 사용)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      client.get("/mypage")
        .then((res) => {
          const userData = res.data.data || res.data;
          console.log("내 정보 로드 결과:", userData);
          setCurrentUser(userData);
        })
        .catch((e) => console.error("내 정보를 가져오는데 실패했습니다.", e));
    }
  }, []);

  // 식당 상세 정보 불러오기
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
        const restData = res.data.data || res.data;
        console.log("식당 정보 로드 결과:", restData);
        setRestaurant(restData);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "식당 정보를 불러오지 못했어.");
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId]);

  // 권한 체크 로직 
  const canEdit = useMemo(() => {
    if (!currentUser || !restaurant) return false;

    // 내 ID 추출 (id, user_id, userid 등 
    const myId = currentUser.id || currentUser.user_id;
    const uploaderId = restaurant.uploaded_by;
    
    // 작성자 체크 
    const authorCheck = (myId !== undefined && uploaderId !== undefined) && String(myId) === String(uploaderId);
    
    // 관리자 체크 (is_admin이 true/1이거나 role이 admin인 경우)
    const adminCheck = 
      currentUser.is_admin === 1 || 
      currentUser.is_admin === true || 
      currentUser.role === "admin";

    console.log("--- 수정 권한 검증 ---");
    console.log("내 ID:", myId, "| 식당 등록자 ID:", uploaderId);
    console.log("작성자 여부:", authorCheck);
    console.log("관리자 여부:", adminCheck);

    return authorCheck || adminCheck;
  }, [currentUser, restaurant]);

  const coverUrl = useMemo(() => {
    const imgs = restaurant?.images ?? [];
    const cover = imgs.find((x) => x.is_cover);
    return (cover?.image_url ?? imgs[0]?.image_url) || "";
  }, [restaurant]);

  const tagLabels = useMemo(() => {
    const regionName = restaurant?.region?.name ? [restaurant.region.name] : [];
    const restTags = (restaurant?.tags ?? []).map((t) => t.name);
    return Array.from(new Set([...regionName, ...restTags]));
  }, [restaurant]);

  const recMenus = ["김치찌개", "된장찌개", "제육볶음"];

  const handleEditClick = () => {
    if (restaurant?.id) {
      nav(`/restaurant/edit/${restaurant.id}`);
    }
  };

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
            alt="back"
            style={{ cursor: "pointer" }}
            onClick={() => nav(-1)}
          />
          <div className={style.nav_title}>식당 정보</div>
          <div style={{ width: 15 }}></div>
        </div>
        <div style={{ width: "100%", color: "#8B0029", textAlign: "center", marginTop: 20 }}>
          {err || "데이터를 불러올 수 없습니다."}
        </div>
      </div>
    );
  }

  return (
    <div className={style.main}>
      <div className={style.navbar}>
        <img
          src="../../public/backstep_white_background.png"
          width="15px"
          alt="back"
          style={{ cursor: "pointer" }}
          onClick={() => nav(-1)}
        />
        <div className={style.nav_title}>{restaurant.name}</div>
        
        {canEdit ? (
          <span 
            onClick={handleEditClick}
            style={{ 
              cursor: "pointer", 
              color: "#8B0029", 
              fontSize: "14px", 
              fontWeight: 600,
              minWidth: "50px",
              textAlign: "right"
            }}
          >
            수정하기
          </span>
        ) : (
          <div style={{ width: 50 }}></div> 
        )}
      </div>

      <div className={style.upper_boxes}>
        <div className={style.leftBox}>
          {coverUrl ? (
            <img src={coverUrl} alt="cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#8B0029", fontWeight: 700 }}>
              사진
            </div>
          )}
        </div>

        <div className={style.rightBox}>
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", rowGap: 14 }}>
            <div style={{ color: "#8B0029", fontWeight: 800 }}>한줄평</div>
            <div style={{ color: "#333" }}>{restaurant.summary}</div>
            <div style={{ color: "#8B0029", fontWeight: 800 }}>주소</div>
            <div style={{ color: "#333" }}>{restaurant.address ?? "주소 정보 없음"}</div>
            <div style={{ color: "#8B0029", fontWeight: 800 }}>가격대</div>
            <div style={{ color: "#333" }}>{formatPrice(restaurant.price_min, restaurant.price_max)}</div>
          </div>
        </div>
      </div>

      <div className={style.recommend}>
        <div className={style.rec_point}>추천 정도 {restaurant.rating}점</div>
        <Stars value={restaurant.rating} />
      </div>

      <div className={style.map}>
        <div style={{ wordBreak: "break-all" }}>
          맵링크 :{" "}
          <a href={restaurant.location_link} target="_blank" rel="noreferrer" style={{color: "#333", textDecoration: "underline"}}>
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
            <div key={item} className={style.rec_menus_menu}>{item}</div>
          ))}
        </div>

        <div className={style.rec_menus_pictures}>
          {(restaurant.images ?? []).length > 0 ? (
            restaurant.images!.map((img) => (
              <div key={img.id} className={style.rec_menus_pictures_picture}>
                <img src={img.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 15 }} />
              </div>
            ))
          ) : (
            <div style={{ width: "100%", padding: "20px 0", color: "#999", fontSize: 14, marginLeft: 4 }}>
              등록된 사진이 없습니다.
            </div>
          )}
        </div>
      </div>

      <div className={style.line}></div>

      <div style={{ width: "100%", fontWeight: 700, color: "#8B0029", margin: "12px 0 8px 4px" }}>
        상세 후기
      </div>

      <div className={style.lower_box} style={{ padding: 16, boxSizing: "border-box", height: "auto", minHeight: "200px" }}>
        <div style={{ whiteSpace: "pre-wrap" }}>
          {restaurant.description}
        </div>
      </div>
    </div>
  );
}