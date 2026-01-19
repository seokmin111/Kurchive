"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./page.module.css";
import client from "../../api/client";

type TagChip = { id: string; label: string };

type RestaurantDetail = {
  id: number;
  name: string;
  address?: string | null;
  location_link: string;
  region?: { id: number; name: string; parent_id?: number | null; depth?: number | null } | null;
  tags: { id: number; name: string }[];
  rating: number;
  summary: string;
  description: string;
  price_min: number;
  price_max: number;

  uploaded_by: number;
  images?: { id: number; image_url: string; created_at: number; is_cover?: boolean }[];
};

type TagSuggestion = { id: number; name: string };

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.stars} aria-label={`rating ${value} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const v = i + 1;
        const filled = v <= value;
        return (
          <button
            key={v}
            type="button"
            className={`${styles.starBtn} ${filled ? styles.starOn : styles.starOff}`}
            onClick={() => onChange(v)}
            aria-label={`${v} star`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function RestaurantDetailPage() {

  const getMyUserId = () => {
  const v = localStorage.getItem("user_id"); // 이것만
  const n = v ? Number(v) : NaN;
  return !Number.isNaN(n) && n > 0 ? n : null;
};

  const [isOwner, setIsOwner] = useState(false);


  const nav = useNavigate();
  const { restaurantId } = useParams();

  const rid = useMemo(() => Number(restaurantId), [restaurantId]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // --- form states ---
  const [name, setName] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [rating, setRating] = useState(0);

  // PUT 필수 필드들
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(0);
  const [locationTagId, setLocationTagId] = useState<number>(0);

  // 추천 메뉴(프론트만)
  const [recommendA, setRecommendA] = useState("");
  const [recommendB, setRecommendB] = useState("");

  // tags: UI는 label만 보여주고, 서버에는 id만 보냄
  const [tags, setTags] = useState<TagChip[]>([]);

  // ✅ 태그 자동완성
  const [tagQuery, setTagQuery] = useState("");
  const [tagOpen, setTagOpen] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<TagSuggestion[]>([]);
  const tagBoxRef = useRef<HTMLDivElement | null>(null);

  // images
  const [serverImages, setServerImages] = useState<RestaurantDetail["images"]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // --- GET detail ---
  useEffect(() => {
    if (!rid || Number.isNaN(rid)) return;

    const fetchDetail = async () => {
      
      setLoading(true);
      setErrMsg("");
      try {
        const res = await client.get<RestaurantDetail>(`/restaurants/${rid}`);
        const data = res.data;
        

        const me = getMyUserId();
        const owner = Number(data.uploaded_by);
        setIsOwner(me !== null && me === owner);

        console.log("[owner-check]", {
        me: getMyUserId(),
        uploaded_by: data.uploaded_by,
        uploaded_by_num: Number(data.uploaded_by),
      });


        setName(data.name ?? "");
        setMapUrl(data.location_link ?? "");
        setRating(data.rating ?? 0);

        setSummary(data.summary ?? "");
        setDescription(data.description ?? "");
        setPriceMin(data.price_min ?? 0);
        setPriceMax(data.price_max ?? 0);

        // region -> location_tag_id로 씀
        setLocationTagId(data.region?.id ?? 0);

        // tags
        setTags(
          (data.tags ?? []).map((t) => ({
            id: String(t.id),
            label: t.name,
          }))
        );

        setServerImages(data.images ?? []);
      } catch (e: any) {
        console.error(e);
        if (e?.response?.status === 401) setErrMsg("로그인이 만료되었습니다. 다시 로그인해주세요.");
        else if (e?.response?.status === 404) setErrMsg("해당 식당을 찾을 수 없습니다.");
        else setErrMsg("상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [rid]);

  // --- 태그 자동완성: debounce fetch ---
  useEffect(() => {
    const q = tagQuery.trim();
    if (!q) {
      setTagSuggestions([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const res = await client.get<TagSuggestion[]>("/tags/search", { params: { q } });
        setTagSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setTagSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [tagQuery]);

  // --- 드롭다운 바깥 클릭하면 닫기 ---
  useEffect(() => {
    const onDocMouseDown = (ev: MouseEvent) => {
      const el = tagBoxRef.current;
      if (!el) return;
      if (!el.contains(ev.target as Node)) setTagOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const removeTag = (id: string) => setTags((prev) => prev.filter((t) => t.id !== id));

  const addTag = (s: TagSuggestion) => {
    const id = String(s.id);
    setTags((prev) => {
      if (prev.some((t) => t.id === id)) return prev;
      return [...prev, { id, label: s.name }];
    });
    setTagQuery("");
    setTagSuggestions([]);
    setTagOpen(false);
  };

  // --- 이미지 업로드 ---
  const uploadImages = async (files: FileList | null) => {
    if (!isOwner) return;
    if (!files || files.length === 0) return;
    if (!rid || Number.isNaN(rid)) return;

    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));

    try {
      await client.post(`/restaurants/${rid}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = await client.get<RestaurantDetail>(`/restaurants/${rid}`);
      setServerImages(res.data.images ?? []);
      alert("이미지 업로드 완료!");
    } catch (e: any) {
      console.error(e);
      alert("이미지 업로드 실패. 파일 형식/권한/서버 상태 확인.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // --- PUT 저장 ---
  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (!mapUrl.trim()) return false;
    if (!summary.trim()) return false;
    if (!description.trim()) return false;
    if (!locationTagId || locationTagId <= 0) return false;
    if (priceMin < 0 || priceMax < 0) return false;
    if (priceMax < priceMin) return false;
    if (tags.length === 0) return false;
    return true;
  }, [name, mapUrl, summary, description, locationTagId, priceMin, priceMax, tags]);

  const onSave = async () => {
    if (!isOwner) return;
    if (!rid || Number.isNaN(rid)) return;
    if (!canSave) {
      alert("필수값을 확인해주세요. (요약/설명/지역ID/태그/가격범위)");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        location_link: mapUrl,
        location_tag_id: locationTagId,
        rating,
        summary,
        description,
        price_min: priceMin,
        price_max: priceMax,
        tag_ids: tags.map((t) => Number(t.id)),
      };

      await client.put(`/restaurants/${rid}`, payload);
      alert("저장 완료!");
    } catch (e: any) {
      console.error(e);
      if (e?.response?.status === 403) alert("권한이 없습니다(업로더/관리자만 수정 가능).");
      else alert("저장 실패. 입력값/서버 로그 확인.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.screen} style={{ padding: 16 }}>로딩중...</div>;
  if (errMsg) return <div className={styles.screen} style={{ padding: 16 }}>{errMsg}</div>;

  return (
    <div className={styles.screen}>
      <header className={styles.topbar}>
        <button className={styles.backBtn} onClick={() => nav(-1)} aria-label="back">
          ‹
        </button>
        <h1 className={styles.title}>식당 상세</h1>
        <button className={styles.bookmarkBtn} type="button" aria-label="bookmark">
          ⌁
        </button>
      </header>

      <main className={styles.body}>
        {/* 1) 썸네일 + 식당이름 */}
        <section className={styles.row}>
          <div className={styles.thumbBox} aria-label="thumbnail placeholder" />
          <div className={styles.inputBlock}>
            <input
              className={styles.textInput}
              placeholder="식당 이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </section>

        {/* 2) 별점 */}
        <section className={styles.ratingRow}>
          <div className={styles.ratingLabel}>추천 정도 {rating}점</div>
          <StarRating value={rating} onChange={setRating} />
        </section>

        {/* 3) 맵링크 */}
        <section className={styles.mapRow}>
          <div className={styles.mapIcon} aria-hidden="true">🗺️</div>
          <input
            className={styles.mapInput}
            placeholder="맵 링크 : https://..."
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
          />
        </section>

        {/* 4) 태그(칩) + 태그 검색 */}
        <section className={styles.tagSection}>
          <div className={styles.sectionLabel}>태그</div>

          <div className={styles.tagList}>
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                className={styles.tagChip}
                onClick={() => removeTag(t.id)}
                title="클릭하면 삭제"
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ✅ ID 입력 제거: 이름 검색/선택 */}
          <div className={styles.tagBox} ref={tagBoxRef}>
            <input
              className={styles.tagInput}
              placeholder="태그 검색 (예: 인도, 종로, 고기...)"
              value={tagQuery}
              onChange={(e) => {
                setTagQuery(e.target.value);
                setTagOpen(true);
              }}
              onFocus={() => setTagOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && tagSuggestions.length > 0) {
                  addTag(tagSuggestions[0]);
                }
                if (e.key === "Escape") setTagOpen(false);
              }}
            />

            {tagOpen && tagSuggestions.length > 0 && (
              <div className={styles.tagDropdown}>
                {tagSuggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={styles.tagOption}
                    onClick={() => addTag(s)}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 지역 ID(지금은 입력 유지, 다음 단계에서 지역 드롭다운으로 개선 가능) */}
          <div className={styles.locationRow}>
            <div className={styles.locationLabel}>지역 ID(location_tag_id)</div>
            <input
              className={styles.locationInput}
              type="number"
              value={locationTagId}
              onChange={(e) => setLocationTagId(Number(e.target.value))}
              placeholder="예: 47"
            />
          </div>
        </section>

        <hr className={styles.divider} />

        {/* 5) 추천 메뉴(프론트만) */}
        <section className={styles.recoSection}>
          <div className={styles.sectionLabel}>추천 메뉴</div>
          <div className={styles.recoRow}>
            <input
              className={styles.recoInput}
              value={recommendA}
              onChange={(e) => setRecommendA(e.target.value)}
              placeholder="메뉴 1"
            />
            <input
              className={styles.recoInput}
              value={recommendB}
              onChange={(e) => setRecommendB(e.target.value)}
              placeholder="메뉴 2"
            />
          </div>
        </section>

        {/* 6) 사진 */}
        <section className={styles.photoSection}>
          <div className={styles.photoHeader}>
            <div className={styles.sectionLabel}>사진</div>

            {isOwner && (
              <>
                <button
                  type="button"
                  className={styles.photoAddBtn}
                  onClick={() => fileRef.current?.click()}
                >
                  + 업로드
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className={styles.hiddenFile}
                  onChange={(e) => uploadImages(e.target.files)}
                />
              </>
            )}
          </div>


          <div className={styles.photoRail}>
            {(serverImages?.length ?? 0) === 0 ? (
              <>
                <div className={styles.photoCard}>사진 없음</div>
                <div className={styles.photoCard}>사진 없음</div>
              </>
            ) : (
              serverImages!.map((img) => (
                <div key={img.id} className={styles.photoWrap}>
                  <img src={img.image_url} className={styles.photoImg} alt={`img-${img.id}`} />
                </div>
              ))
            )}
            <div className={styles.railArrow} aria-hidden="true">›</div>
          </div>

          <div className={styles.photoCaption} />
        </section>

        {/* 7) 요약(summary) */}
        <section className={styles.oneLineSection}>
          <div className={styles.sectionLabelCenter}>요약</div>
          <input
            className={styles.oneLineBox}
            placeholder="한줄평"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </section>

        {/* 8) 상세설명(description) */}
        <section className={styles.memoSection}>
          <div className={styles.sectionLabelCenter}>상세 설명</div>
          <textarea
            className={styles.memoBox}
            placeholder="자세한 후기 / 메모"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </section>

        {/* 9) 가격 2칸 */}
        <section className={styles.priceSection}>
          <div className={styles.sectionLabelCenter}>가격</div>
          <div className={styles.priceRow}>
            <input
              className={styles.priceInput}
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(Number(e.target.value))}
              placeholder="최소"
            />
            <input
              className={styles.priceInput}
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              placeholder="최대"
            />
          </div>
        </section>

        {/* 10) 저장: 본인 글일 때만 보이게 */}
          {isOwner && (
            <section className={styles.actionRow}>
              <button
                type="button"
                className={`${styles.saveBtn} ${canSave ? styles.saveOn : styles.saveOff}`}
                onClick={onSave}
                disabled={!canSave || saving}
              >
                {saving ? "저장중..." : "저장"}
              </button>
            </section>
          )}

      </main>
    </div>
  );
}
