export type SelectedItem = {
  type: "region" | "tag" | "price" | "rating";
  id: number | null;
  name: string;
  parentId?: number;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
};

export type RegionItem = {
  id: number;
  name: string;
  parent_id?: number | null;
  depth?: number | null;
};

export type TagItem = {
  id: number;
  name: string;
  parent_id?: number | null;
  category_id?: number;
};
