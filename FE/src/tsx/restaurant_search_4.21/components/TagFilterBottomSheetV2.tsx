import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "../page.module.css";
import { SelectedItem } from "./types";
import RegionSelector from "./RegionSelector";
import FoodTagSelector from "./FoodTagSelector";
import PriceRangeSelectorV3 from "./PriceRangeSelectorV3";
import AtmosphereSelector from "./AtmosphereSelector";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const TAGS = ["지역", "음식 종류", "가격", "분위기"] as const;

export default function TagFilterBottomSheetV2({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const regionRef = useRef<HTMLDivElement>(null);
  const foodRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const atmoRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeTag, setActiveTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<SelectedItem[]>([]);

  useEffect(() => {
    const content = scrollRef.current;
    if (!content) return;

    let target: HTMLElement | null = null;
    if (activeTag === "지역") target = regionRef.current;
    if (activeTag === "음식 종류") target = foodRef.current;
    if (activeTag === "가격") target = priceRef.current;
    if (activeTag === "분위기") target = atmoRef.current;

    if (!target) return;

    const contentTop = content.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;

    content.scrollTo({
      top: content.scrollTop + (targetTop - contentTop),
      behavior: "smooth",
    });
  }, [activeTag]);

  const addItem = (item: SelectedItem) => {
    if (item.type === "price") {
      setSelectedTags((prev) => [
        ...prev.filter((selected) => selected.type !== "price"),
        item,
      ]);
      return;
    }

    setSelectedTags((prev) => {
      let next = prev;

      if (
        (item.type === "region" || item.type === "tag") &&
        typeof item.parentId === "number"
      ) {
        const isAllItem = item.id === item.parentId;

        next = next.filter((selected) => {
          const isSameGroup =
            selected.type === item.type && selected.parentId === item.parentId;

          if (!isSameGroup) return true;

          const selectedIsAll = selected.id === selected.parentId;
          return isAllItem ? selectedIsAll : !selectedIsAll;
        });
      }

      const exists = next.some(
        (selected) => selected.id === item.id && selected.type === item.type
      );
      return exists
        ? next.filter(
            (selected) =>
              !(selected.id === item.id && selected.type === item.type)
          )
        : next.concat(item);
    });
  };

  const removeItem = (target: SelectedItem) => {
    setSelectedTags((prev) => prev.filter((item) => item !== target));
  };

  const clearAll = () => {
    setSelectedTags([]);
  };

  const applyFilter = () => {
    const params = new URLSearchParams();
    const tagIds: number[] = [];
    let regionId: number | null = null;
    let priceMin: number | undefined;
    let priceMax: number | undefined;

    for (const item of selectedTags) {
      if (item.type === "region") regionId = item.id;
      if (item.type === "tag" && typeof item.id === "number") tagIds.push(item.id);
      if (item.type === "price") {
        priceMin = item.priceMin;
        priceMax = item.priceMax;
      }
    }

    if (regionId) params.set("region_id", String(regionId));
    if (tagIds.length) params.set("tag_ids", tagIds.join(","));
    if (priceMin != null) params.set("price_min", String(priceMin));
    if (priceMax != null) params.set("price_max", String(priceMax));

    navigate(`/restaurant/search/results?${params.toString()}`);
  };

  return (
    <div className="tagSearch">
      <div className={`${styles.tagSearchContainer} ${isOpen ? styles.show : ""}`}>
        <h6 className={styles.tagSearch__title} onClick={onClose}>
          태그로 검색하기
        </h6>

        <div className={styles.tagSearch__tags}>
          {TAGS.map((tag) => (
            <div
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`${styles.tagSearch__tag} ${activeTag === tag ? styles.red : ""}`}
            >
              <div>{tag}</div>
            </div>
          ))}
        </div>

        <div className={styles.tagSearch__bar}></div>

        <div ref={scrollRef} className={styles.scrollableContent}>
          <div ref={regionRef}>
            <RegionSelector onAddItem={addItem} />
          </div>

          <div ref={foodRef}>
            <FoodTagSelector onAddItem={addItem} />
          </div>

          <div ref={priceRef}>
            <PriceRangeSelectorV3 onAddItem={addItem} />
          </div>

          <div ref={atmoRef}>
            <AtmosphereSelector onAddItem={addItem} />
          </div>
        </div>

        <div className={styles.tagSearch__bar}></div>
        <div className={styles.tagSearch__submit}>
          <div className={styles.tagSearch__selectedRow}>
            <div className={styles.tagSearch__trashcan} onClick={clearAll}>
              <FontAwesomeIcon icon={faTrashCan} />
            </div>
            <div className={styles.tagSearch__iconAndTags}>
              {selectedTags.map((item, idx) => (
                <div key={`${item.type}-${item.id}-${idx}`} className={styles.tagSearch__selectedTag}>
                  <span className={styles.tagSearch__selectedTagText}>{item.name}</span>
                  <span className={styles.tagSearch__tagDel} onClick={() => removeItem(item)}>
                    <FontAwesomeIcon icon={faXmark} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.tagSearch__submitBtns}>
            <button className={styles.tagSearch__apply} type="button" onClick={applyFilter}>
              <span>적용하기</span>
            </button>
            <button className={styles.tagSearch__close} type="button" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
