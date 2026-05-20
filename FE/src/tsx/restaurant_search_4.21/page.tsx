"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./page.module.css";
import client from "../../api/client";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import TagFilterBottomSheetV2 from "./components/TagFilterBottomSheetV2";
import SearchPageHeader from "./components/SearchPageHeader";
import SearchInput from "../../components/common/SearchInput";

config.autoAddCss = false;

type SuggestionItem = {
  id: number;
  name: string;
};

type SelectedItem = {
  type: "region" | "tag" | "price";
  id: number | null;
  name: string;
  priceMin?: number;
  priceMax?: number;
};

export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  const initialSelectedTags = useMemo<SelectedItem[]>(() => {
    const params = new URLSearchParams(location.search);

    const initialTagId = params.get("tag_id");
    const initialTagName = params.get("tag_name");
    const initialRegionId = params.get("region_id");
    const initialRegionName = params.get("region_name");

    const items: SelectedItem[] = [];

    if (initialTagId && initialTagName) {
      items.push({
        type: "tag",
        id: Number(initialTagId),
        name: initialTagName,
      });
    }

    if (initialRegionId && initialRegionName) {
      items.push({
        type: "region",
        id: Number(initialRegionId),
        name: initialRegionName,
      });
    }

    return items;
  }, [location.search]);

  const [isTagSearchOpen, setIsTagSearchOpen] = useState(
    initialSelectedTags.length > 0
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const res = await client.get("/restaurants/search", {
          params: { q: query.trim() },
        });

        setSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        if (err?.response?.status !== 401) {
          console.error(err);
        }

        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <main className={styles.nomrg}>
      <SearchPageHeader />

      <div
        className={styles.search_container}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            (document.activeElement as HTMLElement)?.blur();
          }
        }}
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          onSearch={(value) => {
            if (!value) return;

            navigate(`/restaurant/search/results?q=${encodeURIComponent(value)}`);
          }}
          placeholder="식당 이름을 입력하세요"
          className={styles.search_form}
          inputClassName={styles.input_box}
          buttonClassName={styles.search_btn}
          buttonContent={<FontAwesomeIcon icon={faMagnifyingGlass} />}
        />

        {suggestions.length > 0 && (
          <ul className={styles.suggestion_list}>
            {suggestions.map((item) => (
              <li
                key={item.id}
                onClick={() => {
                  setQuery(item.name);
                  navigate(`/restaurant/search/results?q=${encodeURIComponent(item.name)}`);
                }}
                style={{ cursor: "pointer" }}
              >
                {item.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isTagSearchOpen && (
        <button
          type="button"
          className={styles.mapSearchFab}
          onClick={() => navigate("/restaurant/map")}
          aria-label="지도로 보기"
        >
          <img src="/map.svg" alt="" className={styles.mapSearchFabIcon} />
          <span className={styles.mapSearchFabText}>지도로 보기</span>
        </button>
      )}

      {!isTagSearchOpen && (
        <div
          className={styles.tagSearchHandle}
          onClick={() => setIsTagSearchOpen(true)}
        >
          <div className={styles.tagSearchHandle__chevron}>
            <div>
              <FontAwesomeIcon icon={faChevronUp} />
            </div>
            <div>
              <FontAwesomeIcon icon={faChevronUp} />
            </div>
          </div>
          <div className={styles.tagSearchHandle__text}>태그로 검색하기</div>
        </div>
      )}

      {isTagSearchOpen && (
        <TagFilterBottomSheetV2
          isOpen={isTagSearchOpen}
          onClose={() => setIsTagSearchOpen(false)}
          initialSelectedTags={initialSelectedTags}
        />
      )}
    </main>
  );
}