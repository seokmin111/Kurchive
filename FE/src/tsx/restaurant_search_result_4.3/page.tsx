"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import client from "../../api/client"; // ✅ 너희 client.ts 경로에 맞게 조정

type Restaurant = {
  id: number;
  name: string;
  address?: string | null;
  rating?: number | null;
  summary?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  thumbnail_url?: string | null;
};

export default function RestaurantSearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const q = (params.get("q") || "").trim();
  const region_id = (params.get("region_id") || "").trim();
  const tag_ids = (params.get("tag_ids") || "").trim(); // "1,2,3" 형태
  const price_min = (params.get("price_min") || "").trim();
  const price_max = (params.get("price_max") || "").trim();

  const [items, setItems] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setErrMsg("");

      try {
        // client.ts에 baseURL/헤더(토큰 인터셉터)가 있다면 그대로 자동으로 붙음
        // 만약 client.ts가 토큰 자동첨부를 안 한다면, 아래 주석의 방법 중 하나로 추가해야 함.
        // (보통은 client.ts에서 interceptor로 붙이는 게 정석)

        // 1) 이름 검색
        if (q) {
          const res = await client.get("/restaurants/search", { params: { q } });
          setItems(Array.isArray(res.data) ? res.data : []);
          return;
        }

        // 2) 필터 검색
        const res = await client.get("/restaurants", {
          params: {
            ...(region_id ? { region_id } : {}),
            ...(tag_ids ? { tag_ids } : {}),
            ...(price_min ? { price_min } : {}),
            ...(price_max ? { price_max } : {}),
          },
        });

        setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        if (err?.response?.status === 401) {
          setItems([]);
          setErrMsg("로그인이 만료되었습니다. 다시 로그인해주시기 바랍니다!");
          // navigate("/login");
          return;
        }
        console.error(err);
        setItems([]);
        setErrMsg("검색 결과를 불러오지 못했습니다. 네트워크/서버 상태를 확인해주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [q, region_id, tag_ids, price_min, price_max, navigate]);

  return (
    <main style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/restaurant/search">← 뒤로</Link>
        <h2 style={{ margin: 0 }}>검색 결과</h2>
      </div>

      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
        {q ? (
          <>
            키워드: <b>{q}</b>
          </>
        ) : (
          <>필터 검색</>
        )}
      </div>

      {loading && <p style={{ marginTop: 12 }}>로딩중...</p>}
      {!loading && errMsg && <p style={{ marginTop: 12, color: "crimson" }}>{errMsg}</p>}

      {!loading && !errMsg && items.length === 0 && <p style={{ marginTop: 12 }}>결과가 없어!</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {items.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 14,
              padding: 12,
              display: "flex",
              gap: 12,
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              // TODO: 상세 페이지 라우트 생기면 연결
              // navigate(`/restaurant/${r.id}`);
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                background: "#f5f5f5",
                borderRadius: 12,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {r.thumbnail_url ? (
                <img
                  src={r.thumbnail_url}
                  alt={r.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : null}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{r.name}</div>
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.8,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {r.address || "주소 없음"}
              </div>
              <div style={{ fontSize: 12, marginTop: 8, opacity: 0.9 }}>
                ⭐ {r.rating ?? 0} · {r.price_min ?? "-"} ~ {r.price_max ?? "-"}
              </div>
              {r.summary ? (
                <div style={{ fontSize: 12, marginTop: 6, opacity: 0.9 }}>{r.summary}</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
