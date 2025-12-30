//식당 검색 페이지

"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp } from "@fortawesome/free-solid-svg-icons/faChevronUp";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const API_BASE = "http://152.69.228.114:8000/api";

export default function SearchPage() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]); // 백엔드가 객체 배열로 내려줌
  const [isTagSearchOpen, setIsTagSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
  }, []);

  // 자동완성: /api/search-suggestions (없음) -> /api/restaurants/search (존재)
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
        console.log("debounced call start:", query);
      try {
        const token = localStorage.getItem("access_token");

        const res = await axios.get(`${API_BASE}/restaurants/search`, {
          params: { q: query },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        // res.data = [{id,name,...}, ...]
        setSuggestions(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        if (err?.response?.status === 401) {
            setSuggestions([]);
            return;
        }
        console.error(err);
        setSuggestions([]);
        }

    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // 검색 실행: 결과 페이지로 이동 (결과 페이지에서 q로 다시 호출하면 됨)
  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    navigate(`/restaurant/search/results?q=${encodeURIComponent(q)}`);
  };

  return (
    <main className={styles.nomrg}>
      <div className={styles.nav_carrier}>
        <Link to="/restaurant">
          <button className={styles.back_btn}>&lt;</button>
        </Link>
        <br />
        <h1 className={styles.title} style={{ display: "inline" }}>
          커카이브
        </h1>
        <p className={styles.sub_title} style={{ display: "inline" }}>
          우리만의 미식 지도
        </p>
      </div>

      <div
        className={styles.search_container}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            (document.activeElement as HTMLElement)?.blur();
          }
        }}
      >
        <input
        className={styles.input_box}
        type="text"
        value={query}
        onChange={(e) => {
            console.log("typing:", e.target.value);
            setQuery(e.target.value);
        }}
        placeholder="식당 정보를 입력해주세요."
        />


        <button type="button" className={styles.search_btn} onClick={handleSearch}>
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>

        {/* 자동완성 리스트 (식당명 표시 + 클릭 시 이동) */}
        {suggestions.length > 0 && (
          <ul className={styles.suggestion_list}>
            {suggestions.map((item: any) => (
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

      {/* 항상 보이는 하단 하얀 박스(핸들) */}
      {!isTagSearchOpen && (
        <div
          className={styles.tagSearchHandle}
          onClick={() => setIsTagSearchOpen(true)}
        >
          <div className={styles.tagSearchHandle__chevron}>
            <div><FontAwesomeIcon icon={faChevronUp} /></div>
            <div><FontAwesomeIcon icon={faChevronUp} /></div>
          </div>
          <div className={styles.tagSearchHandle__text}>태그로 검색하기</div>
        </div>
      )}


      <TagSearch isTagSearchOpen={isTagSearchOpen} setIsTagSearchOpen={setIsTagSearchOpen} />

    </main>
  );
}

interface IsTagSearchOpenProps {
  isTagSearchOpen: boolean;
  setIsTagSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

//sellectedTags에 들어갈 아이템의 type
type SelectedItem = {
  type: "region" | "tag" | "price";
  id: number | null;
  name: string;
  priceMin?: number;
  priceMax?: number;
};

//태그로 검색하기 누르면 올라오는 Modal
function TagSearch({ isTagSearchOpen, setIsTagSearchOpen }: IsTagSearchOpenProps) {
  const navigate = useNavigate();
  const tags: string[] = ["지역", "음식 종류", "가격", "분위기"];
  const [activeTag, setActiveTag] = useState<string>("");
  const [sellectedTags, setSellectedTags] = useState<SelectedItem[]>([]);
  const [PriceRange, setPriceRange] = useState({ min: 1000, max: 500000 });
  const scrollRef = useRef<HTMLDivElement>(null);

  //sellectedTags에 아이템 추가하는 함수
  const handleAddItem = (item: SelectedItem) => {
    if (item.type === "region" || item.type === "tag") {
      const exists = sellectedTags.some((t) => t.id === item.id && t.type === item.type);
      if (!exists) setSellectedTags(sellectedTags.concat(item));
    } else if (item.type === "price") {
      let copy = sellectedTags.filter((t) => t.type !== "price");
      copy = copy.concat(item);
      setSellectedTags(copy);
    }
  };

  //상위 태그 누르면 해당 위치로 이동하는 함수
  const handleScroll = () => {
    const content = scrollRef.current;
    if (!content) return;

    if (activeTag === "지역") {
      content.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } else if (activeTag === "음식 종류") {
      content.scrollTo({ top: 540, left: 0, behavior: "smooth" });
    } else if (activeTag === "가격") {
      content.scrollTo({ top: 1070, left: 0, behavior: "smooth" });
    } else if (activeTag === "분위기") {
      content.scrollTo({ top: 1630, left: 0, behavior: "smooth" });
    }
  };

  //sellectedTags에 아이템 삭제하는 함수
  const handleDeleteItem = (item: SelectedItem) => {
    setSellectedTags(sellectedTags.filter((e) => e !== item));
  };

  //trashcan 누르면 전부 삭제하는 함수
  const deleteAll = () => {
    setSellectedTags([]);
    setPriceRange({ min: 1000, max: 500000 });
  };

  //최종 주소
  const [address, setAddress] = useState<string>(`${API_BASE}/restaurants?`);

  //최종 주소 만드는 함수
  const handleCreateAddress = () => {
    let copy = `${API_BASE}/restaurants?`;

    // tag_ids는 백엔드가 "1,2,3" 형태를 기대하므로 모아서 한번에 넣는게 좋음
    const tagIds: number[] = [];
    let regionId: number | null = null;
    let priceMin: number | undefined;
    let priceMax: number | undefined;

    for (let i = 0; i < sellectedTags.length; i++) {
      const it = sellectedTags[i];
      if (it.type === "region") regionId = it.id;
      if (it.type === "tag" && typeof it.id === "number") tagIds.push(it.id);
      if (it.type === "price") {
        priceMin = it.priceMin;
        priceMax = it.priceMax;
      }
    }

    if (regionId) copy += `region_id=${regionId}&`;
    if (tagIds.length) copy += `tag_ids=${tagIds.join(",")}&`;
    if (priceMin != null) copy += `price_min=${priceMin}&`;
    if (priceMax != null) copy += `price_max=${priceMax}&`;

    if (copy.endsWith("&")) copy = copy.slice(0, -1);
    setAddress(copy);
  };

  // 적용하기 버튼: 주소 생성 -> 결과 페이지로 이동(결과 페이지에서 이 쿼리스트링으로 호출)
  const handleApply = () => {
    handleCreateAddress();

    // address state는 비동기라, 여기서 바로 만들고 이동하는게 안전
    const params = new URLSearchParams();

    const tagIds: number[] = [];
    let regionId: number | null = null;
    let priceMin: number | undefined;
    let priceMax: number | undefined;

    for (const it of sellectedTags) {
      if (it.type === "region") regionId = it.id;
      if (it.type === "tag" && typeof it.id === "number") tagIds.push(it.id);
      if (it.type === "price") {
        priceMin = it.priceMin;
        priceMax = it.priceMax;
      }
    }

    if (regionId) params.set("region_id", String(regionId));
    if (tagIds.length) params.set("tag_ids", tagIds.join(","));
    if (priceMin != null) params.set("price_min", String(priceMin));
    if (priceMax != null) params.set("price_max", String(priceMax));

  

    navigate(`/restaurant/search/results?${params.toString()}`);

  };

  useEffect(() => handleScroll(), [activeTag]);
  useEffect(() => {
    // 디버깅 로그 필요하면 사용
    // console.log(PriceRange);
  }, [PriceRange]);
  useEffect(() => {
    // console.log(address);
  }, [address]);

  return (
    <div className="tagSearch">
      <div className={styles.tagSearch__chevron}>
        <div>
          <FontAwesomeIcon icon={faChevronUp} />
        </div>
        <div>
          <FontAwesomeIcon icon={faChevronUp} />
        </div>
      </div>

      <div className={`${styles.tagSearchContainer} ${isTagSearchOpen ? styles.show : ""}`}>
        <h6
          className={styles.tagSearch__title}
          onClick={() => setIsTagSearchOpen((prev) => !prev)}
        >
          태그로 검색하기
        </h6>

        <div className={styles.tagSearch__tags}>
          {tags.map((a) => {
            return (
              <div
                key={a}
                onClick={() => setActiveTag(a)}
                className={`${styles.tagSearch__tag} ${activeTag === a ? styles.red : ""}`}
              >
                <div>{a}</div>
              </div>
            );
          })}
        </div>

        <div className={styles.tagSearch__bar}></div>

        <div ref={scrollRef} className={styles.scrollableContent}>
          <Region handleAddItem={handleAddItem} />
          <Culture handleAddItem={handleAddItem} />
          <Price
            handleAddItem={handleAddItem}
            sellectedTags={sellectedTags}
            setSellectedTags={setSellectedTags}
          />
          <Atmosphere handleAddItem={handleAddItem} />
        </div>

        <div className={styles.tagSearch__bar}></div>
        <div className={styles.tagSearch__submit}>
          <div className={styles.tagSearch__iconAndTags}>
            <div className={styles.tagSearch__trashcan} onClick={deleteAll}>
              <FontAwesomeIcon icon={faTrashCan} />
            </div>

            {sellectedTags.map((item, idx) => {
              return (
                <div key={`${item.type}-${item.id}-${idx}`} className={styles.tagSearch__selectedTag}>
                  {item.name}
                  <span className={styles.tagSearch__tagDel} onClick={() => handleDeleteItem(item)}>
                    <FontAwesomeIcon icon={faXmark} />
                  </span>
                </div>
              );
            })}
          </div>

          <div className={styles.tagSearch__submitBtns}>
            <button className={styles.tagSearch__apply} type="button" onClick={handleApply}>
              <span>적용하기</span>
            </button>
            <button
              className={styles.tagSearch__close}
              type="button"
              onClick={() => setIsTagSearchOpen(false)}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RegionItem {
  id: number;
  name: string;
  parent_id: string;
  depth: string;
}

interface HandleSellectedTagsType {
  handleAddItem: (item: SelectedItem) => void;
}

//상위 지역 Modal
function Region({ handleAddItem }: HandleSellectedTagsType) {
  const [showSpecificRegions, setShowSpecificRegions] = useState(false);
  const [upperRegions, setUpperRegions] = useState<any[]>([]);
  const [regionName, setRegionName] = useState<string>("");

  const handleGetUpperRegions = async () => {
    const token = localStorage.getItem("access_token");
    const res = await axios.get(`${API_BASE}/regions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    setUpperRegions(res.data);
  };

  useEffect(() => {
    handleGetUpperRegions().catch(console.error);
  }, []);

  return (
    <div className={styles.tagSearch__body}>
      <div className={styles.tagSearch__regions}>
        {upperRegions.length !== 0
          ? upperRegions.map((item) => {
              return (
                <span
                  key={item.id}
                  onClick={() => {
                    setRegionName(item.name);
                    setShowSpecificRegions(true);
                  }}
                  className={`${regionName === item.name ? styles.redBorder : ""}`}
                >
                  {item.name}
                </span>
              );
            })
          : null}
      </div>

      {showSpecificRegions && (
        <SpecificRegion handleAddItem={handleAddItem} regionName={regionName} upperRegions={upperRegions} />
      )}
    </div>
  );
}

interface SpecificRegionProps {
  regionName: string;
  upperRegions: any[];
  handleAddItem: (item: SelectedItem) => void;
}

//상세 지역 modal
function SpecificRegion({ regionName, handleAddItem, upperRegions }: SpecificRegionProps) {
  const [smallRegions, setSmallRegions] = useState<RegionItem[] | null>(null);
  const [smallRegionID, setSmallRegionID] = useState<number>(-1);

  const handleSetRegionID = () => {
    for (let i = 0; i < upperRegions.length; i++) {
      if (upperRegions[i].name === regionName) {
        setSmallRegionID(upperRegions[i].id);
      }
    }
  };

  const getRegion = async () => {
    const token = localStorage.getItem("access_token");
    const res = await axios.get(`${API_BASE}/regions`, {
      params: { parent_id: smallRegionID },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    setSmallRegions(res.data);
  };

  useEffect(() => {
    handleSetRegionID();
  }, [regionName]);

  useEffect(() => {
    if (smallRegionID !== -1) getRegion().catch(console.error);
  }, [smallRegionID]);

  if (smallRegions != null) {
    return (
      <div className={styles.specificRegions}>
        {smallRegions.map((reg: any) => (
          <div key={reg.id} onClick={() => handleAddItem({ type: "region", id: reg.id, name: reg.name })}>
            {reg.name}
          </div>
        ))}
      </div>
    );
  } else {
    return <div className={styles.specificRegions}>로딩중</div>;
  }
}

interface ModalType {
  handleAddItem: (item: SelectedItem) => void;
}

//문화권 modal
function Culture({ handleAddItem }: ModalType) {
  const [bigCultureTags, setBigCultureTags] = useState<any[]>([]);
  const [sellectedBigTag, setSellectedBigTag] = useState<number>(0);

  const [smallCultureTags, setSmallCultureTags] = useState<any[]>([]);

  const getBigCultureTags = async () => {
    const token = localStorage.getItem("access_token");
    const res = await axios.get(`${API_BASE}/tags`, {
      params: { category_id: 1 },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    setBigCultureTags(res.data);
  };

  const getSmallCultureTags = async () => {
    if (!sellectedBigTag) return;
    const token = localStorage.getItem("access_token");
    const res = await axios.get(`${API_BASE}/tags`, {
      params: { category_id: 1, parent_id: sellectedBigTag },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    setSmallCultureTags(res.data);
  };

  useEffect(() => {
    getBigCultureTags().catch(console.error);
  }, []);

  useEffect(() => {
    getSmallCultureTags().catch(console.error);
  }, [sellectedBigTag]);

  return (
    <div className={styles.Food__container}>
      <img className={styles.Food__mapImg} src="../images/지도.png" />
      <div className={styles.Food__tagContainer}>
        {bigCultureTags.map((item) => {
          return (
            <span
              key={item.id}
              className={styles.Food__tag}
              onClick={() => {
                handleAddItem({ type: "tag", id: item.id, name: item.name });
                setSellectedBigTag(item.id);
              }}
            >
              {item.name}
            </span>
          );
        })}
      </div>

      <div className={styles.Food__foodTags}>
        {smallCultureTags.map((item) => {
          return (
            <div key={item.id} onClick={() => handleAddItem({ type: "tag", id: item.id, name: item.name })}>
              {item.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

//Price 모듈에서 tagSearch로 min price, max price 보내기 위한 타입 선언
interface PriceLimitType {
  handleAddItem: (item: SelectedItem) => void;
  sellectedTags: SelectedItem[];
  setSellectedTags: React.Dispatch<React.SetStateAction<SelectedItem[]>>;
}

//가격 Modal
//가격 Modal (LOG SCALE)
function Price({ handleAddItem }: PriceLimitType) {
  // ====== 실제 가격 범위 ======
  const PRICE_MIN = 1000;
  const PRICE_MAX = 500000;

  // ====== UI 슬라이더는 "포지션"으로 움직이기 (선형) ======
  // 값 범위가 클 때 부드럽게 하려면 0~1000 정도가 적당
  const POS_MIN = 0;
  const POS_MAX = 1000;

  // 실제 가격 step / 최소 간격(항상 min < max)
  const STEP_VALUE = 1000;     // 가격 스텝(원)
  const MIN_GAP_VALUE = 1000;  // 최소 간격(원) - 0이면 같아질 수 있어 UX 별로라 1000 추천

  // 라벨 tick (원하는 대로 바꿔도 됨)
  const MAJOR_TICKS = [1000, 10000, 100000, 500000]; // 숫자 표시
  const MINOR_TICKS = [2000, 3000, 4000, 5000, 7000, 20000, 30000, 40000, 50000, 200000, 300000, 400000]; // 막대만


  // ====== 로그 변환 준비 ======
  const LOG_MIN = Math.log(PRICE_MIN);
  const LOG_MAX = Math.log(PRICE_MAX);

  // pos(0~POS_MAX) -> 실제 가격(로그)
  const posToValue = (pos: number) => {
    const t = (pos - POS_MIN) / (POS_MAX - POS_MIN); // 0~1
    const raw = Math.exp(LOG_MIN + t * (LOG_MAX - LOG_MIN));
    const stepped = Math.round(raw / STEP_VALUE) * STEP_VALUE;
    return Math.min(PRICE_MAX, Math.max(PRICE_MIN, stepped));
  };

  // 실제 가격 -> pos(0~POS_MAX)
  const valueToPos = (value: number) => {
    const v = Math.min(PRICE_MAX, Math.max(PRICE_MIN, value));
    const t = (Math.log(v) - LOG_MIN) / (LOG_MAX - LOG_MIN); // 0~1
    return Math.round(POS_MIN + t * (POS_MAX - POS_MIN));
  };

  // ====== 상태는 "실제 가격"으로 관리(서버/필터용) ======
  const [minVal, setMinVal] = useState<number>(PRICE_MIN);
  const [maxVal, setMaxVal] = useState<number>(PRICE_MAX);

  const [minMaxPrice, setMinMaxPrice] = useState<SelectedItem>({
    type: "price",
    id: null,
    name: "default",
    priceMin: PRICE_MIN,
    priceMax: PRICE_MAX,
  });

  // 표시용(콤마)
  const fmt = (n: number) => n.toLocaleString("ko-KR");

  // ====== 드래그 핸들러(포지션 -> 값 변환 + clamp) ======
  const onMinPosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextPos = Number(e.target.value);
    const nextVal = posToValue(nextPos);
    // min은 max - gap 넘을 수 없음
    setMinVal(Math.min(nextVal, maxVal - MIN_GAP_VALUE));
  };

  const onMaxPosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextPos = Number(e.target.value);
    const nextVal = posToValue(nextPos);
    // max는 min + gap보다 작을 수 없음
    setMaxVal(Math.max(nextVal, minVal + MIN_GAP_VALUE));
  };

  // ====== 표시용 SelectedItem 업데이트 ======
  useEffect(() => {
    setMinMaxPrice({
      type: "price",
      id: null,
      name: `${fmt(minVal)}원 ~ ${fmt(maxVal)}원`,
      priceMin: minVal,
      priceMax: maxVal,
    });
  }, [minVal, maxVal]);

  const handleSubmitPrice = () => {
    const item: SelectedItem = {
      type: "price",
      id: null,
      name: `${fmt(minVal)}원 ~ ${fmt(maxVal)}원`,
      priceMin: minVal,
      priceMax: maxVal,
    };
    setMinMaxPrice(item);
    handleAddItem(item);
  };

  // ====== fill 바 계산(%): "pos 기준" ======
  const minPos = valueToPos(minVal);
  const maxPos = valueToPos(maxVal);
  const minPct = (minPos / POS_MAX) * 100;
  const maxPct = (maxPos / POS_MAX) * 100;

  // tick 위치(%): tick 값 -> pos -> %
  const tickLeftPct = (v: number) => (valueToPos(v) / POS_MAX) * 100;

  return (
    <div className={styles.Price__container}>
      <div className={styles.Price__contents}>
        <div className={styles.Price__rangeGraphic}>
          {/* 바닥 트랙 */}
          <div className={styles.Price__track} />

          {/* 선택 구간만 버건디 */}
          <div
            className={styles.Price__rangeFill}
            style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
          />

          {/* min thumb (빈 원) : value는 "pos" */}
          <input
            type="range"
            min={POS_MIN}
            max={POS_MAX}
            step={1}
            value={valueToPos(minVal)}
            onChange={onMinPosChange}
            className={`${styles.Price__range} ${styles.Price__min}`}
          />

          {/* max thumb (채운 원) : value는 "pos" */}
          <input
            type="range"
            min={POS_MIN}
            max={POS_MAX}
            step={1}
            value={valueToPos(maxVal)}
            onChange={onMaxPosChange}
            className={`${styles.Price__range2} ${styles.Price__max}`}
          />
        </div>

        {/* tick 라벨 (로그 스케일에 맞춰 위치 계산) */}
        <div className={styles.Price__ticksLine}>
        {/* minor: 막대만 */}
        {MINOR_TICKS.map((v) => (
          <div
            key={`m-${v}`}
            className={`${styles.Price__tickBar} ${styles.Price__tickMinor}`}
            style={{ left: `${tickLeftPct(v)}%` }}
          />
        ))}

        {/* major: 막대 + 숫자 */}
        {MAJOR_TICKS.map((v) => (
          <div
            key={`M-${v}`}
            className={styles.Price__tickMajorWrap}
            style={{ left: `${tickLeftPct(v)}%` }}
          >
            <div className={`${styles.Price__tickBar} ${styles.Price__tickMajor}`} />
            <div className={styles.Price__tickLabel}>{fmt(v)}</div>
          </div>
        ))}
      </div>



        <div>
          <div className={styles.Price__selfInput}>직접 입력</div>
          <input
            type="text"
            value={fmt(minVal)}
            className={styles.Price__input}
            readOnly
          />
          <span> ~ </span>
          <input
            type="text"
            value={fmt(maxVal)}
            className={styles.Price__input}
            readOnly
          />
          <button
            className={styles.Price__submit}
            type="button"
            onClick={handleSubmitPrice}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}


//분위기 Modal
function Atmosphere({ handleAddItem }: HandleSellectedTagsType) {
  const [atmoList, setAtmoList] = useState<any[]>([]);

  const getAtmoTags = async () => {
    const token = localStorage.getItem("access_token");
    const res = await axios.get(`${API_BASE}/tags`, {
      params: { category_id: 2 },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    setAtmoList(res.data);
  };

  useEffect(() => {
    getAtmoTags().catch(console.error);
  }, []);

  return (
    <div className={styles.atmo__carrier}>
      <div className={styles.atmo__container}>
        {atmoList.map((item) => {
          return (
            <div
              key={item.id}
              className={styles.atmo__item}
              onClick={() => handleAddItem({ type: "tag", id: item.id, name: item.name })}
            >
              {item.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
