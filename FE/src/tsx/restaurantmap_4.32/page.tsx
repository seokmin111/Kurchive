"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import NaverMap from "./components/Navermap";
import style from "./page.module.css";
import client from "../../api/client";
import { listRestaurants } from "../../api/restaurant";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

type FilterType = "food" | "location" | "price" | "atmosphere" | null;

export default function MapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [restaurantIds, setRestaurantIds] = useState<number[]>([]);
  const [activeModal, setActiveModal] = useState<FilterType>(null);

  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedFoodIds, setSelectedFoodIds] = useState<number[]>([]);
  const [selectedAtmosphereIds, setSelectedAtmosphereIds] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const idsString = searchParams.get("ids");
    if (idsString) {
      const idsArray = idsString
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((num) => !isNaN(num));
      setRestaurantIds(idsArray);
    } else {
      // ids가 없으면 전체 식당 로드
      client.get("/restaurants")
        .then((res) => {
          const allIds = res.data.map((r: any) => r.id);
          setRestaurantIds(allIds);
        })
        .catch((e) => console.error("전체 목록 로드 실패", e));
    }
  }, [searchParams]);

  const applyFilters = async (
    newRegionId: number | null,
    newFoodIds: number[],
    newAtmoIds: number[],
    newPrice: { min: number; max: number } | null
  ) => {
    try {
      //   상태를 먼저 업데이트하지 않고, 파라미터만 구성하여 미리 검색 시도
      const allTagIds = [...newFoodIds, ...newAtmoIds];

      const params: any = {};
      
      if (newRegionId) params.region_id = newRegionId;
      if (allTagIds.length > 0) {
        params.tag_ids = allTagIds.join(",");
      }
      
      if (newPrice) {
        if (newPrice.min > 0) params.price_min = newPrice.min;
        if (newPrice.max > 0) params.price_max = newPrice.max;
      }

      console.log("검색 요청 Params:", params);
      
      // API 호출
      const res = await client.get("/restaurants", { params });
      const results = res.data;

      // 결과 확인 후 처리
      if (results && Array.isArray(results) && results.length > 0) {
        // 결과가 있을 때만 상태 업데이트 및 지도 반영
        const newIds = results.map((r: any) => r.id);
        setRestaurantIds(newIds);

        setSelectedRegionId(newRegionId);
        setSelectedFoodIds(newFoodIds);
        setSelectedAtmosphereIds(newAtmoIds);
        setPriceRange(newPrice);

        // 모달 닫기
        setActiveModal(null);
      } else {
        // 결과가 없으면 경고만 띄우고 기존 상태 유지 (모달도 닫지 않음)
        alert("조건에 맞는 식당이 없습니다.");
      }

    } catch (e) {
      console.error("Filter Error:", e);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={style.mapContainer}>
      <div className={style.topBar}>
        <span className={style.button} onClick={() => setActiveModal("food")}>음식분류</span>
        <span className={style.button} onClick={() => setActiveModal("location")}>위치선택</span>
        <span className={style.button} onClick={() => setActiveModal("price")}>가격</span>
        <span className={style.button} onClick={() => setActiveModal("atmosphere")}>분위기</span>
      </div>

      <NaverMap restaurantIds={restaurantIds} />

      <button className={style.backButton} onClick={() => navigate(-1)}>
        <img
          src="/backstep_button.svg.png"
          alt="Back"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </button>

      {activeModal && (
        <FilterModal
          type={activeModal}
          onClose={() => setActiveModal(null)}
          onApply={applyFilters}
          currentValues={{
            regionId: selectedRegionId,
            foodIds: selectedFoodIds,
            atmoIds: selectedAtmosphereIds,
            price: priceRange,
          }}
        />
      )}
    </div>
  );
}

interface FilterModalProps {
  type: FilterType;
  onClose: () => void;
  onApply: (r: number | null, f: number[], a: number[], p: { min: number; max: number } | null) => void;
  currentValues: {
    regionId: number | null;
    foodIds: number[];
    atmoIds: number[];
    price: { min: number; max: number } | null;
  };
}

function FilterModal({ type, onClose, onApply, currentValues }: FilterModalProps) {
  const [localRegion, setLocalRegion] = useState(currentValues.regionId);
  const [localFood, setLocalFood] = useState(currentValues.foodIds);
  const [localAtmo, setLocalAtmo] = useState(currentValues.atmoIds);
  const [localPrice, setLocalPrice] = useState(currentValues.price);

  const getTitle = () => {
    switch (type) {
      case "food": return "음식 분류 선택";
      case "location": return "위치 선택";
      case "price": return "가격 범위 설정";
      case "atmosphere": return "분위기 선택";
      default: return "";
    }
  };

  const handleApplyClick = () => {
    onApply(localRegion, localFood, localAtmo, localPrice);
  };

  const handleReset = () => {
    if (type === "food") setLocalFood([]);
    if (type === "location") setLocalRegion(null);
    if (type === "atmosphere") setLocalAtmo([]);
    if (type === "price") setLocalPrice(null);
  };

  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div className={style.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={style.modalHeader}>
          <h2 className={style.modalTitle}>{getTitle()}</h2>
          <button className={style.modalCloseBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={style.modalBody}>
          {type === "location" && <RegionContent selected={localRegion} onChange={setLocalRegion} />}
          {type === "food" && <FoodContent selected={localFood} onChange={setLocalFood} />}
          {type === "price" && <PriceContent selected={localPrice} onChange={setLocalPrice} />}
          {type === "atmosphere" && <AtmosphereContent selected={localAtmo} onChange={setLocalAtmo} />}
        </div>

        <div className={style.modalFooter}>
            <button className={style.resetBtn} onClick={handleReset}>초기화</button>
            <button className={style.applyBtn} onClick={handleApplyClick}>적용하기</button>
        </div>
      </div>
    </div>
  );
}


function RegionContent({ selected, onChange }: { selected: number | null, onChange: (id: number | null) => void }) {
  const [allRegions, setAllRegions] = useState<any[]>([]); // 전체 지역 데이터
  const [regions, setRegions] = useState<any[]>([]);       // 대분류(시/도)
  const [subRegions, setSubRegions] = useState<any[]>([]); // 소분류(구/군)
  const [activeParentId, setActiveParentId] = useState<number | null>(null);

  // 전체 지역 데이터 로드 (flatten=true)
  useEffect(() => {
    client.get("/regions", { params: { flatten: true } }).then(res => {
        const data = res.data;
        setAllRegions(data);
        
        // 대분류 필터링 (parent_id 없는 것)
        const roots = data.filter((r: any) => r.parent_id === null && !r.name.endsWith("전체"));
        setRegions(roots);
    }).catch(err => console.error("Region Load Error:", err));
  }, []);

  // 대분류 클릭 시 소분류 세팅
  const handleParentClick = (parentId: number) => {
    setActiveParentId(parentId);
    const subs = allRegions.filter((r: any) => r.parent_id === parentId);
    setSubRegions(subs);
  };

  // 해당 대분류가 선택되었거나, 그 하위 지역이 선택되었는지 확인
  const isParentSelected = (parentId: number) => {
    if (selected === parentId) return true;
    const child = allRegions.find(r => r.id === selected);
    if (child && child.parent_id === parentId) return true;
    return false;
  };

  // 현재 활성화된(보고 있는) 대분류의 이름 찾기
  const activeParentName = regions.find(r => r.id === activeParentId)?.name;

  return (
    <div>
      <div className={style.regionGrid}>
        {regions.map((r) => {
          const isSelected = isParentSelected(r.id);
          const isActive = activeParentId === r.id;

          return (
            <div 
              key={r.id} 
              className={`
                ${style.regionItem} 
                ${isActive ? style.active : ""} 
                ${isSelected ? style.hasSelection : ""} 
              `} 
              onClick={() => handleParentClick(r.id)}
            >
              {r.name}
            </div>
          );
        })}
      </div>
      
      {/* 소분류 영역 */}
      {(subRegions.length > 0 || activeParentId) && (
        <div className={style.subRegionGrid}>
          {/* 지역 대분류 전체 선택 버튼 */}
          {activeParentId && (
              <div 
                className={`${style.tagItem} ${selected === activeParentId ? style.selected : ""}`} 
                onClick={() => onChange(activeParentId)} // 대분류 ID를 그대로 선택
                style={{ 
                    fontWeight: 'bold', 
                    backgroundColor: selected === activeParentId ? '#8B0029' : '#fff0f5', 
                    borderColor: '#8B0029' 
                }}
              >
                #{activeParentName} 전체
              </div>
          )}

          {subRegions.map((sub: any) => (
            <div key={sub.id} className={`${style.tagItem} ${selected === sub.id ? style.selected : ""}`} onClick={() => onChange(selected === sub.id ? null : sub.id)}>
              {sub.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FoodContent({ selected, onChange }: { selected: number[], onChange: (ids: number[]) => void }) {
  const [allTags, setAllTags] = useState<any[]>([]); // 전체 태그
  const [categories, setCategories] = useState<any[]>([]); // 대분류
  const [foods, setFoods] = useState<any[]>([]); // 소분류
  const [activeCatId, setActiveCatId] = useState<number | null>(null);

  // 전체 태그 로드
  useEffect(() => {
    client.get("/tags", { params: { category_id: 1, flatten: true } }).then(res => {
        const data = res.data;
        setAllTags(data);
        
        // 대분류 필터링
        const roots = data.filter((t: any) => !t.parent_id);
        setCategories(roots);
    }).catch(console.error);
  }, []);

  const handleCatClick = (id: number) => {
    setActiveCatId(id);
    const subs = allTags.filter((t: any) => t.parent_id === id);
    setFoods(subs);
  };

  const toggleId = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter((i) => i !== id));
    else onChange([...selected, id]);
  };

  const activeCatName = categories.find(c => c.id === activeCatId)?.name;

  // 해당 카테고리가 선택되었거나, 하위 태그가 하나라도 선택되었는지 확인
  const isCategorySelected = (catId: number) => {
    // 1. 대분류 자체(전체)가 선택된 경우
    if (selected.includes(catId)) return true;
    
    // 2. 자식 태그 중 하나라도 선택된 경우
    const hasChildSelected = allTags.some(t => t.parent_id === catId && selected.includes(t.id));
    return hasChildSelected;
  };

  return (
    <div>
      <div className={style.foodCatGrid}>
        {categories.map((c) => {
            const isSelected = isCategorySelected(c.id);
            const isActive = activeCatId === c.id;

            return (
              <div 
                key={c.id} 
                className={`
                    ${style.tagItem} 
                    ${isActive ? style.active : ""}
                    ${isSelected ? style.hasSelection : ""}
                `} 
                // 활성화상태일 때만 텍스트 스타일 적용, 선택된 상태면 배경색 변경 
                style={isActive ? {borderColor: '#8B0029', color:'#8B0029', fontWeight:'bold'} : {}}
                onClick={() => handleCatClick(c.id)}
              >
                {c.name}
              </div>
            );
        })}
      </div>
      
      {(foods.length > 0 || activeCatId) && (
        <div className={style.subRegionGrid}>
          {activeCatId && (
              <div 
                className={`${style.tagItem} ${selected.includes(activeCatId) ? style.selected : ""}`} 
                onClick={() => toggleId(activeCatId)}
                style={{ fontWeight: 'bold', backgroundColor: selected.includes(activeCatId) ? '#8B0029' : '#fff0f5', borderColor: '#8B0029' }}
              >
                #{activeCatName} 전체
              </div>
          )}

          {foods.map((f) => (
            <div key={f.id} className={`${style.tagItem} ${selected.includes(f.id) ? style.selected : ""}`} onClick={() => toggleId(f.id)}>
              {f.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function AtmosphereContent({ selected, onChange }: { selected: number[], onChange: (ids: number[]) => void }) {
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    client.get("/tags", { params: { category_id: 2 } }).then(res => setTags(res.data)).catch(console.error);
  }, []);

  const toggleId = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter((i) => i !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className={style.tagGrid}>
      {tags.map((t) => (
        <div key={t.id} className={`${style.tagItem} ${selected.includes(t.id) ? style.selected : ""}`} onClick={() => toggleId(t.id)}>
          {t.name}
        </div>
      ))}
    </div>
  );
}


function PriceContent({ selected, onChange }: { selected: { min: number; max: number } | null, onChange: (val: { min: number; max: number }) => void }) {
  const PRICE_MIN = 1000;
  const PRICE_MAX = 500000;
  const POS_MIN = 0;
  const POS_MAX = 1000;
  const LOG_MIN = Math.log(PRICE_MIN);
  const LOG_MAX = Math.log(PRICE_MAX);
  const STEP_VALUE = 1000;
  const MAJOR_TICKS = [1000, 10000, 100000, 500000];

  const [minVal, setMinVal] = useState(selected ? selected.min : PRICE_MIN);
  const [maxVal, setMaxVal] = useState(selected ? selected.max : PRICE_MAX);

  const posToValue = (pos: number) => {
    const t = (pos - POS_MIN) / (POS_MAX - POS_MIN);
    const raw = Math.exp(LOG_MIN + t * (LOG_MAX - LOG_MIN));
    const stepped = Math.round(raw / STEP_VALUE) * STEP_VALUE;
    return Math.min(PRICE_MAX, Math.max(PRICE_MIN, stepped));
  };

  const valueToPos = (value: number) => {
    const v = Math.min(PRICE_MAX, Math.max(PRICE_MIN, value));
    const t = (Math.log(v) - LOG_MIN) / (LOG_MAX - LOG_MIN);
    return Math.round(POS_MIN + t * (POS_MAX - POS_MIN));
  };

  const tickLeftPct = (value: number) => {
    const pos = valueToPos(value);
    return (pos / POS_MAX) * 100;
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = posToValue(Number(e.target.value));
    if (nextVal < maxVal) {
        setMinVal(nextVal);
        onChange({ min: nextVal, max: maxVal });
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = posToValue(Number(e.target.value));
    if (nextVal > minVal) {
        setMaxVal(nextVal);
        onChange({ min: minVal, max: nextVal });
    }
  };

  const minPos = valueToPos(minVal);
  const maxPos = valueToPos(maxVal);
  const minPct = (minPos / POS_MAX) * 100;
  const maxPct = (maxPos / POS_MAX) * 100;
  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className={style.Price__container}>
      <div className={style.Price__rangeGraphic}>
        <div className={style.Price__track} />
        <div className={style.Price__rangeFill} style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }} />
        
        <input type="range" min={POS_MIN} max={POS_MAX} step={1} value={minPos} onChange={handleMinChange} className={style.Price__range} />
        <input type="range" min={POS_MIN} max={POS_MAX} step={1} value={maxPos} onChange={handleMaxChange} className={style.Price__range2} />
      </div>

      <div className={style.Price__ticksLine}>
        {MAJOR_TICKS.map((v) => (
          <div key={v} className={style.Price__tickMajorWrap} style={{ left: `${tickLeftPct(v)}%` }}>
            <div className={style.Price__tickBar} />
            <span className={style.Price__tickLabel}>{fmt(v)}</span>
          </div>
        ))}
      </div>

      <div className={style.Price__inputs}>
        <div className={style.Price__input}>{fmt(minVal)}원</div>
        <span>~</span>
        <div className={style.Price__input}>{fmt(maxVal)}원</div>
      </div>
    </div>
  );
}