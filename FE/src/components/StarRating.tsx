import { useState } from "react";

type Props = {
  value: number;
  onChange: (v: number) => void;
};

export default function StarRating({ value, onChange }: Props) {
  const handleClick = (
    e: React.MouseEvent<HTMLSpanElement>,
    index: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = rect.width / 2;

    const score = x < half ? index + 0.5 : index + 1;
    onChange(score);
  };

  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = value >= i + 1;
        const half = value === i + 0.5;

        return (
          <span
            key={i}
            onClick={(e) => handleClick(e, i)}
            style={{
              cursor: "pointer",
              fontSize: "24px",
              color: "#8B0029",  // 크림슨
              position: "relative",
            }}
          >
            {/* 배경 별 */}
            ☆

            {/* 꽉 찬 별 */}
            {filled && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                }}
              >
                ★
              </span>
            )}

            {/* 반 별 */}
            {half && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "50%",
                  overflow: "hidden",
                }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}