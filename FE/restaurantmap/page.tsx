"use client";

import NaverMap from "./components/Navermap";
import style from "./page.module.css";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
export default function Map() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [restaurantIds, setRestaurantIds] = useState<number[]>([]);

  useEffect(() => {
    const idsString = searchParams.get("ids");

    if (idsString) {
      const idsArray = idsString
        .split(",")
        .map((id) => {
          const num = parseInt(id.trim(), 10);

          return isNaN(num) ? null : num;
        })
        .filter((id): id is number => id !== null);

      setRestaurantIds(idsArray);
    } else {
      setRestaurantIds([]);
    }
  }, [searchParams]);

  return (
    <div className={style.mapContainer}>
      <div className={style.topBar}>
        <span className={style.button}>음식분류</span>
        <span className={style.button}>위치선택</span>
        <span className={style.button}>가격</span>
        <span className={style.button}>분위기</span>
      </div>

      <NaverMap restaurantIds={restaurantIds} />
      <button
        className={style.backButton}
        onClick={() => {
          router.back();
        }}
      >
        <span>
          <Image
            src="/backstep_button.svg.png"
            alt="뒤로가기"
            fill
            style={{ objectFit: "contain" }}
          />
        </span>
      </button>
    </div>
  );
}
