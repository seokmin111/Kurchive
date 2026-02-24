import client from "./client";

// -------- Type Definitions (DTO) --------

// 레시피 생성 시 재료 타입 (이름 등록)
export type IngredientCreateInput = {
  name: string;
  quantity: number;
  unit_name: string;
  unit_type?: string; // "mass", "volume", "count" 등
};

// 레시피 수정 시 재료 타입 (ID 등록)
export type IngredientUpdateInput = {
  ingredient_id: number;
  quantity: number;
  unit_name: string;
};

// 레시피 단계 타입
export type RecipeStepInput = {
  step_order: number;
  description: string;
  image_urls?: string[];
  images?: {
    id: number;
    image_url: string;
  }[];
};

// 레시피 생성 요청
export type CreateRecipeBody = {
  title: string;
  base_serving: number;
  ingredients: IngredientCreateInput[];
  steps: RecipeStepInput[];
};

// 레시피 수정 요청
export type UpdateRecipeBody = {
  title?: string;
  base_serving?: number;
  ingredients?: IngredientUpdateInput[];
  steps?: RecipeStepInput[];
};

export type IngredientUpsert =
  | { ingredient_id: number; quantity: number; unit_name: string }
  | { name: string; quantity: number; unit_name: string };

export type RecipeUpdateBody = {
  title?: string;
  base_serving?: number;
  description?: string; // BE에서 아직 무시됨
  ingredients?: IngredientUpsert[];
  steps?: {
    step_order: number;
    description: string;
    image_urls?: string[];
  }[];
};
// 단위 변환 요청
export type ConvertRequestUnitMap = {
  units: { [ingredient_id: number]: string };
};

// -------- API Functions --------

// 1. 조회 API

// 전체 레시피 목록 (3.0 첫 화면)
export const listRecipes = () =>
  client.get("/recipe/list").then((r) => r.data);

// 제목으로 레시피 검색
export const searchRecipes = (title: string) =>
  client.get("/recipe/search", { params: { title } }).then((r) => r.data);

// 레시피 상세 조회
export const getRecipeDetail = (recipeId: number) =>
  client.get(`/recipe/${recipeId}`).then((r) => r.data);

// 레시피 인분 계산 조회
export const scaleRecipe = (recipeId: number, servings: number) =>
  client
    .get(`/recipe/${recipeId}/scale`, { params: { servings } })
    .then((r) => r.data);

// 레시피 단위 변환
export const convertRecipeUnits = (
  recipeId: number,
  unitMap: ConvertRequestUnitMap
) =>
  client
    .post(`/recipe/${recipeId}/convert`, unitMap)
    .then((r) => r.data);

// 2. 생성 / 수정 / 삭제

export async function getOrCreateIngredient(name: string) {
  const res = await client.post("/recipe/ingredients/get-or-create", {
    name,
  });
  return res.data; 
  // 기대: { id: number, unit_type: string }
}

// 레시피 생성
export const createRecipe = (body: CreateRecipeBody) =>
  client.post("/recipe", body).then((r) => r.data);

// 레시피 수정
export async function updateRecipe(
  recipeId: number,
  body: RecipeUpdateBody
) {
  const res = await client.put(`/recipe/${recipeId}`, body);
  return res.data;
}

// 레시피 삭제
export const deleteRecipe = (recipeId: number) =>
  client.delete(`/recipe/${recipeId}`).then((r) => r.data);

// 3. 이미지 업로드 API

// 썸네일 등록
export const uploadThumbnail = (recipeId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return client
    .post(`/recipe/${recipeId}/thumbnail`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

// 썸네일 교체
export const replaceThumbnail = (recipeId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return client
    .patch(`/recipe/${recipeId}/thumbnail`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

// 썸네일 삭제
export const deleteThumbnail = (recipeId: number) =>
  client.delete(`/recipe/${recipeId}/thumbnail`).then((r) => r.data);

// 단계별 이미지 업로드
export const uploadStepImages = (
  recipeId: number,
  stepOrder: number,
  files: File[],
  replace: boolean = false
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return client
    .post(`/recipe/${recipeId}/steps/${stepOrder}/images`, formData, {
      params: { replace },
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};



// 단계별 이미지 교체
export async function replaceStepImages(
  recipeId: number,
  stepOrder: number,
  files: File[]
) {
  const fd = new FormData();
  for (const f of files) {
    // filename 강제 유니크(스토리지/백엔드가 file.filename을 쓰는 경우 대비)
    fd.append(
      "files",
      f,
      `${Date.now()}_${Math.random().toString(16).slice(2)}_${f.name}`
    );
  }

  const res = await client.put(`/recipe/${recipeId}/steps/${stepOrder}/images`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}


export const deleteStepImage = (
  recipeId: number,
  stepOrder: number,
  imageId: number
) => {
  return client.delete(
    `/recipe/${recipeId}/steps/${stepOrder}/images/${imageId}`
  );
};
