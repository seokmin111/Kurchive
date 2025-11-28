// src/api/recipe.ts
import client from "./client";

export async function getRecipeList() {
  const res = await client.get("/recipes");
  return res.data;
}

export async function getRecipe(id: number) {
  const res = await client.get(`/recipes/${id}`);
  return res.data;
}
