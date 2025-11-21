"use client";

import { useState } from "react";
import style from "./page.module.css";
import SearchBar from "./components/searchBar";
import ResultBox from "./components/ResultBox";

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    setKeyword(query);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/recipe/search?title=${query}`
    );
    if (!res.ok) {
      console.error("API Error:", res.status);
      return;
    }
    const data = await res.json();
    setResults(data);
  };

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
        {results.map((recipe) => (
          <ResultBox
            key={recipe.id}
            id={recipe.id}
            title={recipe.title}
            uploader_id={recipe.uploader_id}
            created_at={recipe.created_at}
            thumbnail_url={recipe.thumbnail_url}
          />
        ))}
      </div>
    </div>
  );
}
