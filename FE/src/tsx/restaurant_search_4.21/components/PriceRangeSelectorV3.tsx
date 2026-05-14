import { ChangeEvent, useMemo, useState } from "react";
import styles from "../page.module.css";
import { SelectedItem } from "./types";

type Props = {
  onAddItem: (item: SelectedItem) => void;
};

const PRICE_MIN = 1000;
const PRICE_MAX = 500000;
const POS_MIN = 0;
const POS_MAX = 1000;
const STEP_VALUE = 1000;
const MIN_GAP_VALUE = 1000;
const MAJOR_TICKS = [1000, 10000, 100000, 500000];
const MINOR_TICKS = [
  2000, 3000, 4000, 5000, 7000, 20000, 30000, 40000, 50000, 70000, 200000,
  300000, 400000,
];
const LOG_MIN = Math.log(PRICE_MIN);
const LOG_MAX = Math.log(PRICE_MAX);

const fmt = (n: number) => n.toLocaleString("ko-KR");

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

export default function PriceRangeSelectorV3({ onAddItem }: Props) {
  const [minVal, setMinVal] = useState(PRICE_MIN);
  const [maxVal, setMaxVal] = useState(PRICE_MAX);

  const minMaxPrice = useMemo<SelectedItem>(
    () => ({
      type: "price",
      id: null,
      name: `${fmt(minVal)}원 ~ ${fmt(maxVal)}원`,
      priceMin: minVal,
      priceMax: maxVal,
    }),
    [minVal, maxVal]
  );

  const onMinPosChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextVal = posToValue(Number(e.target.value));
    setMinVal(Math.min(nextVal, maxVal - MIN_GAP_VALUE));
  };

  const onMaxPosChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextVal = posToValue(Number(e.target.value));
    setMaxVal(Math.max(nextVal, minVal + MIN_GAP_VALUE));
  };

  const minPos = valueToPos(minVal);
  const maxPos = valueToPos(maxVal);
  const minPct = (minPos / POS_MAX) * 100;
  const maxPct = (maxPos / POS_MAX) * 100;
  const tickLeftPct = (value: number) => (valueToPos(value) / POS_MAX) * 100;

  return (
    <div className={styles.Price__container}>
      <div className={styles.section_title}>가격</div>
      <div className={styles.Price__contents}>
        <div className={styles.Price__rangeGraphic}>
          <div className={styles.Price__track} />
          <div
            className={styles.Price__rangeFill}
            style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
          />
          <input
            type="range"
            min={POS_MIN}
            max={POS_MAX}
            step={1}
            value={valueToPos(minVal)}
            onChange={onMinPosChange}
            className={`${styles.Price__range} ${styles.Price__min}`}
          />
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

        <div className={styles.Price__ticksLine}>
          {MINOR_TICKS.map((value) => (
            <div
              key={`m-${value}`}
              className={`${styles.Price__tickBar} ${styles.Price__tickMinor}`}
              style={{ left: `${tickLeftPct(value)}%` }}
            />
          ))}

          {MAJOR_TICKS.map((value) => (
            <div
              key={`M-${value}`}
              className={styles.Price__tickMajorWrap}
              style={{ left: `${tickLeftPct(value)}%` }}
            >
              <div className={`${styles.Price__tickBar} ${styles.Price__tickMajor}`} />
              <div className={styles.Price__tickLabel}>{fmt(value)}</div>
            </div>
          ))}
        </div>

        <div>
          <div className={styles.Price__selfInput}>직접 입력</div>
          <input type="text" value={fmt(minVal)} className={styles.Price__input} readOnly />
          <span className={styles.Price__separator}>~</span>
          <input type="text" value={fmt(maxVal)} className={styles.Price__input} readOnly />
          <button
            className={styles.Price__submit}
            type="button"
            onClick={() => onAddItem(minMaxPrice)}
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
}
