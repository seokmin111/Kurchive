"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./page.module.css";
import client from "../../api/client";
import { geocodeAddress } from "../../api/location";
//여기서 지오코딩 쓰니가 여기에 import

type TagGroup = "region" | "food" | "price";

type Region = {
  id: number;
  name: string;
  parent_id?: number | null;
};

type Tag = {
  id: number;
  name: string;
  category_id?: number;
  parent_id?: number | null;
};

type Image = { id: number; image_url: string; is_cover?: boolean };

type RestaurantDetail = {
  id: number;
  name: string;
  location_link: string;
  address: string;
  latitude?: number;
  longitude?: number;
  region?: {
    id: number;
    name: string;
    parent_id?: number | null;
  } | null;
  rating: number;
  summary: string;
  description: string;
  price_min: number;
  price_max: number;
  tags: Tag[];
  images?: Image[];
  thumbnail_url?: string | null;
  recommended_menus?: string[];
};

async function safeDeleteRestaurantImage(restaurantId: number, imageId: number) {
  // 프로젝트마다 다를 수 있어서 2개 경로 시도
  try {
    await client.delete(`/restaurants/images/${imageId}`);
    return;
  } catch {}
  await client.delete(`/restaurants/${restaurantId}/images/${imageId}`);
}
/* 별 */
function Stars({ value }: { value: number }) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));

  return (
    <div className={styles.starsWrapper}>
      {/* 회색 별 */}
      <div className={styles.starsBackground}>★★★★★</div>

      {/* 채워진 별 */}
      <div
        className={styles.starsFill}
        style={{ width: `${percent}%` }}
      >
        ★★★★★
      </div>
    </div>
  );
}

function RatingInput({
  value,
  onChange
}: {
  value: number;
  onChange: (v: number) => void;
}) {

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const percent = x / rect.width;

    const raw = percent * 5;
    const step = Math.round(raw * 2) / 2;

    onChange(Math.min(5, Math.max(0, step)));
  };

  const percent = (value / 5) * 100;

  return (
    <div
      onClick={handleClick}
      style={{
        position: "relative",
        display: "inline-block",
        fontSize: 28,
        cursor: "pointer",
        userSelect: "none",
        lineHeight: 1
      }}
    >
      {/* 회색 별 */}
      <div style={{ color: "#ddd" }}>
        ★★★★★
      </div>

      {/* 채워진 별 */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: `${percent}%`,
          overflow: "hidden",
          color: "#8B0029"
        }}
      >
        ★★★★★
      </div>
    </div>
  );
}

export default function RestaurantEditPage() {
  const nav = useNavigate();
  const { restaurantId } = useParams();
  const id = Number(restaurantId);

  // -------------------------
  // 상태
  // -------------------------
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // -------------------------
  // 기본 입력 (아카이브 구조)
  // -------------------------
  const [name, setName] = useState("");
  const [shortReview, setShortReview] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [address, setAddress] = useState("");
  //주소 검증 중 위도 경도 저장해야 함
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null); 
  const [isAddressValid, setIsAddressValid] = useState<boolean | null>(null);
  const [addressMessage, setAddressMessage] = useState("");
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [rating, setRating] = useState(0);

  const [detailReview, setDetailReview] = useState("");

  // -------------------------
  // 가격
  // -------------------------
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");

  // -------------------------
  // 이미지 (아카이브 구조 + 기존 이미지 표시/삭제)
  // - main: 대표(cover) 느낌
  // - detail: 추가 이미지들
  // -------------------------
  const [existingImages, setExistingImages] = useState<Image[]>([]);

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  const [detailImageFiles, setDetailImageFiles] = useState<File[]>([]);
  const [detailImagePreviews, setDetailImagePreviews] = useState<string[]>([]);

  const fileInputDetailRef = useRef<HTMLInputElement | null>(null);

  // 음식 태그 전체 캐시
const [allFoodTagsMap, setAllFoodTagsMap] = useState<Record<number, string>>({});

useEffect(() => {
  (async () => {
    try {
      const res = await client.get("/tags", { params: { category_id: 1 } });
      const tags: Tag[] = res.data;

      const map: Record<number, string> = {};
      tags.forEach((t) => {
        map[t.id] = t.name;
      });

      setAllFoodTagsMap(map);
    } catch (e) {
      console.error("전체 태그 캐시 실패", e);
    }
  })();
}, []);


  const handleMainImageChange = (file: File | null) => {
    if (!file) return;
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const handleDetailImagesChange = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setDetailImageFiles((prev) => [...prev, ...arr]);
    setDetailImagePreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const removeDetailPreview = (idx: number) => {
    setDetailImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setDetailImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // 기존 이미지 삭제 (즉시 반영)
  const deleteExisting = async (imageId: number) => {
    const ok = window.confirm("이 이미지를 삭제할까요?");
    if (!ok) return;
    try {
      await safeDeleteRestaurantImage(id, imageId);
      setExistingImages((prev) => prev.filter((x) => x.id !== imageId));
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? e?.message ?? "이미지 삭제 실패");
    }
  };

  // 대표 이미지 url (cover 우선)
  const coverUrl = mainImagePreview
  ? mainImagePreview
  : thumbnailUrl ?? "";

  // 상세 이미지 리스트(대표 제외)
  const detailExisting = useMemo(() => {
    const imgs = existingImages ?? [];
    const cover = imgs.find((x) => x.is_cover);
    if (!cover) return imgs.slice(1);
    return imgs.filter((x) => x.id !== cover.id);
  }, [existingImages]);

  // -------------------------
  // 지역 2단계 (아카이브 그대로)
  // -------------------------
  const [regionsLv1, setRegionsLv1] = useState<Region[]>([]);
  const [regionsLv2, setRegionsLv2] = useState<Region[]>([]);
  const [selectedLv1, setSelectedLv1] = useState<number | null>(null);
  const [selectedLv2, setSelectedLv2] = useState<number | null>(null);

  // -------------------------
  // 음식 태그 2단계 (아카이브 그대로)
  // -------------------------
  const [foodParents, setFoodParents] = useState<Tag[]>([]);
  const [selectedFoodParentId, setSelectedFoodParentId] = useState<number | null>(null);
  const [foodChildren, setFoodChildren] = useState<Tag[]>([]);
  const [selectedFoodTags, setSelectedFoodTags] = useState<Tag[]>([]);

  const [regionMap, setRegionMap] = useState<Record<number, Region>>({});
  const selectedRegion = useMemo(() => {
  if (!selectedLv2) return null;
  return regionMap[selectedLv2] ?? null;
}, [selectedLv2, regionMap]);

const [recommendedMenus, setRecommendedMenus] = useState<string[]>([]);
const [menuInput, setMenuInput] = useState("");


// image
  const [detailInputKey, setDetailInputKey] = useState(0);
  const [mainInputKey, setMainInputKey] = useState(0);

  const fileInputMainRef = useRef<HTMLInputElement | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
  (async () => {
    try {
      const all: Region[] = (await client.get("/regions")).data;

      const map: Record<number, Region> = {};
      all.forEach((r) => {
        map[r.id] = r;
      });

      setRegionMap(map);

      const lv1 = all.filter((r) => !r.parent_id && !r.name.endsWith("전체"));
      setRegionsLv1(lv1);
    } catch (e) {
      console.error(e);
    }
  })();
}, []);
  

  const handleFoodParentClick = (parentId: number) => {
    if (selectedFoodParentId === parentId) return;
    setSelectedFoodParentId(parentId);
    // 아카이브는 "다른 대분류 선택시 기존 선택 해제"
  };

  const toggleFoodTag = (tag: Tag) => {
  setSelectedFoodTags((prev) =>
    prev.find((t) => t.id === tag.id)
      ? prev.filter((t) => t.id !== tag.id)
      : [...prev, tag]
  );
};

const addMenu = () => {
  const m = menuInput.trim();
  if (!m) return;

  if (recommendedMenus.includes(m)) {
    setMenuInput("");
    return;
  }

  setRecommendedMenus((prev) => [...prev, m]);
  setMenuInput("");
};

const removeMenu = (menu: string) => {
  setRecommendedMenus((prev) => prev.filter((m) => m !== menu));
};


const clearFoodTags = () => setSelectedFoodTags([]);

  // -------------------------
  // UI 탭 (아카이브 그대로)
  // -------------------------
  const [activeGroup, setActiveGroup] = useState<TagGroup>("region");

  // -------------------------
  // Rating (아카이브: 0.5 단위)
  // -------------------------
  const ratingStep = useMemo(() => {
    // 저장 값은 0~5, 0.5 step
    const r = Math.round(rating * 2) / 2;
    return Math.max(0, Math.min(5, r));
  }, [rating]);


  // =========================================================
  // (B) 지역 Lv2 로드
  // =========================================================
useEffect(() => {
  if (!selectedLv1) return;

  (async () => {
    const lv2: Region[] = (
      await client.get("/regions", { params: { parent_id: selectedLv1 } })
    ).data;

    const filtered = lv2.filter((r) => !r.name.endsWith("전체"));
    setRegionsLv2(filtered);
    setRegionMap((prev) => {
      const updated = { ...prev };
      filtered.forEach((r) => {
        updated[r.id] = r;
      });
      return updated;
    });
  })().catch(console.error);
}, [selectedLv1]);


  // =========================================================
  // (C) 음식 대분류 로드
  // =========================================================
  useEffect(() => {
  (async () => {
    try {
      const res = await client.get("/tags", { params: { category_id: 1 } });
      const tags: Tag[] = res.data;
      const parents = tags.filter((t) => !t.parent_id);
      setFoodParents(parents);
    } catch (e) {
      console.error("음식 대분류 로딩 실패", e);
    }
  })();
}, []);


  // =========================================================
  // (D) 음식 소분류 로드
  // =========================================================
  useEffect(() => {
    if (!selectedFoodParentId) {
      setFoodChildren([]);
      return;
    }
    (async () => {
      try {
        const res = await client.get("/tags", {
          params: { category_id: 1, parent_id: selectedFoodParentId },
        });
        setFoodChildren(res.data);
      } catch (e) {
        console.error("음식 소분류 로딩 실패", e);
      }
    })();
  }, [selectedFoodParentId]);

// (E) 기존 식당 데이터 로드 + 초기값 주입
useEffect(() => {
  if (!id) return;

  (async () => {
    try {
      setLoading(true);

      const res = await client.get(`/restaurants/${id}`);
      const data: RestaurantDetail = res.data.data || res.data;

      setName(data.name ?? "");
      setShortReview((data.summary ?? "").toString());
      setMapLink((data.location_link ?? "").toString());
      setAddress((data.address ?? "").toString());
      setLatitude(data.latitude ?? null);
      setLongitude(data.longitude ?? null);
      setRating(Number(data.rating ?? 0));
      setPriceMin(data.price_min ?? "");
      setPriceMax(data.price_max ?? "");
      setExistingImages(data.images ?? []);
      setThumbnailUrl(data.thumbnail_url ?? null);
      setDetailReview((data.description ?? "").toString());
      setSelectedFoodTags(data.tags ?? []);
      setRecommendedMenus(data.recommended_menus ?? []);
      
      // 기존 주소와 좌표가 있으면 검증 완료 상태로 설정
      if (data.address && data.latitude !== undefined && data.longitude !== undefined) {
        setIsAddressValid(true);
      }

      if (data.tags?.length) {
        const firstTag = data.tags[0];
        if (firstTag.parent_id) {
          setSelectedFoodParentId(firstTag.parent_id);
        }
      }

      if (data.region) {
        setSelectedLv2(data.region.id);
        setSelectedLv1(data.region.parent_id ?? null);
      }

    } catch (e: any) {
      alert(e?.response?.data?.detail ?? e?.message ?? "식당 로드 실패");
      nav(-1);
    } finally {
      setLoading(false);
    }
  })();
}, [id]);   // 🔥 regionMap 제거
  const handleDetailFileChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const files = e.target.files;

  if (!files || files.length === 0) return;

  const arr = Array.from(files);

  setDetailImageFiles((prev) => [...prev, ...arr]);
  setDetailImagePreviews((prev) => [
    ...prev,
    ...arr.map((f) => URL.createObjectURL(f)),
  ]);

  // 같은 파일 다시 선택 가능하게 초기화
  e.currentTarget.value = "";
};

 // 썸네일 삭제
 const deleteThumbnail = async () => {
  const ok = window.confirm("대표 이미지를 삭제할까요?");
  if (!ok) return;

  try {
    await client.delete(`/restaurants/${id}/thumbnail`);
    setThumbnailUrl(null);
    setMainImageFile(null);
    setMainImagePreview(null);
  } catch (e: any) {
    alert(e?.response?.data?.detail ?? e?.message ?? "썸네일 삭제 실패");
  }
};
  // =========================================================
  // 저장
  // =========================================================
  function isValidMapLink(url: string) {
  try {
    const u = new URL(url);

    const host = u.hostname;

    const allowed = [
      "map.kakao.com",
      "kko.kakao.com",
      "place.map.kakao.com",
      "kko.to",
      "naver.me",
      "map.naver.com",
      "m.place.naver.com",
      "maps.app.goo.gl",
      "www.google.com",
      "google.com",
      "goo.gl"
    ];

    return allowed.some((d) => host.includes(d));
  } catch {
    return false;
  }
}

const handleValidateAddress = async () => {
  if (!address.trim()) {
    setIsAddressValid(false);
    setAddressMessage("주소를 입력해주세요.");
    return;
  }

  try {
    setIsValidatingAddress(true);
    setAddressMessage("주소 적용 중...");
    
    const res = await geocodeAddress(address.trim());
    
    if (!res.ok) {
      setIsAddressValid(false);
      setAddressMessage("주소 적용에 실패했습니다. 정확한 주소를 입력해주세요.");
      return;
    }

    setLatitude(res.lat ?? null);
    setLongitude(res.lng ?? null);
    setIsAddressValid(true);
    setAddressMessage("주소 적용 완료!");
  } catch (e) {
    setIsAddressValid(false);
    setAddressMessage("주소 적용 중 오류가 발생했습니다.");
  } finally {
    setIsValidatingAddress(false);
  }
};

  const handleSubmit = async () => {
    if (submitting) return;

    // 아카이브와 동일한 검증 흐름
    if (!name.trim()) return alert("식당 이름을 입력해주세요.");
    if (!mapLink.trim()) return alert("맵 링크를 입력해주세요.");
    if (!mapLink.trim().startsWith("http")) return alert("맵 링크는 http/https로 시작해야 합니다."); 
    if (!isValidMapLink(mapLink.trim())) {return alert("지원되는 지도 링크가 아닙니다.");}
    if (!address.trim()) return alert("주소를 입력해주세요.");
    if (isAddressValid !== true) return alert("주소 적용을 완료해주세요.");
    if (!selectedLv2) return alert("소지역(구/시/군)을 선택해주세요.");
    if (priceMin === "" || priceMax === "") return alert("가격 범위(최소/최대)를 입력해주세요.");
    if (Number.isNaN(priceMin) || Number.isNaN(priceMax)) return alert("가격은 숫자만 입력해주세요.");
    if ((priceMin as number) > (priceMax as number)) return alert("최소 가격이 최대 가격보다 클 수 없습니다.");
    if (selectedFoodTags.length === 0) return alert("음식 태그를 최소 1개 선택해주세요.");

    try {
      setSubmitting(true);

      // 아카이브 description 조합 규칙 그대로
      const description = (detailReview ?? "").trim() || " ";

      const payload = {
        name: name.trim(),
        location_link: mapLink.trim(),
        address: address.trim(),
        latitude: latitude,
        longitude: longitude,
        location_tag_id: selectedLv2,
        rating: ratingStep,
        summary: (shortReview ?? "").trim() || " ",
        description,
        price_min: priceMin as number,
        price_max: priceMax as number,
        tag_ids: selectedFoodTags.map((t) => t.id),
        recommended_menus: recommendedMenus
      };
      await client.patch(`/restaurants/${id}`, payload);

      // commit 보장
      await client.get(`/restaurants/${id}`);

      // 이미지 업로드 (아카이브 구조: 대표 1 + 상세 여러장)
      // 1️⃣ 썸네일 따로 업로드
      if (mainImageFile) {
        const fd = new FormData();
        fd.append("file", mainImageFile);

        await client.post(`/restaurants/${id}/thumbnail`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // 2️⃣ 상세 이미지만 업로드
      if (detailImageFiles.length) {
        const fd = new FormData();
        detailImageFiles.forEach((f) => fd.append("files", f));

        await client.post(`/restaurants/${id}/images`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setMainImageFile(null);
      setMainImagePreview(null);
      setDetailImageFiles([]);
      setDetailImagePreviews([]);

      setToast("수정 완료!");


setTimeout(() => {
  nav(`/restaurant/${id}`, { replace: true });
}, 800);
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "수정 중 오류";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // Render
  // =========================================================
  if (loading) return <div className={styles.container}>불러오는 중...</div>;

  return (
    <div className={styles.container}>
      <div
        style={{
          width: "calc(100% + 40px)",
          marginLeft: -20,
          marginRight: -20,
          height: 150,
          backgroundColor: "#8b0028",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "18px 16px",
          boxSizing: "border-box",
        }}
      >
        <img
          src="/backstep_white_white_background.png"
          alt="back"
          style={{ width: 22, height: 22, cursor: "pointer", margin: 0 }}
          onClick={() => nav(-1)}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            cursor: submitting ? "not-allowed" : "pointer",
            border: "1px solid rgba(255,255,255,0.75)",
            background: "rgba(255,255,255,0.92)",
            color: "#8b0028",
            fontWeight: 800,
            padding: "10px 14px",
            borderRadius: 12,
            lineHeight: 1,
          }}
        >
          {submitting ? "저장 중..." : "저장하기"}
        </button>
      </div>

      <div style={{ width: "100%", padding: "0 0 30px" }}>
        <p className={styles.requiredGuide}>
          <span className={styles.required}>*</span> 표시된 항목은 비워둘 수 없습니다.
        </p>
        <main className={styles.main} style={{ marginTop: 12 }}>
          <section className={styles.section}>
            <div className={styles.formRow}>
              <span className={styles.fieldTitle}>식당 이름<span className={styles.required}>*</span></span>
            </div>
            <input
              className={styles.nameInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className={styles.formRow}>
              <span className={styles.fieldTitle}>한줄평 <span className={styles.required}>*</span></span>
            </div>
            <div className={styles.row}>
            <textarea
              className={styles.shortReview}
              maxLength={100}
              value={shortReview}
              onChange={(e) => setShortReview(e.target.value)}
            />


              <label className={styles.photoButton}>
                {mainImagePreview ? (
                  <img src={mainImagePreview} alt="main" className={styles.photoPreview} />
                ) : coverUrl ? (
                  <img src={coverUrl} alt="cover" className={styles.photoPreview} />
                ) : (
                  <>
                    사진 추가
                    <span className={styles.plus}>+</span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                   onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      handleMainImageChange(file);
                      e.currentTarget.value = "";
                    }}
                />
              </label>
            </div>

            {coverUrl && !mainImagePreview && (
            <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className={styles.trashButton}
                onClick={deleteThumbnail}
              >
                대표 이미지 삭제
              </button>
            </div>
          )}

            <div className={styles.labelRow}>
              <span className={styles.label}>식당 주소 <span className={styles.required}>*</span></span>

              <div className={styles.inputWithButton}>
                <input
                  className={styles.mapInput}
                  placeholder="도로명주소 입력"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setIsAddressValid(null);
                    setAddressMessage("");
                  }}
                />
                <button
                  type="button"
                  className={styles.validateButton}
                  onClick={handleValidateAddress}
                  disabled={isValidatingAddress}
                >
                  {isValidatingAddress ? "적용 중..." : "적용"}
                </button>
              </div>
            </div>

            {addressMessage && (
              <div className={styles.addressMessage}>
                {addressMessage}
              </div>
            )}

            <div className={styles.labelRow}>
              <span className={styles.label}>식당 맵 링크 <span className={styles.required}>*</span></span>
              <input
                className={styles.mapInput}
                placeholder="https://..."
                value={mapLink}
                onChange={(e) => setMapLink(e.target.value)}
              />
            </div>

          </section>

          <hr className={styles.divider} />

          <section className={styles.section}>
            <div className={styles.ratingBox}>
              <RatingInput
                value={rating}
                onChange={(v) => setRating(v)}
              />

              <span className={styles.ratingScore}>
                {rating.toFixed(1)}
              </span>
            </div>

          </section>
          <section className={styles.section}>
            <div className={styles.menuSectionTitle}>추천 메뉴</div>

            <div className={styles.menuInputRow}>
              <input
                className={styles.menuInput}
                placeholder="메뉴 입력"
                value={menuInput}
                onChange={(e) => setMenuInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMenu();
                  }
                }}
              />

              <button
                type="button"
                className={styles.menuAddButton}
                onClick={addMenu}
              >
                +
              </button>
            </div>

            {recommendedMenus.length > 0 && (
              <div className={styles.menuRow}>
                {recommendedMenus.map((menu) => (
                  <button
                    key={menu}
                    type="button"
                    className={styles.menuChip}
                    onClick={() => removeMenu(menu)}
                  >
                    {menu} ×
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3 className={styles.centerTitle}>태그 선택 <span className={styles.required}>*</span></h3>

            <div className={styles.tagTabs}>
              <button
                type="button"
                className={activeGroup === "region" ? styles.tagTabActive : styles.tagTab}
                onClick={() => setActiveGroup("region")}
              >
                지역
              </button>
              <button
                type="button"
                className={activeGroup === "food" ? styles.tagTabActive : styles.tagTab}
                onClick={() => setActiveGroup("food")}
              >
                음식 종류
              </button>
              <button
                type="button"
                className={activeGroup === "price" ? styles.tagTabActive : styles.tagTab}
                onClick={() => setActiveGroup("price")}
              >
                가격
              </button>
            </div>
              <div className={styles.selectedChips}>

              {selectedRegion && (
                <button
                  type="button"
                  className={styles.selectedChip}
                  onClick={() => setSelectedLv2(null)}
                >
                  {selectedRegion.name} ×
                </button>
              )}

              {selectedFoodTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={styles.selectedChip}
                  onClick={() => toggleFoodTag(tag)}
                >
                  {tag.name} ×
                </button>
              ))}
            </div>

            {activeGroup === "region" && (
              <>
                <div className={styles.tagSection}>
                  <div className={styles.tagSectionTitle}>시/도</div>
                  <div className={styles.tagGrid}>
                    {regionsLv1.map((r) => {
                      const selected = selectedLv1 === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          className={selected ? styles.tagButtonSelected : styles.tagButton}
                          onClick={() => {
                          setSelectedLv1(r.id);
                          setSelectedLv2(null);   
                        }}
                        >
                          {r.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.tagSection}>
                  <div className={styles.tagSectionTitle}>구/군</div>
                  <div className={styles.tagGrid}>
                    {regionsLv2.map((r) => {
                      const selected = selectedLv2 === r.id;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          className={selected ? styles.tagButtonSelected : styles.tagButton}
                          onClick={() => {
                            setSelectedLv2(r.id);
                          }}

                        >
                          {r.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}


            {activeGroup === "food" && (
            <>
              <div className={styles.tagSection}>
                <div className={styles.tagSectionTitle}>음식 대분류</div>
                <div className={styles.tagGrid}>
                  {foodParents.map((t) => {
                    const selected = selectedFoodParentId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={selected ? styles.tagButtonSelected : styles.tagButton}
                        onClick={() => handleFoodParentClick(t.id)}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.tagSection}>
                <div className={styles.tagSectionTitle}>음식 소분류</div>
                <div className={styles.tagGrid}>
                  {foodChildren.map((t) => {
                    const selected = selectedFoodTags.some((tag) => tag.id === t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={selected ? styles.tagButtonSelected : styles.tagButton}
                        onClick={() => toggleFoodTag(t)}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>


                
              </>
            )}

            {activeGroup === "price" && (
              <div className={styles.labelRow}>
                <span className={styles.label}>가격 범위 <span className={styles.required}>*</span></span>

                <input
                  className={styles.mapInput}
                  placeholder="최소 (예: 10000)"
                  value={priceMin}
                  inputMode="numeric"
                  onChange={(e) => setPriceMin(e.target.value === "" ? "" : Number(e.target.value))}
                />
                <span style={{ margin: "0 8px" }}>~</span>
                <input
                  className={styles.mapInput}
                  placeholder="최대 (예: 20000)"
                  value={priceMax}
                  inputMode="numeric"
                  onChange={(e) => setPriceMax(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.detailTitleRow}>
              <span className={styles.fieldTitle}>자세한 후기 입력<span className={styles.required}>*</span></span>
            </div>

            <textarea
              className={styles.detailTextarea}
              placeholder="입력해주세요"
              value={detailReview}
              onChange={(e) => setDetailReview(e.target.value)}
            />

            {(detailExisting.length > 0 || detailImagePreviews.length > 0) && (
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  gap: 8,
                  overflowX: "auto",
                  paddingBottom: 4,
                }}
              >
                {detailExisting.map((img) => (
                  <div key={img.id} style={{ position: "relative" }}>
                    <div className={styles.detailPreviewBox} style={{ width: 90, height: 90 }}>
                      <img src={img.image_url} alt="detail" className={styles.detailPreviewImage} />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteExisting(img.id)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.75)",
                        color: "white",
                        cursor: "pointer",
                        lineHeight: "22px",
                      }}
                      title="삭제"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {detailImagePreviews.map((src, i) => (
                  <div key={src} style={{ position: "relative" }}>
                    <div className={styles.detailPreviewBox} style={{ width: 90, height: 90 }}>
                      <img src={src} alt="new" className={styles.detailPreviewImage} />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDetailPreview(i)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.75)",
                        color: "white",
                        cursor: "pointer",
                        lineHeight: "22px",
                      }}
                      title="삭제"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.detailPhotoRow}>
  <button
    type="button"
    className={styles.detailPhotoButton}
    onClick={() => fileInputDetailRef.current?.click()}
  >
    사진 추가
    <span className={styles.plus}>+</span>
  </button>

  <input
    ref={fileInputDetailRef}
    type="file"
    accept="image/*"
    multiple
    style={{ display: "none" }}
    onChange={handleDetailFileChange}
  />
</div>
          </section>
        </main>
      </div>
      {toast && (
  <div className={styles.toast}>
    {toast}
  </div>
)}
    </div>
  );
}
