"use client";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import style from "./page.module.css";
import client from "../../api/client";
import StarRating from "../../components/StarRating";

import {
  getRestaurantReviews,
  createRestaurantReview,
  updateReview,
  deleteReview,
  type Review,
} from "../../api/rest_review";

import {
  MapPin,
  Utensils,
  Tag,
  FileText,
  Pencil,
  Heart,
  MessageSquare,
  Trash2,
} from "lucide-react";

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

  recommended_menus?: string[];
};
// 리뷰
type RestaurantReview = {
  id: number;
  restaurant_id: number;
  user_id: number | string;
  rating: number;
  content: string;
  created_at?: string;
  user_nickname?: string;
  nickname?: string;
  writer_name?: string;
  menus: string[];
  images: string[];
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
  const percent = (value / 5) * 100;

  return (
    <div style={{ position: "relative", display: "inline-block", fontSize: 18 }}>
      
      {/* 회색 별 */}
      <div style={{ color: "#e6c6d0" }}>
        ★★★★★
      </div>

      {/* 채워진 별 */}
      <div
        style={{
          color: "#8B0029",
          position: "absolute",
          top: 0,
          left: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          width: `${percent}%`,
        }}
      >
        ★★★★★
      </div>

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

  //리뷰 관련 상태

  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewMenus, setReviewMenus] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
 // 리뷰 수정 관련 상태
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editReviewContent, setEditReviewContent] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editReviewMenus, setEditReviewMenus] = useState("");

  // 리뷰 이미지 관련 상태
  const [reviewImages, setReviewImages] = useState<File[]>([]);

  


  // 찜하기 상태
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

useEffect(() => {
  fetchReviews();
}, [restaurantId]);



// -----------------------------
// 리뷰 조회
// -----------------------------
const fetchReviews = async () => {
  if (!restaurantId) return;

  try {
    const data = await getRestaurantReviews(Number(restaurantId));

    console.log("리뷰 API 응답:", data);

    setReviews(
      data.map((review: any) => ({
        ...review,
        images: review.images ?? [],
        menus: review.menus ?? [],
      }))
    );
    
  } catch (err) {
    console.error("리뷰 조회 실패:", err);
  }
};

// -----------------------------
// 리뷰 작성
// -----------------------------
const createReview = async () => {
  if (!reviewContent.trim()) {
    alert("리뷰 내용을 입력하세요.");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("content", reviewContent.trim());
    formData.append("rating", String(reviewRating));
    formData.append("menus", reviewMenus); // "마라탕,꿔바로우"

    reviewImages.forEach((image) => {
      formData.append("files", image); // ⚠️ files로 보내야 함
    });

    await client.post(
      `/restaurants/${restaurantId}/reviews`,
      formData
    );

    // 성공 후 초기화
    setReviewContent("");
    setReviewRating(5);
    setReviewMenus("");
    setReviewImages([]);

    fetchReviews();

  } catch (err) {
    console.error(err);
    alert("리뷰 등록 실패");
  }
};

// -----------------------------
// 리뷰 이미지
// -----------------------------
const handleReviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files ?? []);

  const imageFiles = files.filter((file) =>
    file.type.startsWith("image/")
  );

  setReviewImages((prev) => [...prev, ...imageFiles].slice(0, 5));
};

const removeReviewImage = (index: number) => {
  setReviewImages((prev) => prev.filter((_, i) => i !== index));
};

// -----------------------------
// 리뷰 삭제
// -----------------------------
const removeReview = async (reviewId: number) => {
  if (!confirm("리뷰를 삭제할까요?")) return;

  try {
    await deleteReview(reviewId);
    await fetchReviews();
  } catch (err: any) {
    console.error("리뷰 삭제 실패:", err);
    alert(err.response?.data?.detail ?? "리뷰 삭제 실패");
  }
};

// -----------------------------
// 리뷰 수정 시작
// -----------------------------
const startEditReview = (review: RestaurantReview) => {
  setEditingReviewId(review.id);
  setEditReviewContent(review.content ?? "");
  setEditReviewRating(review.rating ?? 5);
  setEditReviewMenus((review.menus ?? []).join(", "));
};

// -----------------------------
// 리뷰 수정 취소
// -----------------------------
const cancelEditReview = () => {
  setEditingReviewId(null);
  setEditReviewContent("");
  setEditReviewRating(5);
  setEditReviewMenus("");
};

// -----------------------------
// 리뷰 수정 저장
// -----------------------------
const submitEditReview = async (reviewId: number) => {
  if (!editReviewContent.trim()) {
    alert("후기를 입력해주세요.");
    return;
  }

  try {
    setReviewSubmitting(true);

    await updateReview(reviewId, {
      content: editReviewContent.trim(),
      rating: editReviewRating,
      menus: editReviewMenus
        .split(",")
        .map((menu) => menu.trim())
        .filter(Boolean),
    });

    cancelEditReview();
    await fetchReviews();
  } catch (err: any) {
    console.error("리뷰 수정 실패:", err);
    alert(err.response?.data?.detail ?? "리뷰 수정 실패");
  } finally {
    setReviewSubmitting(false);
  }
};

// -----------------------------
// 리뷰 작성자 표시
// -----------------------------
const getReviewWriter = (review: RestaurantReview) => {
  if (!review.user_id) return "탈퇴한 사용자";
  return `${review.nickname}`;
};

// -----------------------------
// 리뷰 수정/삭제 권한 확인
// -----------------------------
const canManageReview = (review: RestaurantReview) => {
  if (!currentUser) return false;

  const myId = currentUser.id ?? currentUser.user_id;

  const isMine =
    myId !== undefined &&
    review.user_id !== undefined &&
    String(myId) === String(review.user_id);

  const isAdmin =
    currentUser.is_admin === 1 ||
    currentUser.is_admin === true ||
    currentUser.role === "admin";

  return isMine || isAdmin;
};
  // 식당 삭제
  const deleteRestaurant = async () => {
  if (!restaurant) return;

  const ok = window.confirm("정말 삭제할까요? 이 작업은 되돌릴 수 없습니다.");
  if (!ok) return;

  try {
    await client.delete(`/restaurants/${restaurant.id}`);
    alert("삭제되었습니다.");
    nav("/restaurant"); // 목록 페이지로 이동
  } catch (e: any) {
    console.error(e);
    if (e?.response?.status === 403) {
      alert("삭제 권한이 없습니다.");
    } else {
      alert("삭제에 실패했습니다.");
    }
  }
};
  // 식당 정보 수정 권한 체크
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

  const region = restaurant.region;

if (!region) return;

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
              <Pencil size={20} color="#8B0029" />
            </button>
          )}
          <button
            className={style.actionBtn}
            onClick={toggleFavorite}
            title="찜하기"
          >
            <Heart
              size={20}
              color="#8B0029"
              fill={isZzim ? "#8B0029" : "none"}
            />
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
              className={style.coverImage}
            />
          ) : (
            <div className={style.noImage}>
            사진 없음
          </div>
          )}
        </div>

        <div className={style.rightBox}>
          <div className={style.infoGrid}>
            <div style={{ color: "#8B0029", fontWeight: 800 }}>한줄평</div>
            <div>{restaurant.summary ?? "요약 없음"}</div>

            <div style={{ color: "#8B0029", fontWeight: 800 }}>주소</div>
            <div style={{ fontSize: "12px" }}>{restaurant.address ?? "주소 정보 없음"}</div>

            <div style={{ color: "#8B0029", fontWeight: 800 }}>가격대</div>
            <div style={{ fontSize: "12px" }}>{formatPrice(restaurant.price_min, restaurant.price_max)}</div>
          </div>
        </div>
      </div>

      {/* 별점 */}
      <div className={style.ratingBox}>
      <div className={style.ratingScore}>
        ⭐ {restaurant.rating} / 5
      </div>

      <Stars value={restaurant.rating} />
    </div>
        
          <a
  href={restaurant.location_link}
  target="_blank"
  rel="noreferrer"
  className={style.mapButton}
>
  <img src="/map.svg" className={style.mapIcon} />
  지도 링크 열기
</a>


       {/* 추천 메뉴 */}
{restaurant.recommended_menus && restaurant.recommended_menus.length > 0 && (
  <div className={style.section}>
    <div className={style.sectionTitle}>
  <Utensils size={18} /> 추천 메뉴
</div>

    <div className={style.menuRow}>
      {restaurant.recommended_menus.map((menu, idx) => (
        <span key={idx} className={style.menuChip}>
          {menu}
        </span>
      ))}
    </div>
  </div>
)}

      {/* 태그 */}
      <div className={style.section}>
  <div className={style.sectionTitle}>
  <Tag size={18} /> 태그
</div>

  <div className={style.tags}>
    {restaurant.region && (
  <button
    type="button"
    className={style.tags_tag}
    onClick={() => {
  const region = restaurant.region;
  if (!region) return;

  nav(
    `/restaurant/search?region_id=${region.id}&region_name=${encodeURIComponent(
      region.name
    )}`
  );
}}
  >
    {restaurant.region.name}
  </button>
)}

   {restaurant.tags.map((tag) => (
  <button
    key={tag.id}
    type="button"
    className={style.tags_tag}
    onClick={() =>
      nav(
        `/restaurant/search?tag_id=${tag.id}&tag_name=${encodeURIComponent(tag.name)}`
      )
    }
  >
        {tag.parent_name && (
          <span className={style.parentTag}>
            {tag.parent_name}
          </span>
        )}
        <span>{tag.name}</span>
      </button>
    ))}

    {!restaurant.region && restaurant.tags.length === 0 && (
      <div className={style.tags_tag}>태그 없음</div>
    )}
  </div>
</div>

      <div className={style.line}></div>

     {/* 상세 후기 */}
<div className={style.section}>
  <div className={style.sectionTitle}>
    <FileText size={18} /> 상세 후기
  </div>

  <div className={style.reviewDetailCard}>
    <div className={style.reviewDetailText}>
      {restaurant.description}
    </div>

    {restaurant.images &&
      restaurant.images.filter((img) => img.image_url !== restaurant.thumbnail_url).length > 0 && (
        <div className={style.reviewImageGallery}>
          {restaurant.images
            .filter((img) => img.image_url !== restaurant.thumbnail_url)
            .map((img) => (
              <img
                key={img.id}
                src={img.image_url}
                alt="restaurant"
                className={style.reviewGalleryImage}
                onClick={() => setSelectedImage(img.image_url)}
              />
            ))}
        </div>
      )}
  </div>
</div>

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

{/* 리뷰 작성 버튼 */}
<div className={style.writeReviewBox}>
  <button
    className={style.writeReviewButton}
    onClick={() => setReviewOpen((prev) => !prev)}
  >
    <Pencil size={18} />
    리뷰 작성하기
  </button>
</div>

{/* 리뷰 작성 폼 */}
{reviewOpen && (
  <div className={style.reviewFormCard}>
    <div className={style.reviewFormTitle}>이 식당은 어땠나요?</div>

    <div className={style.reviewRatingSelect}>
  <StarRating value={reviewRating} onChange={setReviewRating} />
  <span className={style.reviewRatingText}>
    {reviewRating.toFixed(1)}
  </span>
</div>
    <input
  className={style.reviewInput}
  value={reviewMenus}
  onChange={(e) => setReviewMenus(e.target.value)}
  placeholder="추천 메뉴를 쉼표로 구분해서 입력"
/>

    <textarea
      className={style.reviewTextarea}
      value={reviewContent}
      onChange={(e) => setReviewContent(e.target.value)}
      placeholder="이 식당에 대한 리뷰를 남겨주세요. 500자내로 남겨주세요."
      maxLength={500}
    />
  {/* 이미지 UI */}
  <div className={style.reviewImageUploadBox}>
  <label className={style.reviewImageUploadButton}>
    이미지 추가
    <input
      type="file"
      accept="image/*"
      multiple
      hidden
      onChange={handleReviewImageChange}
    />
  </label>

  {reviewImages.length > 0 && (
    <div className={style.reviewImagePreviewList}>
      {reviewImages.map((file, index) => (
        <div key={index} className={style.reviewImagePreviewItem}>
          <img
            src={URL.createObjectURL(file)}
            alt="리뷰 이미지 미리보기"
            className={style.reviewImagePreview}
          />

          <button
            type="button"
            className={style.reviewImageRemoveButton}
            onClick={() => removeReviewImage(index)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )}
</div>
    <div className={style.reviewFormBottom}>
      <span className={style.reviewLength}>
        {reviewContent.length}/500
      </span>

      <button
        className={style.reviewSubmitButton}
        onClick={createReview}
        disabled={reviewSubmitting}
      >
        {reviewSubmitting ? "등록 중..." : "등록하기"}
      </button>
    </div>
  </div>
)}

{/* 리뷰 리스트 */}
<div className={style.reviewSection}>
  <div className={style.reviewHeader}>
    <div className={style.reviewTitle}>
      <MessageSquare size={18} />
      리뷰 {reviews.length}개
    </div>
  </div>

  {reviews.length === 0 ? (
    <div className={style.emptyReviewBox}>
      아직 등록된 리뷰가 없습니다.
      <br />
      첫 리뷰를 남겨보세요!
    </div>
  ) : (
    <div className={style.reviewList}>
      {reviews.map((review) => (
        
        <div key={review.id} className={style.reviewCard}>
          <div className={style.reviewCardTop}>
            <div className={style.reviewWriterArea}>
              <div className={style.reviewAvatar}>
                {getReviewWriter(review).slice(0, 1)}
              </div>

              <div>
                <div className={style.reviewWriter}>
                  {getReviewWriter(review)}
                </div>
                <div className={style.reviewDate}>
                  {review.created_at
                    ? new Date(review.created_at).toLocaleDateString("ko-KR")
                    : ""}
                </div>
              </div>
            </div>

            <div className={style.reviewScore}>
              <Stars value={review.rating} />
              <strong>{review.rating.toFixed(1)}</strong>
            </div>
          </div>

          {editingReviewId === review.id ? (
  <div className={style.reviewEditBox}>
    <textarea
      className={style.reviewTextarea}
      value={editReviewContent}
      onChange={(e) => setEditReviewContent(e.target.value)}
      placeholder="리뷰 내용을 입력하세요"
    />

    <input
      className={style.reviewInput}
      value={editReviewMenus}
      onChange={(e) => setEditReviewMenus(e.target.value)}
      placeholder="추천 메뉴를 쉼표로 구분해서 입력"
    />

    <div className={style.reviewActions}>
      <button
        type="button"
        className={style.reviewSubmitButton}
        onClick={() => submitEditReview(review.id)}
        disabled={reviewSubmitting}
      >
        저장
      </button>

      <button
        type="button"
        className={style.reviewEditButton}
        onClick={cancelEditReview}
        disabled={reviewSubmitting}
      >
        취소
      </button>
    </div>
  </div>
) : (
  <>
  {/* 리뷰 내용 */}
  
    <div className={style.reviewContent}>
      {review.content}
    </div>

    {review.images && review.images.length > 0 && (
  <div className={style.reviewImageGallery}>
    {review.images?.map((imageUrl, idx) => {
  console.log("렌더링 이미지 URL:", imageUrl);

  return (
   <img
  key={idx}
  src={String(imageUrl)}
  alt="리뷰 이미지"
  className={style.reviewGalleryImage}
  onError={(e) => {
    console.log("이미지 로드 실패 src:", e.currentTarget.src);
  }}
  onLoad={() => {
    console.log("이미지 로드 성공:", imageUrl);
  }}
/>
  );
})}
  </div>
)}

    {review.menus && review.menus.length > 0 && (
      <div className={style.reviewMenuLine}>
        <span className={style.reviewMenuLabel}>추천 메뉴</span>
        {review.menus.map((menu, idx) => (
          <span key={idx} className={style.reviewMenuChip}>
            {menu}
          </span>
        ))}
      </div>
    )}

    {canManageReview(review) && (
      <div className={style.reviewActions}>
        <button
          type="button"
          className={style.reviewEditButton}
          onClick={() => startEditReview(review)}
        >
          수정
        </button>

        <button
          type="button"
          className={style.reviewDeleteButton}
          onClick={() => removeReview(review.id)}
        >
          삭제
        </button>
      </div>
    )}
  </>
)}
        </div>
      ))}
    </div>
  )}
</div>
      {canEdit && (
  <div
    style={{
      marginTop: 30,
      width: "100%",
      display: "flex",
      justifyContent: "flex-end",
    }}
  >
    <button
      style={{
        padding: "10px 16px",
        borderRadius: 10,
        border: "none",
        background: "#8B0029",
        color: "white",
        fontWeight: 600,
        cursor: "pointer",
      }}
      onClick={deleteRestaurant}
    >
      삭제하기
    </button>
  </div>
)}
    </div>
  );
}