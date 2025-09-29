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
  { ingredient_id: 5, unit_name: 'g' },
  { ingredient_id: 5, unit_name: 'tbsp' },
  { ingredient_id: 30, unit_name: 'ml' },
  { ingredient_id: 30, unit_name: 'tbsp' },
  { ingredient_id: 41, unit_name: 'g' },
  { ingredient_id: 41, unit_name: 'tbsp' },
];


// 레시피 상세 페이지 Mock 데이터
// GET /api/recipe/{recipe_id} 응답 형식 
export const mockRecipeDetail = {
  id: 2, // API경로의 {recipe_id}와 일치
  title: "마늘 버터 간장 소스",
  base_serving: 2, 
  uploader_id: 9, // 업로더의 user.id
  created_at: new Date().toISOString(), // 현재 시간
  thumbnail_url: "https://placehold.co/800x600.png?text=Garlic+Butter+Shrimp", // 임시로 placehold 이미지 넣어둠 
  steps: [
    {
      step_order: 1,
      description: "중약불로 달군 팬에 버터를 녹이고 다진 마늘을 넣어 타지 않게 1분간 볶아 향을 냅니다.",
      image_urls: [
        "https://placehold.co/400x300.png?text=Step+1-1",
        "https://placehold.co/400x300.png?text=Step+1-2"
      ],
    },
    {
      step_order: 2,
      description: "간장, 물, 설탕을 넣고 잘 저어주면서 설탕이 녹고 소스가 살짝 끓어오를 때까지 가열합니다.",
      image_urls: [
        "https://placehold.co/400x300.png?text=Step+2"
      ],
    },
    {
      step_order: 3,
      description: "불을 끄고 후추와 파슬리 가루를 뿌려 마무리합니다.",
      image_urls: [], // 이건 이미지 없는 단계
    }
  ],
  ingredients: [
    {
      ingredient_id: 30,
      name: "간장",
      quantity: 4,
      unit_name: "tbsp",
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
      quantity: 1,
      unit_name: "tbsp",
    },
    {
      ingredient_id: 48,
      name: "설탕",
      quantity: 1.5,
      unit_name: "tbsp",
    },
    {
      ingredient_id: 28,
      name: "물",
      quantity: 2,
      unit_name: "tbsp",
    },
    {
      ingredient_id: 56,
      name: "후추",
      quantity: 1,
      unit_name: "꼬집",
    },
    {
      ingredient_id: 98,
      name: "파슬리 가루",
      quantity: 1,
      unit_name: "tsp",
    }
  ],
};