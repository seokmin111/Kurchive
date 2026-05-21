"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getIngredientUnitsByName, searchIngredients } from "../../api/ingredient";
import client from "../../api/client";
import {
  convertRecipeUnits,
  deleteRecipe,
  deleteStepImage,
  deleteThumbnail,
  getRecipeDetail,
  replaceStepImages,
  replaceThumbnail,
  scaleRecipe,
  updateRecipe,
  uploadStepImages,
} from "../../api/recipe";
import {
  DEFAULT_UNIT_MAP,
  UNIT_TYPE_LABEL,
  getUnitOptions,
  getUnitTypeLabelByUnitName,
  normalizeUnitType,
  type UnitType,
} from "../../constants/recipeUnits";
import style from "./page.module.css";

type RecipeDetail = {
  id: number;
  title: string;
  base_serving: number;
  uploader_id: number;
  thumbnail_url?: string | null;
  description?: string | null;
  steps: {
  step_order: number;
  description: string;
  image_urls?: string[];
  images?: { id: number; image_url: string }[];
  }[];
  ingredients: {
  ingredient_id: number;
  name: string;
  quantity: number;
  unit_name: string;
  unit_type: UnitType;
  }[];
};

type DraftIngredient = {
  local_id: string;
  ingredient_id: number;
  name: string;
  quantity: number;
  unit_name: string;
  unit_type: UnitType;
  is_existing: boolean;
};

type DraftStep = {
  step_order: number;
  description: string;
  image_urls: string[];
};

type IngredientSuggestItem = {
  id: number;
  name: string;
  unit_type?: string;
};

type CurrentUser = {
  id?: number | string;
  user_id?: number | string;
  is_admin?: number | boolean;
  role?: string;
};

const makeLocalId = () => crypto.randomUUID();

const toDraftIngredients = (items: RecipeDetail["ingredients"]): DraftIngredient[] =>
  (items ?? []).map((item) => ({
  local_id: makeLocalId(),
  ingredient_id: item.ingredient_id,
  name: item.name,
  quantity: item.quantity,
  unit_name: item.unit_name,
  unit_type: normalizeUnitType(item.unit_type, item.unit_name),
  is_existing: true,
  }));

const toDraftSteps = (items: RecipeDetail["steps"]): DraftStep[] =>
  (items ?? [])
  .slice()
  .sort((a, b) => a.step_order - b.step_order)
  .map((step) => ({
      step_order: step.step_order,
      description: step.description,
      image_urls: step.image_urls ?? [],
  }));

export default function RecipeSpecificEdit() {
  const { recipeId } = useParams();
  const nav = useNavigate();
  const ingNameRefs = useRef<Array<HTMLInputElement | null>>([]);
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [baseServingDraft, setBaseServingDraft] = useState(1);
  const [servingsInput, setServingsInput] = useState(1);
  const [ingredientsDraft, setIngredientsDraft] = useState<DraftIngredient[]>([]);
  const [stepsDraft, setStepsDraft] = useState<DraftStep[]>([]);

  const [unitSelections, setUnitSelections] = useState<Record<number, string>>({});
  const [allowedUnits, setAllowedUnits] = useState<Record<number, string[]>>({});
  const [unitDirty, setUnitDirty] = useState(false);

  const [ingSuggest, setIngSuggest] = useState<Record<string, IngredientSuggestItem[]>>({});
  const [ingSuggestOpen, setIngSuggestOpen] = useState<Record<string, boolean>>({});
  const [ingSuggestLoading, setIngSuggestLoading] = useState<Record<string, boolean>>({});

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [stepFiles, setStepFiles] = useState<Record<number, File[]>>({});

  const canEdit = Boolean(
  currentUser &&
      recipe &&
      (String(currentUser.id ?? currentUser.user_id) === String(recipe.uploader_id) ||
    currentUser.is_admin === 1 ||
    currentUser.is_admin === true ||
    currentUser.role === "admin" ||
    currentUser.role === "staff")
  );

  useEffect(() => {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  client
      .get("/mypage")
      .then((res) => setCurrentUser(res.data.data || res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
  const id = Number(recipeId);
  if (!id || Number.isNaN(id)) {
      setErrMsg("잘못된 레시피 ID입니다.");
      setLoading(false);
      return;
  }

  (async () => {
      try {
    setLoading(true);
    setErrMsg("");

    const data: RecipeDetail = await getRecipeDetail(id);
    setRecipe(data);
    setTitleDraft(data.title);
    setDescDraft((data.description ?? "").toString());
    setBaseServingDraft(data.base_serving);
    setServingsInput(data.base_serving);
    setIngredientsDraft(toDraftIngredients(data.ingredients));
    setStepsDraft(toDraftSteps(data.steps));

    const initUnits: Record<number, string> = {};
    (data.ingredients ?? []).forEach((item) => {
          initUnits[item.ingredient_id] = item.unit_name;
    });
    setUnitSelections(initUnits);
    setUnitDirty(false);
    setThumbnailFile(null);
    setStepFiles({});
      } catch (error: any) {
    setErrMsg(error?.response?.data?.detail ?? error?.message ?? "레시피를 불러오지 못했습니다.");
      } finally {
    setLoading(false);
      }
  })();
  }, [recipeId]);

  useEffect(() => {
  if (!recipe || !ingredientsDraft.length) return;

  (async () => {
      const nextUnits: Record<number, string[]> = {};

      for (const ingredient of ingredientsDraft) {
    if (ingredient.ingredient_id < 0) {
          nextUnits[ingredient.ingredient_id] = [];
          continue;
    }

    try {
          const data = await getIngredientUnitsByName(ingredient.name);
          nextUnits[ingredient.ingredient_id] = (data.units ?? []).filter(Boolean);
    } catch {
          nextUnits[ingredient.ingredient_id] = [];
    }
      }

      setAllowedUnits(nextUnits);
  })();
  }, [recipe, ingredientsDraft]);

  useEffect(() => {
  if (!loading && recipe && currentUser && !canEdit) {
      alert("수정 권한이 없습니다.");
      nav(`/recipe/${recipeId}`);
  }
  }, [canEdit, currentUser, loading, nav, recipe, recipeId]);

  useEffect(() => {
  return () => {
      debounceTimersRef.current.forEach((timer) => clearTimeout(timer));
  };
  }, []);

  const refreshRecipe = async (id: number) => {
  const fresh: RecipeDetail = await getRecipeDetail(id);
  setRecipe(fresh);
  setTitleDraft(fresh.title);
  setDescDraft((fresh.description ?? "").toString());
  setBaseServingDraft(fresh.base_serving);
  setIngredientsDraft(toDraftIngredients(fresh.ingredients));
  setStepsDraft(toDraftSteps(fresh.steps));
  setThumbnailFile(null);
  setStepFiles({});
  setUnitDirty(false);
  return fresh;
  };

  const normalizeSteps = (steps: DraftStep[]) =>
  steps.map((step, index) => ({ ...step, step_order: index + 1 }));

  const onChangeIngredientName = (idx: number, value: string) => {
  const localId = ingredientsDraft[idx]?.local_id;
  if (!localId) return;

  setIngredientsDraft((prev) =>
      prev.map((item, index) =>
    index === idx
          ? {
              ...item,
              name: value,
              ingredient_id: -1,
              unit_name: "g",
              unit_type: "weight",
              is_existing: false,
      }
          : item
      )
  );

  setIngSuggestOpen((prev) => ({ ...prev, [localId]: true }));

  const prevTimer = debounceTimersRef.current.get(localId);
  if (prevTimer) clearTimeout(prevTimer);

  const timer = setTimeout(async () => {
      const query = value.trim();
      if (!query) {
    setIngSuggest((prev) => ({ ...prev, [localId]: [] }));
    return;
      }

      setIngSuggestLoading((prev) => ({ ...prev, [localId]: true }));

      try {
    const items = await searchIngredients(query, 8);
    setIngSuggest((prev) => ({ ...prev, [localId]: items }));
      } catch {
    setIngSuggest((prev) => ({ ...prev, [localId]: [] }));
      } finally {
    setIngSuggestLoading((prev) => ({ ...prev, [localId]: false }));
      }
  }, 250);

  debounceTimersRef.current.set(localId, timer);
  };

  const onPickIngredient = async (idx: number, pick: IngredientSuggestItem) => {
  const localId = ingredientsDraft[idx]?.local_id;
  if (!localId) return;

  const unitData = await getIngredientUnitsByName(pick.name);
  const firstUnit = (unitData.units ?? [])[0] ?? "";

  setIngredientsDraft((prev) =>
      prev.map((item, index) =>
    index === idx
          ? {
              ...item,
              ingredient_id: pick.id,
              name: pick.name,
              unit_name: firstUnit,
              unit_type: normalizeUnitType(pick.unit_type, firstUnit),
              is_existing: true,
      }
          : item
      )
  );

  setAllowedUnits((prev) => ({ ...prev, [pick.id]: unitData.units ?? [] }));
  setUnitSelections((prev) => ({ ...prev, [pick.id]: firstUnit }));
  setIngSuggestOpen((prev) => ({ ...prev, [localId]: false }));
  };

  const addIngredient = () => {
  const localId = makeLocalId();

  setIngredientsDraft((prev) => [
      ...prev,
      {
    local_id: localId,
    ingredient_id: -1,
    name: "",
    quantity: 0,
    unit_name: "g",
    unit_type: "weight",
    is_existing: false,
      },
  ]);

  setTimeout(() => {
      ingNameRefs.current[ingredientsDraft.length]?.focus();
  }, 0);

  setIngSuggestOpen((prev) => ({ ...prev, [localId]: true }));
  };

  const removeIngredient = (idx: number) => {
  setIngredientsDraft((prev) => prev.filter((_, index) => index !== idx));
  setIngSuggest({});
  setIngSuggestOpen({});
  setIngSuggestLoading({});
  };

  const setIngredientQuantity = (idx: number, quantity: number) => {
  setIngredientsDraft((prev) =>
      prev.map((item, index) => (index === idx ? { ...item, quantity } : item))
  );
  };

  const setIngredientUnit = (idx: number, unitName: string) => {
  setIngredientsDraft((prev) =>
      prev.map((item, index) => (index === idx ? { ...item, unit_name: unitName } : item))
  );
  };

  const setStepDescription = (idx: number, description: string) => {
  setStepsDraft((prev) =>
      prev.map((step, index) => (index === idx ? { ...step, description } : step))
  );
  };

  const addStep = () => {
  setStepsDraft((prev) =>
      normalizeSteps([...prev, { step_order: prev.length + 1, description: "", image_urls: [] }])
  );
  };

  const removeStep = (idx: number) => {
  const removedOrder = stepsDraft[idx]?.step_order;
  setStepsDraft((prev) => normalizeSteps(prev.filter((_, index) => index !== idx)));

  if (removedOrder) {
      setStepFiles((prev) => {
    const next = { ...prev };
    delete next[removedOrder];
    return next;
      });
  }
  };

  const onScaleServings = async () => {
  if (!recipe) return;

  const servings = Number(servingsInput);
  if (!servings || Number.isNaN(servings) || servings <= 0) {
      setErrMsg("인분은 1 이상이어야 합니다.");
      return;
  }

  try {
      setErrMsg("");
      const scaled: RecipeDetail = await scaleRecipe(recipe.id, servings);
      setRecipe(scaled);
      setBaseServingDraft(scaled.base_serving);
      setIngredientsDraft(toDraftIngredients(scaled.ingredients));
  } catch (error: any) {
      setErrMsg(error?.response?.data?.detail ?? error?.message ?? "인분 변경에 실패했습니다.");
  }
  };

  const onConvertUnits = async () => {
  if (!recipe) return;

  const units: Record<number, string> = {};
  ingredientsDraft.forEach((item) => {
      const selected = unitSelections[item.ingredient_id];
      if (selected) units[item.ingredient_id] = selected;
  });

  try {
      setErrMsg("");
      const converted: RecipeDetail = await convertRecipeUnits(recipe.id, { units });
      setRecipe(converted);
      setIngredientsDraft(toDraftIngredients(converted.ingredients));

      const nextUnits: Record<number, string> = {};
      (converted.ingredients ?? []).forEach((item) => {
    nextUnits[item.ingredient_id] = item.unit_name;
      });
      setUnitSelections(nextUnits);
      setUnitDirty(false);
  } catch (error: any) {
      setErrMsg(error?.response?.data?.detail ?? error?.message ?? "단위 변경에 실패했습니다.");
  }
  };

  const onSave = async () => {
  if (!recipe || saving) return;

  if (!titleDraft.trim()) {
      setErrMsg("레시피 제목을 입력해주세요.");
      return;
  }

  setSaving(true);

  try {
      setErrMsg("");

      const body = {
    title: titleDraft.trim(),
    base_serving: baseServingDraft,
    description: descDraft,
    ingredients: ingredientsDraft
          .filter((item) => item.name.trim())
          .map((item) => ({
      ingredient_id: item.ingredient_id > 0 ? item.ingredient_id : undefined,
      name: item.name,
      unit_type: item.unit_type,
      quantity: Number(item.quantity),
      unit_name: item.unit_name,
          })),
    steps: stepsDraft.map((step) => ({
          step_order: step.step_order,
          description: step.description,
          image_urls: step.image_urls ?? [],
    })),
      };

      const updated: RecipeDetail = await updateRecipe(recipe.id, body as any);

      if (thumbnailFile) {
    await replaceThumbnail(updated.id, thumbnailFile);
      }

      for (const step of stepsDraft) {
    const files = stepFiles[step.step_order];
    if (!files?.length) continue;

    const hasServerImages = (step.image_urls?.length ?? 0) > 0;
    if (hasServerImages) {
          await replaceStepImages(updated.id, step.step_order, files);
    } else {
          await uploadStepImages(updated.id, step.step_order, files);
    }
      }

      const fresh = await refreshRecipe(updated.id);
      nav(`/recipe/${fresh.id}`);
  } catch (error: any) {
      const status = error?.response?.status;
      setErrMsg(
    status === 403
          ? "작성자만 수정할 수 있습니다."
          : error?.response?.data?.detail ?? error?.message ?? "수정에 실패했습니다."
      );
  } finally {
      setSaving(false);
  }
  };

  const onDelete = async () => {
  if (!recipe) return;
  if (!window.confirm("정말 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;

  try {
      setErrMsg("");
      await deleteRecipe(recipe.id);
      nav("/recipe");
  } catch (error: any) {
      const status = error?.response?.status;
      setErrMsg(
    status === 403
          ? "작성자만 삭제할 수 있습니다."
          : error?.response?.data?.detail ?? error?.message ?? "삭제에 실패했습니다."
      );
  }
  };

  const deleteCurrentThumbnail = async () => {
  if (!recipe || !window.confirm("썸네일을 삭제할까요?")) return;
  await deleteThumbnail(recipe.id);
  await refreshRecipe(recipe.id);
  };

  if (loading) {
  return (
      <div className={style.page}>
    <div className={style.container}>Loading...</div>
      </div>
  );
  }

  if (!recipe) {
  return (
      <div className={style.page}>
    <div className={style.container}>레시피 정보를 찾을 수 없습니다.</div>
      </div>
  );
  }

  return (
  <div className={style.page}>
      <div className={style.container}>
    <div className={style.banner}>
          <img
      src="/backstep_white_white_background.png"
      className={style.backstep}
      alt="back"
      onClick={() => nav(-1)}
          />
    </div>

    <main className={style.main}>
          {errMsg && <div className={style.errorText}>{errMsg}</div>}

          <section className={style.section}>
      <div className={style.infoTitle}>음식 정보</div>

      <div className={style.foodTitle}>
              <input
        type="text"
        value={titleDraft}
        onChange={(event) => setTitleDraft(event.target.value)}
        placeholder="음식 이름을 입력해주세요"
              />
      </div>

      <textarea
              value={descDraft}
              onChange={(event) => setDescDraft(event.target.value)}
              placeholder="음식 설명을 입력해주세요."
      />

      <div className={style.thumbnailRow}>
              <div className={style.thumbnailLabel}>썸네일</div>
              <div className={style.thumbnailControls}>
        {recipe.thumbnail_url ? (
                  <img src={recipe.thumbnail_url} alt="thumb" className={style.thumbnailPreview} />
        ) : (
                  <div className={style.thumbnailEmpty}>없음</div>
        )}
        <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setThumbnailFile(event.target.files?.[0] ?? null)}
        />
        {thumbnailFile && <div className={style.fileName}>{thumbnailFile.name}</div>}
        {recipe.thumbnail_url && (
                  <button type="button" className={style.smallTextButton} onClick={deleteCurrentThumbnail}>
          썸네일 삭제
                  </button>
        )}
              </div>
      </div>

      <textarea
              value={descDraft}
              onChange={(event) => setDescDraft(event.target.value)}
              placeholder="음식 설명을 입력해주세요."
      />

      <div className={style.portionBody}>
              <div className={style.baseServingGroup}>
        <span>기준 인분</span>
        <input
                  type="number"
                  min={1}
                  value={baseServingDraft}
                  onChange={(event) => setBaseServingDraft(Number(event.target.value))}
        />
              </div>
              <div className={style.servingChangeGroup}>
        <span>인분</span>
        <input
                  type="number"
                  min={1}
                  value={servingsInput}
                  onChange={(event) => setServingsInput(Number(event.target.value))}
        />
        <button type="button" onClick={onScaleServings}>
                  변경하기
        </button>
              </div>
      </div>
          </section>

          <div className={style.line}></div>
          <div className={style.line}></div>

          <section className={`${style.section} ${style.ingredientSection}`}>
      <div className={style.ingredientHeader}>
              <div className={style.ingredientTitle}>재료</div>
              <button
        type="button"
        className={style.applyUnitBtn}
        onClick={onConvertUnits}
        disabled={!ingredientsDraft.length || !unitDirty}
              >
        단위 적용
              </button>
      </div>

      <div className={style.tableScroll}>
              <table className={style.table}>
        <thead>
                  <tr>
          <th>재료</th>
          <th>숫자</th>
          <th>단위</th>
          <th>타입</th>
          <th></th>
                  </tr>
        </thead>
        <tbody>
                  {ingredientsDraft.map((item, idx) => {
          const unitValue =
              item.ingredient_id > 0
            ? unitSelections[item.ingredient_id] ?? item.unit_name
            : item.unit_name;
          const unitOptions = getUnitOptions(
              item.ingredient_id,
              item.unit_type,
              unitValue,
              allowedUnits
          );

          return (
          <tr key={item.local_id}>
                      <td className={style.ingCell}>
            <input
                          ref={(element) => {
              ingNameRefs.current[idx] = element;
                          }}
                          value={item.name}
                          onFocus={() =>
              setIngSuggestOpen((prev) => ({ ...prev, [item.local_id]: true }))
                          }
                          onChange={(event) => onChangeIngredientName(idx, event.target.value)}
            />

            {ingSuggestOpen[item.local_id] && (
                          <div className={style.ingDropdown}>
              {ingSuggestLoading[item.local_id] ? (
                              <div className={style.ingDropdownLoading}>검색중...</div>
              ) : (
                              (ingSuggest[item.local_id] ?? []).map((suggestion) => (
                <div
                                  key={suggestion.id}
                                  className={style.ingDropdownItem}
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={() => onPickIngredient(idx, suggestion)}
                >
                                  {suggestion.name}
                </div>
                              ))
              )}
                          </div>
            )}
                      </td>
                      <td>
            <input
                          type="number"
                          min={0}
                          value={item.quantity}
                          onChange={(event) => setIngredientQuantity(idx, Number(event.target.value))}
            />
                      </td>
                      <td>
            <select
                          value={unitValue}
                          disabled={item.ingredient_id > 0 ? unitOptions.length === 0 : false}
                          onChange={(event) => {
              const value = event.target.value;
              if (item.ingredient_id > 0) {
                              setUnitSelections((prev) => ({ ...prev, [item.ingredient_id]: value }));
                              setUnitDirty(true);
              }
              setIngredientUnit(idx, value);
                          }}
            >
                          {unitOptions.map((unit) => (
              <option key={unit} value={unit}>
                              {unit}
              </option>
                          ))}
            </select>
                      </td>
                      <td>
            {item.is_existing ? (
                          <span>{getUnitTypeLabelByUnitName(unitValue)}</span>
            ) : (
                          <select
              value={item.unit_type}
              onChange={(event) => {
                              const unitType = event.target.value as UnitType;
                              setIngredientsDraft((prev) =>
                prev.map((ingredient, index) =>
                                  index === idx
                  ? {
                    ...ingredient,
                    unit_type: unitType,
                    unit_name: DEFAULT_UNIT_MAP[unitType][0] ?? "",
                                      }
                  : ingredient
                )
                              );
              }}
                          >
              <option value="weight">{UNIT_TYPE_LABEL.weight}</option>
              <option value="volume">{UNIT_TYPE_LABEL.volume}</option>
              <option value="count">{UNIT_TYPE_LABEL.count}</option>
                          </select>
            )}
                      </td>
                      <td>
            <button type="button" onClick={() => removeIngredient(idx)}>
                          삭제
            </button>
                      </td>
          </tr>
          );
                  })}
        </tbody>
              </table>
      </div>

      <button className={style.addRowBtn} onClick={addIngredient} type="button">
              <span className={style.addRowPlus}>+</span>
              재료 추가하기
      </button>
          </section>

          <div className={style.line}></div>
          <div className={style.line}></div>

          <section className={style.section}>
      <div className={style.recipeTitle}>레시피</div>
      <div className={style.recipeBody}>
              {stepsDraft.map((step, idx) => {
        const order = step.step_order;
        const picked = stepFiles[order] ?? [];
        const serverImages = recipe.steps.find((item) => item.step_order === order)?.images ?? [];

        return (
                  <div className={style.recipeItem} key={order}>
          <div className={style.photoBox}>
                      <div className={style.number}>{order}</div>
                      <div className={style.stepImageArea}>
            {picked.length > 0 ? (
                          <div className={style.stepImagePreview}>
              <div className={style.stepImageItem}>
                              <img
                src={URL.createObjectURL(picked[0])}
                className={style.stepThumb}
                alt="preview"
                              />
                              <button
                type="button"
                className={style.stepImageDelete}
                onClick={() =>
                                  setStepFiles((prev) => {
                  const next = { ...prev };
                  delete next[order];
                  return next;
                                  })
                }
                              >
                x
                              </button>
              </div>
                          </div>
            ) : serverImages.length > 0 ? (
                          <div className={style.stepImageList}>
              {serverImages.map((image) => (
                              <div key={image.id} className={style.stepImageItem}>
                <img src={image.image_url} className={style.stepThumb} alt="step" />
                <button
                                  type="button"
                                  className={style.stepImageDelete}
                                  onClick={async () => {
                  if (!window.confirm("이미지를 삭제할까요?")) return;
                  await deleteStepImage(recipe.id, order, image.id);
                  await refreshRecipe(recipe.id);
                                  }}
                >
                                  x
                </button>
                              </div>
              ))}
                          </div>
            ) : (
                          <label htmlFor={`step-file-${order}`} className={style.stepImageBtn}>
              <span className={style.stepPlus}>+</span>
              <span className={style.stepAddText}>이미지 추가</span>
                          </label>
            )}

            <input
                          id={`step-file-${order}`}
                          className={style.stepFileInput}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              setStepFiles((prev) => ({ ...prev, [order]: files }));
                          }}
            />
                      </div>
          </div>

          <div className={style.stepTextArea}>
                      <textarea
            className={style.textBox}
            value={step.description}
            onChange={(event) => setStepDescription(idx, event.target.value)}
                      />
                      <div className={style.stepActionRow}>
            <button
                          type="button"
                          className={style.stepImageReplaceBtn}
                          onClick={() => document.getElementById(`step-file-${order}`)?.click()}
            >
                          이미지 교체
            </button>
            <button
                          type="button"
                          className={style.stepDeleteBtn}
                          onClick={() => removeStep(idx)}
            >
                          단계 삭제
            </button>
                      </div>
          </div>
                  </div>
        );
              })}

              <button className={style.addRowBtn} onClick={addStep} type="button">
        <span className={style.addRowPlus}>+</span>
        단계 추가하기
              </button>
      </div>
          </section>

          <div className={style.line}></div>
          <div className={style.line}></div>

          <div className={style.actionBar}>
      <button className={style.actionBtn} type="button" onClick={() => nav(`/recipe/${recipe.id}`)}>
              취소
      </button>
      <button className={style.actionBtn} type="button" onClick={onDelete}>
              삭제
      </button>
      <button className={style.actionBtn} type="button" onClick={onSave} disabled={saving}>
              {saving ? "저장중..." : "저장하기"}
      </button>
          </div>
    </main>
      </div>
  </div>
  );
}
