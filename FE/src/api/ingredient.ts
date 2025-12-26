import client from "./client";

// mode=1: 단위 목록, mode=2: 레시피 목록
export const getIngredientInfo = (ingredient_name: string, mode: 1 | 2) =>
  client.get(`/api/ingredient/${encodeURIComponent(ingredient_name)}`, {
    params: { mode },
  }).then(r => r.data);
