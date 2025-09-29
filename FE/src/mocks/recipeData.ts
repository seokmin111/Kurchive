// src/mocks/recipeData.ts

// ingredients 테이블 Mock 데이터 
// 재료 검색이나 자동완성에 사용 가능
export const mockIngredients = [
  { id: 1, name: '해선장', unit_type: 'liquid' },
  { id: 2, name: '굴소스', unit_type: 'liquid' },
  { id: 5, name: '다진 마늘', unit_type: 'vegetable' },
  { id: 28, name: '물', unit_type: 'liquid' },
  { id: 30, name: '간장', unit_type: 'liquid' },
  { id: 41, name: '버터', unit_type: 'liquid' },
  { id: 42, name: '참기름', unit_type: 'liquid' },
  { id: 44, name: '식용유', unit_type: 'liquid' },
  { id: 45, name: '올리브유', unit_type: 'liquid' },
  { id: 47, name: '소금', unit_type: 'powder' },
  { id: 48, name: '설탕', unit_type: 'powder' },
  { id: 56, name: '후추', unit_type: 'powder' },
  { id: 98, name: '파슬리 가루', unit_type: 'powder' },
  // 가상으로 추가한 재료
  { id: 259, name: '새우', unit_type: 'seafood' }
  
];

// units 테이블 Mock 데이터 
// 재료 양 입력시 단위선택 드롭다운에 사용 가능
export const mockUnits = [
  { unit_id: 1, unit_name: 'ml', unit_type: 'volume' },
  { unit_id: 2, unit_name: 'g', unit_type: 'weight' },
  { unit_id: 3, unit_name: 'tbsp', unit_type: 'volume' },
  { unit_id: 4, unit_name: 'tsp', unit_type: 'volume' },
  { unit_id: 6, unit_name: '개', unit_type: 'count' },
  { unit_id: 17, unit_name: '꼬집', unit_type: 'misc' },
];

// ingredient_units 테이블 Mock 데이터
// 특정 재료에 사용가능한 단위 목록을 보여줄 때 사용
export const mockIngredientUnits = [
  { ingredient_id: 1, unit_name: 'g' },
  { ingredient_id: 2, unit_name: 'g' },
  { ingredient_id: 41, unit_name: 'g' },
  { ingredient_id: 41, unit_name: 'tbsp' }, 
  // 버터는 g과 tbsp 모두 가능하다고 가정
  { ingredient_id: 47, unit_name: 'g' },
  { ingredient_id: 47, unit_name: '꼬집' }, 
  // 소금은 g과 꼬집 모두 가능하다고 가정
  { ingredient_id: 101, unit_name: 'g' },
  { ingredient_id: 101, unit_name: '마리' }, 
  // 새우는 g과 마리 모두 가능하다고 가정
];


// 레시피 상세 페이지 Mock 데이터
// GET /api/recipe/{recipe_id} 응답 형식 
export const mockRecipeDetail = {
  id: 2, // API경로의 {recipe_id}와 일치
  title: "마늘 버터 새우 구이",
  base_serving: 2, // 2인분 기준
  uploader_id: 9, // 업로더의 user.id (로그에서 확인)
  created_at: new Date().toISOString(), // 현재 시간
  thumbnail_url: "https://placehold.co/800x600.png?text=Garlic+Butter+Shrimp", // 임시로 placehold 이미지 넣어둠 
  steps: [
    {
      step_order: 1,
      description: "새우는 깨끗이 씻어 물기를 제거합니다. 마늘은 잘게 다져줍니다. 버터는 상온에 두어 부드럽게 만듭니다.",
      image_urls: [
        "https://placehold.co/400x300.png?text=Step+1-1",
        "https://placehold.co/400x300.png?text=Step+1-2"
      ],
    },
    {
      step_order: 2,
      description: "중불로 달군 팬에 올리브유를 두르고 다진 마늘을 넣어 30초간 볶아 향을 냅니다.",
      image_urls: [
        "https://placehold.co/400x300.png?text=Step+2"
      ],
    },
    {
      step_order: 3,
      description: "마늘 향이 올라오면 손질한 새우와 버터를 넣고, 새우가 붉은색이 될 때까지 약 2-3분간 볶아줍니다.",
      image_urls: [], // 이건 이미지 없는 단계
    },
    {
      step_order: 4,
      description: "소금과 후추로 간을 맞추고, 마지막으로 파슬리 가루를 뿌려 마무리합니다.",
      image_urls: [
        "https://placehold.co/400x300.png?text=Step+4"
      ],
    }
  ],
  ingredients: [
    {
      ingredient_id: 101,
      name: "새우",
      quantity: 300,
      unit_name: "g",
    },
    {
      ingredient_id: 41,
      name: "버터",
      quantity: 2,
      unit_name: "tbsp",
    },
    {
      ingredient_id: 5,
      name: "다진 마늘",
      quantity: 1.5,
      unit_name: "tbsp",
    },
    {
      ingredient_id: 45,
      name: "올리브유",
      quantity: 1,
      unit_name: "tbsp",
    },
    {
      ingredient_id: 47,
      name: "소금",
      quantity: 2,
      unit_name: "꼬집",
    },
    {
      ingredient_id: 102,
      name: "후추",
      quantity: 1,
      unit_name: "꼬집",
    },
    {
      ingredient_id: 103,
      name: "파슬리 가루",
      quantity: 0.5,
      unit_name: "tsp",
    }
  ],
};