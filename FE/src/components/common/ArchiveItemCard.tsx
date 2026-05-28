import styles from "./ArchiveItemCard.module.css";
import { useKurchiveI18n } from "../../i18n/LocaleContext";

type ArchiveItemCardProps = {
  title: string;
  description?: string;
  metaLabel?: string;
  rating?: number | null;
  dateText?: string;
  imageLabel: string;
  thumbnailUrl?: string | null;
  onClick: () => void;
  onDelete?: () => void;
};

function RatingStars({ rating }: { rating: number }) {
  const { messages } = useKurchiveI18n();

  return (
    <span
      className={styles.stars}
      aria-label={`${messages.archiveCommon.rating} ${rating.toFixed(1)}`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? styles.star : styles.starEmpty}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function ArchiveItemCard({
  title,
  description,
  metaLabel,
  rating,
  dateText,
  imageLabel,
  thumbnailUrl,
  onClick,
  onDelete,
}: ArchiveItemCardProps) {
  const { messages } = useKurchiveI18n();
  const displayRating = typeof rating === "number" ? rating : null;

  return (
    <div
      className={styles.card}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") onClick();
      }}
    >
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        {description ? <p className={styles.description}>{description}</p> : null}

        {metaLabel ? (
          <div className={styles.metaRow}>
            <span className={styles.metaDot} />
            <span>{metaLabel}</span>
          </div>
        ) : null}

        {(displayRating != null || dateText) && (
          <div className={styles.bottomRow}>
            {displayRating != null ? (
              <>
                <RatingStars rating={displayRating} />
                <span className={styles.score}>{displayRating.toFixed(1)}</span>
              </>
            ) : null}
            {dateText ? <span className={styles.dateText}>{dateText}</span> : null}
          </div>
        )}
      </div>

      <div
        className={styles.image}
        style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
      >
        {onDelete ? (
          <button
            className={styles.deleteButton}
            type="button"
            aria-label={messages.archiveCommon.removeItem.replace("{title}", title)}
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
          >
            ×
          </button>
        ) : null}

        {!thumbnailUrl ? <span className={styles.imageText}>{imageLabel}</span> : null}
      </div>
    </div>
  );
}
