import client from "./client";

// -------- Type Definitions (DTO) --------

// 레시피 생성 시 재료 타입 (이름 등록)
export type IngredientCreateInput = {
  name: string;
  quantity: number;
  unit_name: string;
  unit_type?: string; // "mass", "volume", "count" 등 (optional)
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

// 단위 변환 요청
export type ConvertRequestUnitMap = {
  units: { [ingredient_id: number]: string }; // 예 { 1: "g", 2: "ml" } 
};


// -------- API Functions --------

// 1. 조회 API

// 전체 레시피 목록
export const listRecipes = () =>
  client.get("/api/recipe/list").then(r => r.data);

// 제목으로 레시피 검색
export const searchRecipes = (title: string) =>
  client.get("/api/recipe/search", { params: { title } }).then(r => r.data);

// 레시피 상세 조회
export const getRecipeDetail = (recipeId: number) =>
  client.get(`/api/recipe/${recipeId}`).then(r => r.data);

// 레시피 인분 계산 조회
export const scaleRecipe = (recipeId: number, servings: number) =>
  client.get(`/api/recipe/${recipeId}/scale`, { params: { servings } }).then(r => r.data);

// 레시피 단위 변환 (임시 변환된 결과 조회)
export const convertRecipeUnits = (recipeId: number, unitMap: ConvertRequestUnitMap) =>
  client.post(`/api/recipe/${recipeId}/convert`, unitMap).then(r => r.data);


// 2. 생성/수정/삭제

// 레시피 생성
export const createRecipe = (body: CreateRecipeBody) =>
  client.post("/api/recipe", body).then(r => r.data);

// 레시피 수정 (텍스트만)
export const updateRecipe = (recipeId: number, body: UpdateRecipeBody) =>
  client.put(`/api/recipe/${recipeId}`, body).then(r => r.data);

// 레시피 삭제
export const deleteRecipe = (recipeId: number) =>
  client.delete(`/api/recipe/${recipeId}`).then(r => r.data);


// 3. 이미지 업로드 API

// 썸네일 등록 (최초 등록)
export const uploadThumbnail = (recipeId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  
  return client.post(`/api/recipe/${recipeId}/thumbnail`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);
};

// 썸네일 교체 (기존것 삭제 후 등록) 
export const replaceThumbnail = (recipeId: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return client.patch(`/api/recipe/${recipeId}/thumbnail`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);
};

// 썸네일 삭제 
export const deleteThumbnail = (recipeId: number) =>
  client.delete(`/api/recipe/${recipeId}/thumbnail`).then(r => r.data);

// 단계별 이미지 업로드 
export const uploadStepImages = (
  recipeId: number, 
  stepOrder: number, 
  files: File[], 
  replace: boolean = false
) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return client.post(`/api/recipe/${recipeId}/steps/${stepOrder}/images`, formData, {
    params: { replace },
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);
};

// 단계별 이미지 교체 
export const replaceStepImages = (recipeId: number, stepOrder: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  return client.put(`/api/recipe/${recipeId}/steps/${stepOrder}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data);
};