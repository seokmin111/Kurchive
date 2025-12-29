import client from "./client";

export async function getFoodParents() {
  return client.get("/tags", { params: { category_id: 1 } });
}

export async function getFoodChildren(parentId: number) {
  return client.get("/tags", { params: { parent_id: parentId } });
}

