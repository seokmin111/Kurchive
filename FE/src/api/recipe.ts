// src/api/recipe.ts
import client from "./client";

// 전체 레시피 목록
export const listRecipes = async () => {
  const res = await client.get("/api/recipe/list");
  return res.data; // List[RecipeResponseDTO]
};

// 제목으로 레시피 검색
export const searchRecipes = async (title: string) => {
  const res = await client.get("/api/recipe/search", {
    params: { title },
  });
  return res.data;
};
