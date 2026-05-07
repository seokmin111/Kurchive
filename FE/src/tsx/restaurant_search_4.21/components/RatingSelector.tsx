import styles from "../page.module.css";
import { SelectedItem } from "./types";

type Props = {
  onAddItem: (item: SelectedItem) => void;
};

const RATING_OPTIONS = [3, 3.5, 4, 4.5];

const formatRating = (rating: number) =>
  Number.isInteger(rating) ? rating.toFixed(1) : String(rating);

export default function RatingSelector({ onAddItem }: Props) {
  return (
    <div className={styles.Rating__container}>
      <div className={styles.section_title}>별점</div>
      <div className={styles.Rating__contents}>
        {RATING_OPTIONS.map((rating) => (
          <button
            key={rating}
            className={styles.Rating__option}
            type="button"
            onClick={() =>
              onAddItem({
                type: "rating",
                id: rating * 10,
                name: `★ ${formatRating(rating)} 이상`,
                ratingMin: rating,
              })
            }
          >
            <span className={styles.Rating__star}>★</span>
            <span>{formatRating(rating)} 이상</span>
          </button>
        ))}
      </div>
    </div>
  );
}
