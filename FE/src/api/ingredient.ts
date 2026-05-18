// api/ingredient.ts
import client from "./client";

export async function getIngredientUnitsByName(name: string) {
  const res = await client.get(`/ingredient/${encodeURIComponent(name)}`, {
    params: { mode: 1 },
  });
  return res.data as { ingredient: string; units: string[] };
}

export type IngredientSearchItem = {
  id: number;
  name: string;
  unit_type: string;
};

export async function searchIngredients(q: string, limit?: number) {
  const res = await client.get<IngredientSearchItem[]>("/ingredient/search", {
    params: { q, ...(limit ? { limit } : {}) },
  });
  return res.data;
}
