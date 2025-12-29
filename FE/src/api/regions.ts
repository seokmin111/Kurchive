import client from "./client";

// 상위 지역
export async function getRegionParents() {
  return client.get("/regions");
}

// 특정 지역의 하위 지역
export async function getRegionChildren(parentId: number) {
  return client.get("/regions", { params: { parent_id: parentId } });
}
