export type UnitType = "weight" | "volume" | "count" | "misc";

export const DEFAULT_UNIT_MAP: Record<UnitType, string[]> = {
  weight: ["g", "kg"],
  volume: ["ml", "L", "tbsp", "tsp", "cup"],
  count: ["개"],
  misc: [],
};

export const UNIT_TYPE_LABEL: Record<UnitType, string> = {
  weight: "질량",
  volume: "부피",
  count: "개수",
  misc: "기타",
};

const UNIT_TYPE_BY_UNIT: Record<string, UnitType> = {
  g: "weight",
  kg: "weight",
  ml: "volume",
  L: "volume",
  tbsp: "volume",
  tsp: "volume",
  cup: "volume",
  "개": "count",
  "단": "count",
  "잎": "count",
  "대": "count",
  "톨": "count",
  "쪽": "count",
  "접": "count",
  "포기": "count",
  "뿌리": "count",
  "꼬집": "misc",
  "주먹": "misc",
};

export const getUnitTypeByUnitName = (unitName: string): UnitType | undefined =>
  UNIT_TYPE_BY_UNIT[unitName];

export const getUnitTypeLabelByUnitName = (unitName: string) => {
  const unitType = getUnitTypeByUnitName(unitName);
  return unitType ? UNIT_TYPE_LABEL[unitType] : "기타";
};

export const normalizeUnitType = (
  unitType?: string | null,
  fallbackUnitName = ""
): UnitType => {
  if (unitType === "mass") return "weight";
  if (
    unitType === "weight" ||
    unitType === "volume" ||
    unitType === "count" ||
    unitType === "misc"
  ) {
    return unitType;
  }

  return getUnitTypeByUnitName(fallbackUnitName) ?? "weight";
};

export const getUnitOptions = (
  ingredientId: number,
  unitType: UnitType,
  unitName: string,
  allowedUnits: Record<number, string[]>
) => {
  const units =
    ingredientId > 0 ? allowedUnits[ingredientId] ?? [] : DEFAULT_UNIT_MAP[unitType];

  return Array.from(new Set([...units, unitName].filter(Boolean)));
};
