"use client";
import { useState } from "react";
import style from "./searchBar.module.css";
import { Menu, Search, MoreVertical } from "lucide-react";
export default function SearchBar({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input);
    }
  };

  return (
    <div className={style.searchBar}>
      <Menu
        onClick={() => {
          setMenuOpen(!isMenuOpen);
        }}
      ></Menu>

      <form style={{ flexGrow: "1" }} onSubmit={handleSubmit}>
        <input
          className={style.search}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>

      <Search
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (input.trim()) {
            onSearch(input);
          }
        }}
      ></Search>
      <MoreVertical></MoreVertical>
    </div>
  );
}
