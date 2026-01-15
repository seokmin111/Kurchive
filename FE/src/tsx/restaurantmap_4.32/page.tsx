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
      setSelectedRegionId(newRegionId);
      setSelectedFoodIds(newFoodIds);
      setSelectedAtmosphereIds(newAtmoIds);
      setPriceRange(newPrice);

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
      
      const res = await client.get("/restaurants", { params });
      const results = res.data;

      if (results && Array.isArray(results) && results.length > 0) {
        const newIds = results.map((r: any) => r.id);
        setRestaurantIds(newIds);
      } else {
        setRestaurantIds([]);
        alert("조건에 맞는 식당이 없습니다.");
      }

      setActiveModal(null);
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

      {/* NaverMap 컴포넌트에 현재 로드된 식당 ID 목록 전달 */}
      <NaverMap restaurantIds={restaurantIds} />

      <button className={style.backButton} onClick={() => navigate(-1)}>
        <img
          src="/../public/backstep_button.svg.png"
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
  const [regions, setRegions] = useState<any[]>([]);
  const [subRegions, setSubRegions] = useState<any[]>([]);
  const [parentName, setParentName] = useState<string>("");

  useEffect(() => {
    client.get("/regions").then(res => {
        const parents = res.data.filter((r: any) => r.parent_id === null && !r.name.endsWith("전체"));
        setRegions(parents);
    }).catch(err => console.error("Region Load Error:", err));
  }, []);

  const handleParentClick = async (r: any) => {
    setParentName(r.name);
    try {
        const res = await client.get("/regions", { params: { parent_id: r.id } });
        setSubRegions(res.data);
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className={style.regionGrid}>
        {regions.map((r) => (
          <div key={r.id} className={`${style.regionItem} ${parentName === r.name ? style.active : ""}`} onClick={() => handleParentClick(r)}>
            {r.name}
          </div>
        ))}
      </div>
      {subRegions.length > 0 && (
        <div className={style.subRegionGrid}>
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
  const [categories, setCategories] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);
  const [activeCatId, setActiveCatId] = useState<number | null>(null);

  useEffect(() => {
    client.get("/tags", { params: { category_id: 1 } }).then(res => {
        const roots = res.data.filter((t: any) => !t.parent_id);
        setCategories(roots);
    }).catch(console.error);
  }, []);

  const handleCatClick = async (id: number) => {
    setActiveCatId(id);
    const res = await client.get("/tags", { params: { parent_id: id } });
    setFoods(res.data);
  };

  const toggleId = (id: number) => {
    if (selected.includes(id)) onChange(selected.filter((i) => i !== id));
    else onChange([...selected, id]);
  };

  // 현재 활성화된 카테고리의 이름 찾기
  const activeCatName = categories.find(c => c.id === activeCatId)?.name;

  return (
    <div>
      <div className={style.foodCatGrid}>
        {categories.map((c) => (
          <div key={c.id} className={`${style.tagItem} ${activeCatId === c.id ? style.active : ""}`} 
             style={activeCatId === c.id ? {borderColor: '#8B0029', color:'#8B0029', fontWeight:'bold'} : {}}
             onClick={() => handleCatClick(c.id)}>
            {c.name}
          </div>
        ))}
      </div>
      
      {/* 소분류 태그 리스트 영역 */}
      {(foods.length > 0 || activeCatId) && (
        <div className={style.subRegionGrid}>
          {/* 대분류만 선택해도 검색 가능하게  */}
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