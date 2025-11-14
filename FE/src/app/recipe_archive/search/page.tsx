"use client"
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        const timeoutId = setTimeout(() => {
            fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => setSuggestions(data))
                .catch(err => console.error(err));
        }, 300); // 디바운스 300ms

        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <main className={styles.nomrg}>
            <div>
                <br />
                <h1 className={styles.title} style={{ display: 'inline' }}>커카이브</h1>
                <p className={styles.sub_title} style={{ display: 'inline' }}>우리만의 미식 지도</p>
            </div>

            <div
                className = {styles.search_container}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        (document.activeElement as HTMLElement)?.blur();
                    }
                }}
            >

            <input className = {styles.input_box}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색어를 입력하세요"
            />
            <button type="submit" className={styles.search_btn}></button>

            {suggestions.length > 0 && (
                <ul className={styles.suggestion_list}>
                    {suggestions.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            )}
            </div>
        </main>
    );
}