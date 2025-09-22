import { useState, useRef } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState<string>("");        // 검색어 상태
  const [isFocused, setIsFocused] = useState<boolean>(false); // 포커스 여부
  const inputRef = useRef<HTMLInputElement>(null);       // input 참조

    const suggestions: string[] = [
    "apple",
    "app",
    "application",
    "banana",
    "base",
  ]; // 예시 데이터

    return (
    <div
        className="p-4 min-h-screen bg-white"
        onClick={() => {
            setIsFocused(false);
            inputRef.current?.blur(); // 빈 공간 클릭 → 키보드 닫기
        }}
    >
    <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder="검색어를 입력하세요"
        className="border rounded p-2 w-full"
        onFocus={(e) => {
          e.stopPropagation(); // 부모 div의 onClick 막기
            setIsFocused(true);
        }}
        onChange={(e) => setQuery(e.target.value)}
    />

      {/* 연관검색어 */}
    {isFocused && query.length > 0 && (
        <div className="mt-2 border rounded shadow bg-white">
        {suggestions
            .filter((s) => s.startsWith(query.toLowerCase()))
            .map((s, i) => (
            <div
                key={i}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => setQuery(s)}
            >
                {s}
            </div>
            ))}
        </div>
        )}
    </div> );
}
