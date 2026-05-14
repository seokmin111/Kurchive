import { ChangeEvent, useMemo, useState } from "react";
import styles from "../page.module.css";
import { SelectedItem } from "./types";

type Props = {
  onAddItem: (item: SelectedItem) => void;
};

const RATING_OPTIONS = [0.0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

const formatRating = (rating: number) =>
  Number.isInteger(rating) ? rating.toFixed(1) : String(rating);

export default function RatingSelector({ onAddItem }: Props) {
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);

  const selectedRating = useMemo<SelectedItem>(
    () => ({
      type: "rating",
      id: null,
      name: `${formatRating(minRating)}~${formatRating(maxRating)}`,
      ratingMin: minRating,
      ratingMax: maxRating,
    }),
    [minRating, maxRating]
  );

  const onMinChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(e.target.value);
    setMinRating(next);
    if (next > maxRating) setMaxRating(next);
  };

  const onMaxChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(e.target.value);
    setMaxRating(next);
    if (next < minRating) setMinRating(next);
  };

  return (
    <div className={styles.Rating__container}>
      <div className={styles.section_title}>별점</div>
      <div className={styles.Rating__contents}>
        <label className={styles.Rating__field}>
          <span className={styles.Rating__star}>★</span>
          <select
            className={styles.Rating__select}
            value={minRating}
            onChange={onMinChange}
          >
            {RATING_OPTIONS.map((rating) => (
              <option key={`min-${rating}`} value={rating}>
                {formatRating(rating)}
              </option>
            ))}
          </select>
          <span>이상</span>
        </label>

        <span className={styles.Rating__separator}>~</span>

        <label className={styles.Rating__field}>
          <span className={styles.Rating__star}>★</span>
          <select
            className={styles.Rating__select}
            value={maxRating}
            onChange={onMaxChange}
          >
            {RATING_OPTIONS.map((rating) => (
              <option key={`max-${rating}`} value={rating}>
                {formatRating(rating)}
              </option>
            ))}
          </select>
          <span>이하</span>
        </label>

        <button
          className={styles.Rating__submit}
          type="button"
          onClick={() => onAddItem(selectedRating)}
        >
          적용
        </button>
      </div>
    </div>
  );
}
