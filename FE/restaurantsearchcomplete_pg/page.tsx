"use client";

import { useState } from "react";
import style from "./page.module.css";
import SearchBar from "./components/searchBar";
import ResultBox from "./components/resultBox";
import MapButton from "./components/mapbutton";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    setKeyword(query);
    const token = localStorage.getItem("access_token"); // 로그인 시 저장한 토큰
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/restaurants/search?q=${query}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) {
      console.error("API Error:", res.status);
      return;
    }
    const data = await res.json();
    setResults(data);
  };

  const restaurantIds = results.map((restaurant) => restaurant.id);

  return (
    <div className={style.container}>
      <SearchBar onSearch={handleSearch} />
      <div
        style={{
          color: "#8B0029",
          marginBottom: "10px",
          marginLeft: "75px",
          marginTop: "60px",
        }}
      >
        검색결과
      </div>

      <div
        style={{
          height: "550px",
          overflowY: "auto",
          scrollbarWidth: "none", // Firefox용
          msOverflowStyle: "none", // IE/Edge용
        }}
      >
        {results.map((restaurant) => (
          <ResultBox
            key={restaurant.id}
            id={restaurant.id}
            name={restaurant.name}
            summary={restaurant.summary}
            address={restaurant.address}
            region_id={restaurant.region_id}
            rating={restaurant.rating}
            price_max={restaurant.price_max}
            price_min={restaurant.price_min}
            tags={restaurant.tags}
            thumbnail_url={restaurant.thumbnail_url}
          />
        ))}
      </div>
      <MapButton restaurantIds={restaurantIds} />
    </div>
  );
}
