"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./page.module.css";
import client from "../../api/client"; // 네 경로에 맞게 유지/수정

type TagGroup = "region" | "food" | "price";

type Region = {
  id: number;
  name: string;
  parent_id?: number | null;
  depth?: number | null;
};

type TagCategory = {
  id: number;
  name: string;
  slug?: string | null;
};

type Tag = {
  id: number;
  name: string;
  category_id: number;
  parent_id?: number | null;
  is_selectable?: boolean;
};

export default function RestaurantFormPage() {
  const navigate = useNavigate();

  // -------------------------
  // 기본 입력
  // -------------------------
  const [name, setName] = useState("");
  const [shortReview, setShortReview] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [rating, setRating] = useState(0); // 0~5, 0.5 step UI

  const [menuInput, setMenuInput] = useState("");
  const [menus, setMenus] = useState<string[]>([]);
  const [detailReview, setDetailReview] = useState("");

  // -------------------------
  // 이미지 (파일 + 프리뷰)
  // -------------------------
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [detailImageFile, setDetailImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [detailImagePreview, setDetailImagePreview] = useState<string | null>(null);

  const handleMainImageChange = (file: File | null) => {
    if (!file) return;
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const handleDetailImageChange = (file: File | null) => {
    if (!file) return;
    setDetailImageFile(file);
    setDetailImagePreview(URL.createObjectURL(file));
  };

  // -------------------------
  // 지역 2단계 (대지역 -> 소지역)
  // -------------------------
  const [regionsLv1, setRegionsLv1] = useState<Region[]>([]);
  const [regionsLv2, setRegionsLv2] = useState<Region[]>([]);
  const [selectedLv1, setSelectedLv1] = useState<number | null>(null);
  const [selectedLv2, setSelectedLv2] = useState<number | null>(null);

  // -------------------------
  // 음식 태그 (백엔드 tag_ids)
  // -------------------------
  const [foodTags, setFoodTags] = useState<Tag[]>([]);
  const [selectedFoodTagIds, setSelectedFoodTagIds] = useState<number[]>([]);

  const toggleFoodTagId = (id: number) => {
    setSelectedFoodTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const clearFoodTags = () => setSelectedFoodTagIds([]);

  // -------------------------
  // 가격 범위 (태그 아님)
  // -------------------------
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");

  // -------------------------
  // UI 탭
  // -------------------------
  const [activeGroup, setActiveGroup] = useState<TagGroup>("region");

  // -------------------------
  // 로딩/전송 상태
  // -------------------------
  const [submitting, setSubmitting] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // =========================================================
  // (1) 대지역 로드: GET /regions
  // =========================================================
  useEffect(() => {
    const loadLv1 = async () => {
      setLoadingMeta(true);
      try {
        const lv1: Region[] = (await client.get("/regions")).data;
        const filtered = lv1.filter((r) => !r.name.endsWith("전체")); // "~전체" 숨김
        setRegionsLv1(filtered);
        if (filtered.length) setSelectedLv1(filtered[0].id);
      } finally {
        setLoadingMeta(false);
      }
    };

    loadLv1().catch((e) => {
      console.error(e);
      alert("대지역 목록 로딩 실패");
    });
  }, []);

  // =========================================================
  // (2) 소지역 로드: GET /regions?parent_id=...
  // =========================================================
  useEffect(() => {
    const loadLv2 = async () => {
      if (!selectedLv1) return;
      const lv2: Region[] = (
        await client.get("/regions", { params: { parent_id: selectedLv1 } })
      ).data;

      const filtered = lv2.filter((r) => !r.name.endsWith("전체")); // "~전체" 숨김
      setRegionsLv2(filtered);
      setSelectedLv2(filtered.length ? filtered[0].id : null);
    };

    loadLv2().catch((e) => {
      console.error(e);
      alert("소지역 목록 로딩 실패");
    });
  }, [selectedLv1]);

  // =========================================================
  // (3) 음식 태그 로드: GET /tag-categories -> /tags?category_id=...
  // =========================================================
  useEffect(() => {
    const loadFoodTags = async () => {
      const cats: TagCategory[] = (await client.get("/tag-categories")).data;

      // 음식 카테고리 찾기(슬러그 있으면 slug 우선, 없으면 name으로)
      const foodCat =
        cats.find((c) => (c.slug ?? "").toLowerCase().includes("food")) ||
        cats.find((c) => c.name.includes("음식"));

      if (!foodCat) {
        // 음식 카테고리가 없다면, 그냥 비워둠
        setFoodTags([]);
        return;
      }

      const tags: Tag[] = (await client.get("/tags", { params: { category_id: foodCat.id } })).data;

      // selectable=false는 UI에서 제외
      setFoodTags(tags.filter((t) => t.is_selectable !== false));
    };

    loadFoodTags().catch((e) => {
      console.error(e);
      alert("음식 태그 로딩 실패");
    });
  }, []);

  // -------------------------
  // 메뉴 칩
  // -------------------------
  const handleAddMenu = () => {
    const trimmed = menuInput.trim();
    if (!trimmed) return;
    if (menus.includes(trimmed)) {
      setMenuInput("");
      return;
    }
    setMenus((prev) => [...prev, trimmed]);
    setMenuInput("");
  };

  const removeMenu = (menu: string) => {
    setMenus((prev) => prev.filter((m) => m !== menu));
  };

  // -------------------------
  // rating: 백엔드가 int(0~5)면 반올림해서 보냄
  // -------------------------
  const ratingInt = useMemo(() => {
    const r = Math.round(rating); // 0.5 step UI -> 정수로 변환
    return Math.max(0, Math.min(5, r));
  }, [rating]);

  // -------------------------
  // submit: POST /restaurants -> (옵션) POST /restaurants/{id}/images
  // -------------------------
  const handleSubmit = async () => {
    if (submitting) return;

    // 최소 검증(백엔드에서 터지기 전에 프론트에서 막기)
    if (!name.trim()) return alert("식당 이름을 입력해줘.");
    if (!mapLink.trim()) return alert("맵 링크를 입력해줘.");
    if (!mapLink.trim().startsWith("http")) return alert("맵 링크는 http/https로 시작해야 해.");
    if (!selectedLv2) return alert("소지역(구/시/군)을 선택해줘.");
    if (priceMin === "" || priceMax === "") return alert("가격 범위(최소/최대)를 입력해줘.");
    if (Number.isNaN(priceMin) || Number.isNaN(priceMax)) return alert("가격은 숫자만 입력해줘.");
    if ((priceMin as number) > (priceMax as number)) return alert("최소 가격이 최대 가격보다 클 수 없어.");
    if (selectedFoodTagIds.length === 0) return alert("음식 태그를 최소 1개 선택해줘.");

    try {
      setSubmitting(true);

      // menus는 백엔드 필드가 없을 수 있어서 description에 합침(확정 스펙이면 여기 조정)
      const menuLine = menus.length ? `\n\n추천 메뉴: ${menus.join(", ")}` : "";
      const description = `${detailReview ?? ""}${menuLine}`.trim() || " ";

      const payload = {
        name: name.trim(),
        location_link: mapLink.trim(),
        location_tag_id: selectedLv2,
        rating: ratingInt,
        summary: (shortReview ?? "").trim() || " ",
        description,
        price_min: priceMin as number,
        price_max: priceMax as number,
        tag_ids: selectedFoodTagIds,
      };

      const created = await client.post("/restaurants", payload).then((r) => r.data);

      if (!created?.ok) {
        alert(created?.message ?? "식당 등록 실패");
        return;
      }

      const restaurantId: number | undefined = created?.data?.id;
      if (!restaurantId) {
        alert("등록은 됐는데 restaurant id를 못 받았어. 응답 확인 필요.");
        return;
      }

      // 이미지 업로드(있을 때만)
      const files: File[] = [];
      if (mainImageFile) files.push(mainImageFile);
      if (detailImageFile) files.push(detailImageFile);

      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));

        await client.post(`/restaurants/${restaurantId}/images`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("식당 등록 완료!");
      navigate("/restaurant", { replace: true });

      // TODO: 등록 후 이동 라우트가 있으면 여기서 navigate 처리
      // 예: navigate(`/restaurants/${restaurantId}`);
    } catch (e: any) {
      console.error(e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "등록 중 오류";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backButton}>〈</button>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "저장 중..." : "완료"}
          </button>
        </header>

        <main className={styles.main}>
          <section className={styles.section}>
            <p className={styles.guideText}>식당 이름을 입력해주세요.</p>
            <input
              className={styles.nameInput}
              placeholder="식당 이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className={styles.row}>
              <textarea
                className={styles.shortReview}
                maxLength={100}
                placeholder="한줄평: 100자 이내로 적어주세요"
                value={shortReview}
                onChange={(e) => setShortReview(e.target.value)}
              />
              <label className={styles.photoButton}>
                {mainImagePreview ? (
                  <img
                    src={mainImagePreview}
                    alt="main"
                    className={styles.photoPreview}
                  />
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
                  onChange={(e) =>
                    handleMainImageChange(e.target.files?.[0] ?? null)
                  }
                />
              </label>
            </div>

            <div className={styles.labelRow}>
              <span className={styles.label}>식당 맵 링크 :</span>
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
            <div className={styles.centerTitle}>
              추천 정도 <span className={styles.smallText}>(0.5 단위)</span>
            </div>
            <div className={styles.ratingStars}>
              {Array.from({ length: 10 }).map((_, idx) => {
                const stepValue = (idx + 1) * 0.5;
                const active = rating >= stepValue;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={
                      active
                        ? styles.starButtonActive
                        : styles.starButtonInactive
                    }
                    onClick={() => setRating(stepValue)}
                  >
                    ★
                  </button>
                );
              })}
            </div>

            <div className={styles.menuRow}>
              <span className={styles.label}>추천 메뉴 :</span>
              <input
                className={styles.menuInput}
                placeholder="메뉴 입력"
                value={menuInput}
                onChange={(e) => setMenuInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMenu();
                  }
                }}
              />
              <button
                className={styles.menuAddButton}
                type="button"
                onClick={handleAddMenu}
              >
                +
              </button>
            </div>

            {menus.length > 0 && (
              <div className={styles.chipRow}>
                {menus.map((menu) => (
                  <button
                    key={menu}
                    className={styles.chip}
                    type="button"
                    onClick={() => removeMenu(menu)}
                  >
                    {menu} ×
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3 className={styles.centerTitle}>태그 선택</h3>

            <div className={styles.tagTabs}>
              <button
                type="button"
                className={
                  activeGroup === "region"
                    ? styles.tagTabActive
                    : styles.tagTab
                }
                onClick={() => setActiveGroup("region")}
              >
                지역
              </button>
              <button
                type="button"
                className={
                  activeGroup === "food" ? styles.tagTabActive : styles.tagTab
                }
                onClick={() => setActiveGroup("food")}
              >
                음식 종류
              </button>
              <button
                type="button"
                className={
                  activeGroup === "price" ? styles.tagTabActive : styles.tagTab
                }
                onClick={() => setActiveGroup("price")}
              >
                가격
              </button>
            </div>

            {/* 지역: 2단계 */}
            {activeGroup === "region" && (
              <>
                <div className={styles.tagGrid}>
                  {regionsLv1.map((r) => {
                    const selected = selectedLv1 === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        className={
                          selected ? styles.tagButtonSelected : styles.tagButton
                        }
                        onClick={() => setSelectedLv1(r.id)}
                        disabled={loadingMeta}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>

                <div className={styles.tagGrid} style={{ marginTop: 12 }}>
                  {regionsLv2.map((r) => {
                    const selected = selectedLv2 === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        className={
                          selected ? styles.tagButtonSelected : styles.tagButton
                        }
                        onClick={() => setSelectedLv2(r.id)}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* 음식 태그: tag_ids */}
            {activeGroup === "food" && (
              <>
                <div className={styles.tagGrid}>
                  {foodTags.map((t) => {
                    const selected = selectedFoodTagIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={
                          selected
                            ? styles.tagButtonSelected
                            : styles.tagButton
                        }
                        onClick={() => toggleFoodTagId(t.id)}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>

                <div className={styles.selectedTagRow}>
                  <button
                    type="button"
                    className={styles.trashButton}
                    onClick={clearFoodTags}
                  >
                    전체 삭제
                  </button>

                  <div className={styles.selectedChips}>
                    {selectedFoodTagIds.map((id) => {
                      const t = foodTags.find((x) => x.id === id);
                      return (
                        <button
                          key={id}
                          type="button"
                          className={styles.selectedChip}
                          onClick={() => toggleFoodTagId(id)}
                        >
                          {t?.name ?? `#${id}`} ×
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* 가격: min/max 입력 */}
            {activeGroup === "price" && (
              <div className={styles.labelRow}>
                <span className={styles.label}>가격 범위 :</span>

                <input
                  className={styles.mapInput}
                  placeholder="최소 (예: 10000)"
                  value={priceMin}
                  inputMode="numeric"
                  onChange={(e) =>
                    setPriceMin(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />

                <span style={{ margin: "0 8px" }}>~</span>

                <input
                  className={styles.mapInput}
                  placeholder="최대 (예: 20000)"
                  value={priceMax}
                  inputMode="numeric"
                  onChange={(e) =>
                    setPriceMax(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.labelRow}>
              <span className={styles.label}>자세한 후기 입력 :</span>
            </div>
            <textarea
              className={styles.detailTextarea}
              placeholder="입력해주세요"
              value={detailReview}
              onChange={(e) => setDetailReview(e.target.value)}
            />

            <div className={styles.detailPhotoRow}>
              {detailImagePreview && (
                <div className={styles.detailPreviewBox}>
                  <img
                    src={detailImagePreview}
                    alt="detail"
                    className={styles.detailPreviewImage}
                  />
                </div>
              )}
              <label className={styles.detailPhotoButton}>
                사진 추가
                <span className={styles.plus}>+</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleDetailImageChange(e.target.files?.[0] ?? null)
                  }
                />
              </label>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
