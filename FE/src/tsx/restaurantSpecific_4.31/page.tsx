"use client";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "./page.module.css";
import client from "../../api/client";

type Tag = {
  id: number;
  name: string;
  parent_id?: number | null;
  parent_name?: string | null;
};
type Region = { id: number; name: string };
type Image = { id: number; image_url: string; };

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
  thumbnail_url?: string | null;
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

// 기존 Stars 컴포넌트 오류 수정 (매개변수 구조 분해)
function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, Math.round(value ?? 0)));
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: 18,
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

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ✅ 찜하기 상태
  const [isZzim, setIsZzim] = useState(false);

  // 내 정보 로드
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    client.get("/mypage")
      .then((res) => setCurrentUser(res.data.data || res.data))
      .catch(() => {});
  }, []);

  // 식당 상세 및 찜하기 상태 로드
  useEffect(() => {
    const id = Number(restaurantId);
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        // 상세 정보와 즐겨찾기 상태를 동시에 가져옴
        const token = localStorage.getItem("access_token");

        const detailPromise = client.get(`/restaurants/${id}`);

        const favPromise = token
          ? client.get(`/restaurants/${id}/favorite`)
          : Promise.resolve({ data: { is_favorite: false } });

        const [detailRes, favRes] = await Promise.all([
          detailPromise,
          favPromise
        ]);
        setRestaurant(detailRes.data.data || detailRes.data);
        setIsZzim(favRes.data.is_favorite);
        console.log(detailRes.data);
      } catch (e: any) {
        setErr(e?.response?.data?.detail ?? "식당 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [restaurantId]);
  

  // 즐겨찾기 토글 함수
  const toggleFavorite = async () => {
    try {
      const res = await client.post(`/restaurants/${restaurantId}/favorite`);
      setIsZzim(res.data.is_favorite);
    } catch (e) {
      console.error(e);
      alert("즐겨찾기 상태를 변경할 수 없습니다.");
    }
  };

  // 수정 권한 체크
  const canEdit = useMemo(() => {
    if (!currentUser || !restaurant) return false;

    const myId = currentUser.id || currentUser.user_id;
    const uploaderId = restaurant.uploaded_by;

    const authorCheck =
      myId !== undefined &&
      uploaderId !== undefined &&
      String(myId) === String(uploaderId);

    const adminCheck =
      currentUser.is_admin === 1 ||
      currentUser.is_admin === true ||
      currentUser.role === "admin";

    return authorCheck || adminCheck;
  }, [currentUser, restaurant]);

  const coverUrl = restaurant?.thumbnail_url ?? "";

  if (loading) return <div className={style.main}>불러오는 중...</div>;
  if (err || !restaurant) return <div className={style.main}>{err}</div>;

  return (
    <div className={style.main}>
      {/* ===== 상단 네비 ===== */}
      <div className={style.navbar}>
        <div className={style.backBtnWrap}>
          <img
            src="/backstep_white_background.png"
            width="15px"
            alt="back"
            style={{ cursor: "pointer" }}
            onClick={() => nav(-1)}
          />
        </div>
        
        <div className={style.nav_title}>{restaurant.name}</div>

        <div className={style.rightActions}>
          {canEdit && (
            <button
              className={style.actionBtn}
              onClick={() => nav(`/restaurant/${restaurant.id}/edit`)}
              title="수정하기"
            >
              ✏️
            </button>
          )}
          <button
            className={style.actionBtn}
            onClick={toggleFavorite}
            title="찜하기"
          >
            {isZzim ? "❤️" : "🤍"}
          </button>
        </div>
      </div>

      {/* 상단 박스 */}
      <div className={style.upper_boxes}>
        <div className={style.leftBox}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ textAlign: "center", color: "#8B0029", marginTop: "50%" }}>사진 없음</div>
          )}
        </div>

        <div className={style.rightBox}>
          <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", rowGap: 14 }}>
            <div style={{ color: "#8B0029", fontWeight: 800 }}>한줄평</div>
            <div>{restaurant.summary}</div>

            <div style={{ color: "#8B0029", fontWeight: 800 }}>주소</div>
            <div style={{ fontSize: "12px" }}>{restaurant.address ?? "주소 정보 없음"}</div>

            <div style={{ color: "#8B0029", fontWeight: 800 }}>가격대</div>
            <div style={{ fontSize: "12px" }}>{formatPrice(restaurant.price_min, restaurant.price_max)}</div>
          </div>
        </div>
      </div>

      {/* 별점 */}
      <div className={style.recommend}>
        <div className={style.rec_point}>추천 정도 {restaurant.rating}점</div>
        <Stars value={restaurant.rating} />
      </div>

      {/* 맵 링크 */}
      <div className={style.map} style={{ width: "100%" }}>
        <div style={{ marginBottom: 6, fontWeight: 600 }}>맵 링크</div>
        <a
          href={restaurant.location_link}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: 20,
            background: "#f4f4f4",
            textDecoration: "none",
            color: "#8B0029",
            fontWeight: 600,
            fontSize: 14
          }}
        >
          지도 보러가기 →
        </a>
      </div>

      {/* 태그 */}
      <div className={style.tags}>
        <div className={style.tags_title}>태그</div>

        {/* 지역 먼저 */}
        {restaurant.region && (
          <div className={style.tags_tag}>
            {restaurant.region.name}
          </div>
        )}

        {/* 음식 태그 */}
        {restaurant.tags.map((tag) => (
        <div key={tag.id} className={style.tags_tag}>
          {tag.parent_name && (
            <span className={style.parentTag}>
              {tag.parent_name}
            </span>
          )}
          <span>{tag.name}</span>
        </div>
      ))}

        {/* 아무것도 없을 때 */}
        {!restaurant.region && restaurant.tags.length === 0 && (
          <div className={style.tags_tag}>태그 없음</div>
        )}
      </div>

      <div className={style.line}></div>

      {/* 상세 후기 */}
      <div
        className={style.lower_box}
        style={{ padding: 16, whiteSpace: "pre-wrap", overflowY: "auto" }}
      >
        {restaurant.description}
      </div>

      {/* 본문 이미지 갤러리 */}
      {restaurant.images && restaurant.images.length > 0 && (
        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 8,
            width: "100%"
          }}
        >
          {restaurant.images?.length > 0 && (
  <div className={style.imageGallery}>
    {restaurant.images
      .filter((img) => {
        if (!restaurant.thumbnail_url) return true;
        return img.image_url !== restaurant.thumbnail_url;
      })
      .map((img) => (
        <img
          key={img.id}
          src={img.image_url}
          alt="restaurant"
          className={style.galleryImage}
          onClick={() => setSelectedImage(img.image_url)}
        />
      ))}
  </div>
)}
          {/* 이미지 확대 모달 */}
          {selectedImage && (
            <div className={style.imageModal}>
              <button
                className={style.closeButton}
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
              <img
                src={selectedImage}
                alt="확대 이미지"
                className={style.modalImage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}