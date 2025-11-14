import axios from 'axios';

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMyIsImlhdCI6MTc2MzEwMzg0OSwiZXhwIjoxNzYzMTA3NDQ5LCJzY29wZSI6InVzZXIifQ.ag1fPajyEKgv6voFFKfpIrW15k0K7_3MuxIlUwR0Okw"

// 1. API에서 받아올 식당 데이터 타입 (예시)
interface Restaurant {
    id: number,
    name: string,
    address: string,
    region_id: number,
    rating: number,
    summary: string,
    price_min: number,
    price_max: number,
    tags: {
        id: number,
        name: string
    }[],
    thumbnail_url: string,
    latitude: number,
    longitude: number,
    uploaded_by: number,
    created_at: null
  }

// 2. Server Component는 'async'로 선언
//    Next.js가 searchParams를 자동으로 props로 전달해 줌
export default async function SearchResultsPage(

{searchParams}: { 
  searchParams: { 
    region_id?: string | string[]; // 'tag'는 여러 개일 수 있음
    price_min?: string;
    price_max?: string;
  } 
}) {

  // 3. 쿼리 파라미터 파싱
  const region = searchParams.region_id || [];
  const minPrice = searchParams.price_min || '0';
  const maxPrice = searchParams.price_max || '0';

  // (API 호출을 위한 baseURL)
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://152.69.228.114:8000';

  let restaurants: Restaurant[] = [];

  try {
    // 4. 백엔드 API에 쿼리 파라미터를 그대로 전달하여 데이터 요청
    // (백엔드 API가 이 파라미터들을 처리하도록 구현되어 있어야 함)
    const response = await axios.get(`${baseURL}/api/restaurants`, {
      
      headers: {
      'Authorization': `Bearer ${TOKEN}`
      },
        params: {
        region_id: region, // (백엔드 API 스펙에 맞게 key 이름 조절)
        price_min: minPrice,
        price_max: maxPrice
      }
    });
    restaurants = response.data;

  } catch (error) {
    console.error("식당 검색 실패:", error);
    // (에러 처리)
  }

  console.log(restaurants)

  // 5. 받아온 데이터로 화면 그리기
  return (
    <main>
        {
        restaurants.length != 0 ? 
        <div>{restaurants[0].name}</div> : 
        <div>실패함 ㅠㅠ (데이터 0개)</div>
        }       
    </main>
  );
}