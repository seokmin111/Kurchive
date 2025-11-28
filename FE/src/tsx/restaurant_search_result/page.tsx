"use client"; // 1. 클라이언트 컴포넌트

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // 2. 훅 import
import axios from 'axios';
import qs from 'qs'; // npm install qs 필요 (배열 처리를 위해 권장)

// 타입 정의 (그대로 유지)
interface Restaurant {
  id: number;
  name: string;
  address: string;
  region_id: number;
  thumbnail_url: string;
  // ... (나머지 필드)
}


export default function SearchResultsPage() { 
  
  const searchParams = useSearchParams(); 

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]); //받아올 레스토랑 데이터 저장
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    if (!searchParams) return;

    // 1. 빈 객체로 시작
    const params: any = {};

    // 2. 지역 ID: 배열이 비어있지 않을 때만 추가
    const regions = searchParams.getAll('region_id');
    if (regions.length > 0) {
        params.region_id = regions;
    }

    // 3. 태그 ID: 배열이 비어있지 않을 때만 추가
    const tags = searchParams.getAll('tag_ids'); 
    if (tags.length > 0) {
        params.tag_ids = tags;
    }

    // 4. 가격: 값이 존재하고 '0'이 아닐 때만 추가 (필요에 따라 조건 조절)
    const minPrice = searchParams.get('price_min');
    if (minPrice && minPrice !== '0') {
        params.price_min = minPrice;
    }

    const maxPrice = searchParams.get('price_max');
    if (maxPrice && maxPrice !== '0') {
        params.price_max = maxPrice;
    }

    const query = searchParams.get("q");
    if (query?.length != 0){
        params.q = query
    }

    if ("q" in params){
        axios.get("http://152.69.228.114:8000/api/restaurants/search",{
            headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNSIsImlhdCI6MTc2MzcyNzk0MywiZXhwIjoxNzYzNzMxNTQzLCJzY29wZSI6InVzZXIifQ.0zHPTwC_JgkxyktfkDSOGWHe3F1vT_JT-L8Ar1xfk98` }, // (필요시 주석 해제)
            params: params
        })
        .then((res) => {
        console.log("✅ 받아온 데이터:", res.data);
        setRestaurants(res.data);
    })
        .catch((err) => {
        console.error("❌ API 에러:", err);
    })
        .finally(() => {
        setLoading(false);
    });
    }

    else{
    axios.get(`http://152.69.228.114:8000/api/restaurants`, {
        headers: {Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNSIsImlhdCI6MTc2MzcyNzk0MywiZXhwIjoxNzYzNzMxNTQzLCJzY29wZSI6InVzZXIifQ.0zHPTwC_JgkxyktfkDSOGWHe3F1vT_JT-L8Ar1xfk98` }, // (필요시 주석 해제)
        params: params,
        
        // 6. (중요) 배열 파라미터 직렬화 (FastAPI 호환용)
        // qs 라이브러리가 없다면 이 부분 지우고 테스트 해보세요.
        paramsSerializer: (p) => {
            return qs.stringify(p, { arrayFormat: 'repeat' }) 
        }
    })
    .then((res) => {
        console.log("✅ 받아온 데이터:", res.data);
        setRestaurants(res.data);
    })
    .catch((err) => {
        console.error("❌ API 에러:", err);
    })
    .finally(() => {
        setLoading(false);
    });

  }}, [searchParams]); // 7. URL이 바뀔 때마다 재실행

  return (
    <main style={{ padding: '20px' }}>
      <h1>검색 결과</h1>
      
      {loading ? (
          <div>로딩 중...</div>
      ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {restaurants.length > 0 ? (
                restaurants.map((r) => (
                    <div key={r.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
                        <img src={r.thumbnail_url}/>
                        <h3>{r.name}</h3>
                        <p>주소: {r.address}</p>
                    </div>
                ))
            ) : (
                <div>검색 결과가 없습니다. (조건을 확인해주세요)</div>
            )}
          </div>
      )}
    </main>
  );
}