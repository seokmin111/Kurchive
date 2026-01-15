import client from "./client";

export async function getIngredientUnitsByName(name: string) {
  const res = await client.get(`/ingredient/${encodeURIComponent(name)}`, {
    params: { mode: 1 },
  });
  return res.data as { ingredient: string; units: string[] };
}
