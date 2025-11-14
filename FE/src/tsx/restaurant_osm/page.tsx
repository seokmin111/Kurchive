"use client";

import { useState } from "react";
import styles from "./page.module.css";

type TagGroup = "region" | "food" | "price";

const REGION_TAGS = [
  "서울 전체",
  "강남",
  "서초",
  "잠실/송파/강동",
  "영등포/여의도/강서",
  "건대/성수/왕십리",
  "종로/중구",
  "홍대/합정/마포",
  "용산/이태원/한남",
  "성북/노원/중랑",
  "구로/관악/동작",
];

const FOOD_TAGS = [
  "한식",
  "중식",
  "일식",
  "양식",
  "카페/디저트",
  "분식",
  "고기/구이",
  "해산물",
  "술집",
];

const PRICE_TAGS = ["만원 이하", "1만~2만", "2만~3만", "3만 이상"];

export default function RestaurantFormPage() {
  const [name, setName] = useState("");
  const [shortReview, setShortReview] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [rating, setRating] = useState(0); // 0~5, 0.5 step
  const [menuInput, setMenuInput] = useState("");
  const [menus, setMenus] = useState<string[]>([]);
  const [detailReview, setDetailReview] = useState("");
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [detailImagePreview, setDetailImagePreview] = useState<string | null>(
    null
  );
  const [activeGroup, setActiveGroup] = useState<TagGroup>("region");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleMainImageChange = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMainImagePreview(url);
  };

  const handleDetailImageChange = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDetailImagePreview(url);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearTags = () => setSelectedTags([]);

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

  const handleSubmit = () => {
    const payload = {
      name,
      shortReview,
      mapLink,
      rating,
      menus,
      tags: selectedTags,
      detailReview,
    };
    console.log("submit payload", payload);
    alert("임시로 콘솔에만 출력했습니다.");
  };

  const getCurrentTags = () => {
    if (activeGroup === "region") return REGION_TAGS;
    if (activeGroup === "food") return FOOD_TAGS;
    return PRICE_TAGS;
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backButton}>〈</button>
          <button className={styles.submitButton} onClick={handleSubmit}>
            완료
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
                placeholder="입력"
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

            <div className={styles.tagGrid}>
              {getCurrentTags().map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={
                      selected ? styles.tagButtonSelected : styles.tagButton
                    }
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className={styles.selectedTagRow}>
              <button
                type="button"
                className={styles.trashButton}
                onClick={clearTags}
              >
                전체 삭제
              </button>
              <div className={styles.selectedChips}>
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={styles.selectedChip}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.confirmRow}>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={() => {}}
              >
                확인
              </button>
            </div>
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
