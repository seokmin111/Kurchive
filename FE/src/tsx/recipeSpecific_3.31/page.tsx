import client from "../../api/client";


import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "./page.module.css";
import { getIngredientUnitsByName, searchIngredients } from "../../api/ingredient";

import {
  getRecipeDetail,
  updateRecipe,
  deleteRecipe,
  scaleRecipe,
  convertRecipeUnits,
  replaceThumbnail,
  deleteThumbnail,
  uploadStepImages,
  replaceStepImages,
  deleteStepImage
} from "../../api/recipe";

type RecipeDetail = {
  id: number;
  title: string;
  base_serving: number;
  uploader_id: number;
  created_at: string;
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
  }[];
};

type DraftIngredient = {
  ingredient_id: number; // <0: 임시
  name: string;
  quantity: number;
  unit_name: string;
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

export default function RecipeSpecific({ mode }: { mode: "view" | "edit" }) {
  /* 이미지 */
  const [saving, setSaving] = useState(false);

  const ingNameRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { recipeId } = useParams();
  const nav = useNavigate();

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
 /* 편집 모드 */
  const [isEdit, setIsEdit] = useState(mode === "edit");

  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [baseServingDraft, setBaseServingDraft] = useState<number>(1);
  const [ingredientsDraft, setIngredientsDraft] = useState<DraftIngredient[]>([]);
  const [stepsDraft, setStepsDraft] = useState<DraftStep[]>([]);

  const [servingsInput, setServingsInput] = useState<number>(2);

  const [unitSelections, setUnitSelections] = useState<Record<number, string>>({});
  const [allowedUnits, setAllowedUnits] = useState<Record<number, string[]>>({});
  const [unitDirty, setUnitDirty] = useState(false);

  // 재료 자동완성
  const [ingSuggest, setIngSuggest] = useState<Record<number, IngredientSuggestItem[]>>({});
  const [ingSuggestOpen, setIngSuggestOpen] = useState<Record<number, boolean>>({});
  const [ingSuggestLoading, setIngSuggestLoading] = useState<Record<number, boolean>>({});
  const debounceTimersRef = useRef<Map<number, any>>(new Map());

  // 이미지 업로드
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [stepFiles, setStepFiles] = useState<Record<number, File[]>>({}); // key=step_order

  useEffect(() => setIsEdit(mode === "edit"), [mode]);
  useEffect(() => {
  setIsEdit(mode === "edit");

  if (mode === "edit") {
    setSaving(false);
  }
}, [mode]);



  const stepsSorted = useMemo(() => {
    return (recipe?.steps ?? []).slice().sort((a, b) => a.step_order - b.step_order);
  }, [recipe]);

  const ingredientsView = isEdit ? ingredientsDraft : recipe?.ingredients ?? [];
  const stepsView = isEdit ? stepsDraft : stepsSorted;

  const normalizeSteps = (steps: DraftStep[]) =>
    steps.map((s, i) => ({ ...s, step_order: i + 1 }));

  useEffect(() => {
    const id = Number(recipeId);
    if (!id || Number.isNaN(id)) {
      setErrMsg("잘못된 레시피 ID");
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

        setIngredientsDraft(
          (data.ingredients ?? []).map((x) => ({
            ingredient_id: x.ingredient_id,
            name: x.name,
            quantity: x.quantity,
            unit_name: x.unit_name,
          }))
        );

        setStepsDraft(
          (data.steps ?? [])
            .slice()
            .sort((a, b) => a.step_order - b.step_order)
            .map((s) => ({
              step_order: s.step_order,
              description: s.description,
              image_urls: s.image_urls ?? [],
            }))
        );

        setServingsInput(data.base_serving);

        const initUnits: Record<number, string> = {};
        (data.ingredients ?? []).forEach((it) => {
          initUnits[it.ingredient_id] = it.unit_name;
        });
        setUnitSelections(initUnits);
        setUnitDirty(false);

        setThumbnailFile(null);
        setStepFiles({});
      } catch (e: any) {
        console.error(e);
        setErrMsg(e?.response?.data?.detail ?? e?.message ?? "불러오기 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, [recipeId]);

  // allowedUnits: 확정된 재료만 조회
  useEffect(() => {
    const src = ingredientsDraft.length ? ingredientsDraft : recipe?.ingredients ?? [];
    if (!src.length) return;

    (async () => {
      const map: Record<number, string[]> = {};

      for (const ing of src) {
        if (ing.ingredient_id < 0) {
          map[ing.ingredient_id] = [];
          continue;
        }
        try {
          const data = await getIngredientUnitsByName(ing.name);
          const units = (data.units ?? []).filter(Boolean);
          map[ing.ingredient_id] = units;
        } catch {
          map[ing.ingredient_id] = [];
        }
      }

      setAllowedUnits(map);
    })();
  }, [recipe, ingredientsDraft]);

  // 단위 목록 도착 후 unit_name 비어있으면 첫 단위 자동 채움
  useEffect(() => {
    if (!isEdit) return;

    setIngredientsDraft((prev) =>
      prev.map((it) => {
        if (it.ingredient_id <= 0) return it;
        if (it.unit_name?.trim()) return it;
        const first = allowedUnits[it.ingredient_id]?.[0];
        return first ? { ...it, unit_name: first } : it;
      })
    );

    setUnitSelections((prev) => {
      const next = { ...prev };
      for (const it of ingredientsDraft) {
        if (it.ingredient_id <= 0) continue;
        if (next[it.ingredient_id]) continue;
        const first = allowedUnits[it.ingredient_id]?.[0];
        if (first) next[it.ingredient_id] = first;
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedUnits]);

  const onClickBack = () => nav(-1);

  // 재료 자동완성
  const onChangeIngredientName = (idx: number, v: string) => {
    // 1) name 변경
    setIngredientsDraft((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, name: v } : it))
    );

    // 2) 기존 확정 재료였다면 “미확정”으로 되돌림(단위 잠금)
    setIngredientsDraft((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        if (it.ingredient_id > 0) return { ...it, ingredient_id: -Date.now(), unit_name: "" };
        return it;
      })
    );

    setIngSuggestOpen((prev) => ({ ...prev, [idx]: true }));

    const prevT = debounceTimersRef.current.get(idx);
    if (prevT) clearTimeout(prevT);

    const t = setTimeout(async () => {
      const q = v.trim();
      if (!q) {
        setIngSuggest((prev) => ({ ...prev, [idx]: [] }));
        return;
      }

      setIngSuggestLoading((prev) => ({ ...prev, [idx]: true }));
      try {
        const items = await searchIngredients(q, 8);
        setIngSuggest((prev) => ({ ...prev, [idx]: items }));
      } catch (e) {
        console.error(e);
        setIngSuggest((prev) => ({ ...prev, [idx]: [] }));
      } finally {
        setIngSuggestLoading((prev) => ({ ...prev, [idx]: false }));
      }
    }, 200);

    debounceTimersRef.current.set(idx, t);
  };

  const onPickIngredient = (idx: number, pick: IngredientSuggestItem) => {
    setIngredientsDraft((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, ingredient_id: pick.id, name: pick.name, unit_name: "" } : it
      )
    );
    setIngSuggestOpen((prev) => ({ ...prev, [idx]: false }));
  };

  const hasUnconfirmedIngredient = useMemo(() => {
    if (!isEdit) return false;
    return ingredientsDraft.some((x) => (x.name?.trim() ? x.ingredient_id < 0 : false));
  }, [ingredientsDraft, isEdit]);

  const onSave = async () => {
    if (!recipe) return;
    if (saving) return;

    if (!titleDraft.trim()) {
      setErrMsg("레시피 제목을 입력해주세요.");
      return;
    }
    if (hasUnconfirmedIngredient) {
      setErrMsg("확정되지 않은 재료가 있습니다. 드롭다운에서 선택해주세요.");
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
          .filter((x) => x.name?.trim())
          .map((x) => ({
            ingredient_id: x.ingredient_id,
            quantity: Number(x.quantity),
            unit_name: x.unit_name,
          })),
        steps: stepsDraft.map((s) => ({
          step_order: s.step_order,
          description: s.description,
          image_urls: s.image_urls ?? [],
        })),
      };

      const updated: RecipeDetail = await updateRecipe(recipe.id, body);

      if (thumbnailFile) {
        await replaceThumbnail(updated.id, thumbnailFile);
      }

      for (const s of stepsDraft) {
        const files = stepFiles[s.step_order];

        // 가드
        if (!files || files.length === 0) continue;

        const hasServerImages = (s.image_urls?.length ?? 0) > 0;

        if (hasServerImages) {
          await replaceStepImages(updated.id, s.step_order, files);
        } else {
          await uploadStepImages(updated.id, s.step_order, files);
        }
      }


      const fresh: RecipeDetail = await getRecipeDetail(updated.id);
      setRecipe(fresh);

      setTitleDraft(fresh.title);
      setDescDraft((fresh.description ?? "").toString());
      setBaseServingDraft(fresh.base_serving);

      setIngredientsDraft(
        (fresh.ingredients ?? []).map((x) => ({
          ingredient_id: x.ingredient_id,
          name: x.name,
          quantity: x.quantity,
          unit_name: x.unit_name,
        }))
      );

      setStepsDraft(
        (fresh.steps ?? [])
          .slice()
          .sort((a, b) => a.step_order - b.step_order)
          .map((s) => ({
            step_order: s.step_order,
            description: s.description,
            image_urls: s.image_urls ?? [],
          }))
      );

      setThumbnailFile(null);
      setStepFiles({});
      setUnitDirty(false);

      nav(`/recipe/${fresh.id}`);
    } catch (e: any) {
      console.error(e);
      const status = e?.response?.status;
      if (status === 403) setErrMsg("작성자만 수정할 수 있어요.");
      else setErrMsg(e?.response?.data?.detail ?? e?.message ?? "수정 실패");
    }
  };

  const onDelete = async () => {
    if (!recipe) return;

    const ok = window.confirm("정말 삭제할까요? 이 작업은 되돌릴 수 없어요.");
    if (!ok) return;

    try {
      setErrMsg("");
      await deleteRecipe(recipe.id);
      nav("/recipe");
    } catch (e: any) {
      console.error(e);
      const status = e?.response?.status;
      if (status === 403) setErrMsg("작성자만 삭제할 수 있어요.");
      else setErrMsg(e?.response?.data?.detail ?? e?.message ?? "삭제 실패");
    }
  };

  const onScaleServings = async () => {
    if (!recipe) return;
    const servings = Number(servingsInput);
    if (!servings || Number.isNaN(servings) || servings <= 0) {
      setErrMsg("인분은 1 이상 숫자여야 해요.");
      return;
    }

    try {
      setErrMsg("");
      const scaled: RecipeDetail = await scaleRecipe(recipe.id, servings);
      setRecipe(scaled);

      setBaseServingDraft(scaled.base_serving);
      setIngredientsDraft(
        (scaled.ingredients ?? []).map((x) => ({
          ingredient_id: x.ingredient_id,
          name: x.name,
          quantity: x.quantity,
          unit_name: x.unit_name,
        }))
      );
    } catch (e: any) {
      console.error(e);
      setErrMsg(e?.response?.data?.detail ?? e?.message ?? "인분 변환 실패");
    }
  };

  const onConvertUnits = async () => {
    if (!recipe) return;

    const units: Record<number, string> = {};
    (ingredientsDraft.length ? ingredientsDraft : recipe.ingredients ?? []).forEach((it) => {
      const sel = unitSelections[it.ingredient_id];
      if (sel) units[it.ingredient_id] = sel;
    });

    try {
      setErrMsg("");
      const converted: RecipeDetail = await convertRecipeUnits(recipe.id, { units });
      setRecipe(converted);

      setIngredientsDraft(
        (converted.ingredients ?? []).map((x) => ({
          ingredient_id: x.ingredient_id,
          name: x.name,
          quantity: x.quantity,
          unit_name: x.unit_name,
        }))
      );

      const newUnits: Record<number, string> = {};
      (converted.ingredients ?? []).forEach((it) => {
        newUnits[it.ingredient_id] = it.unit_name;
      });
      setUnitSelections(newUnits);
      setUnitDirty(false);
    } catch (e: any) {
      console.error(e);
      setErrMsg(e?.response?.data?.detail ?? e?.message ?? "단위 변환 실패");
    }
  };

  const setIngredientQuantity = (idx: number, quantity: number) => {
    setIngredientsDraft((prev) => prev.map((it, i) => (i === idx ? { ...it, quantity } : it)));
  };

  const setIngredientUnit = (idx: number, unit_name: string) => {
    setIngredientsDraft((prev) => prev.map((it, i) => (i === idx ? { ...it, unit_name } : it)));
  };

  const removeIngredient = (idx: number) => {
    setIngredientsDraft((prev) => prev.filter((_, i) => i !== idx));
    setIngSuggest({});
    setIngSuggestOpen({});
    setIngSuggestLoading({});
  };

  const addIngredient = () => {
    const newId = -Date.now();
    setIngredientsDraft((prev) => {
      const newIdx = prev.length;
      setIngSuggestOpen((m) => ({ ...m, [newIdx]: true }));
      setTimeout(() => ingNameRefs.current[newIdx]?.focus(), 0);

      return [...prev, { ingredient_id: newId, name: "", quantity: 0, unit_name: "" }];
    });
  };

  const setStepDescription = (idx: number, desc: string) => {
    setStepsDraft((prev) => prev.map((s, i) => (i === idx ? { ...s, description: desc } : s)));
  };

  const addStep = () => {
    setStepsDraft((prev) =>
      normalizeSteps([...prev, { step_order: prev.length + 1, description: "", image_urls: [] }])
    );
  };

  const removeStep = (idx: number) => {
    const removedOrder = stepsDraft[idx]?.step_order;
    setStepsDraft((prev) => normalizeSteps(prev.filter((_, i) => i !== idx)));
    if (removedOrder) {
      setStepFiles((prev) => {
        const n = { ...prev };
        delete n[removedOrder];
        return n;
      });
    }
  };

  if (loading) return <div className={style.container}>로딩중...</div>;
  if (errMsg) return <div className={style.container}>{errMsg}</div>;
  if (!recipe) return <div className={style.container}>데이터 없음</div>;

  return (
    <div className={style.container}>
      <div className={style.banner}>
        <img
          src="/backstep_white_background.png"
          className={style.backstep}
          alt="back"
          onClick={onClickBack}
        />

        {!isEdit ? (
          <button className={style.modifyBtn} onClick={() => nav(`/recipe/${recipeId}/edit`)}>
            수정하기
          </button>
        ) : null}
      </div>

      {/* 제목 */}
      {!isEdit ? (
        <div className={style.foodTitle}>{recipe.title}</div>
      ) : (
        <input
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          style={{ marginTop: 20, marginBottom: 12, width: "80%" }}
        />
      )}
      {/* 썸네일 (view 모드) */}
      {!isEdit && recipe?.thumbnail_url && (
        <img
          src={recipe.thumbnail_url}
          alt="thumbnail"
          style={{
            width: "90%",
            maxWidth: 420,
            borderRadius: 12,
            marginBottom: 16,
            objectFit: "cover",
          }}
        />
      )}

      {/* 썸네일(편집일 때만 업로드) */}
      {isEdit && (
        <div style={{ width: "90%", display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 120, fontWeight: 700 }}>썸네일</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {recipe.thumbnail_url ? (
              <img
                src={recipe.thumbnail_url}
                alt="thumb"
                style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 10 }}
              />
            ) : (
              <div
                style={{
                  width: 140,
                  height: 90,
                  borderRadius: 10,
                  border: "1px dashed #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                }}
              >
                없음
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
            />
            {thumbnailFile && <div style={{ fontSize: 12 }}>{thumbnailFile.name}</div>}
          </div>
        </div>
      )}

    {/* 썸네일 삭제 */}
    {isEdit && recipe.thumbnail_url && (
      <button
        type="button"
        onClick={async () => {
          if (!confirm("썸네일을 삭제할까요?")) return;
          await deleteThumbnail(recipe.id);
          const fresh = await getRecipeDetail(recipe.id);
          setRecipe(fresh);
        }}
      >
        썸네일 삭제
      </button>
    )}


      {/* 음식 설명 */}
      <div className={style.foodDescription}>음식 설명</div>
      {!isEdit ? (
        <div style={{ marginBottom: 18, whiteSpace: "pre-wrap" }}>
          {(recipe.description ?? "").toString()}
        </div>
      ) : (
        <textarea
          value={descDraft}
          onChange={(e) => setDescDraft(e.target.value)}
          placeholder="음식 설명을 입력하세요"
          style={{ width: "90%", minHeight: 90, marginBottom: 18 }}
        />
      )}

      {/* 인분 */}
      <div className={style.portionBody}>
        {!isEdit ? (
          <div>기준 인분: {recipe.base_serving}인분</div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>기준 인분:</div>
            <input
              type="number"
              min={1}
              value={baseServingDraft}
              onChange={(e) => setBaseServingDraft(Number(e.target.value))}
              style={{ width: 80 }}
            />
            <div>인분</div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="number"
            min={1}
            value={servingsInput}
            onChange={(e) => setServingsInput(Number(e.target.value))}
            style={{ width: 70 }}
          />
          <button onClick={onScaleServings}>변경하기</button>
        </div>
      </div>

      <div className={style.line}></div>
      <div className={style.line}></div>

      {/* 재료 */}
      <div className={style.ingredientBody}>
        <div className={style.ingredientHeader}>
          <div className={style.ingredientTitle}>재료</div>

          <button
            className={style.applyUnitBtn}
            onClick={onConvertUnits}
            disabled={!ingredientsView.length || !unitDirty}
            title="선택한 단위를 적용해요"
          >
            단위 적용
          </button>
        </div>

        <table className={style.table}>
          <thead>
            <tr>
              <th>재료</th>
              <th>숫자</th>
              <th>단위</th>
              {isEdit && <th></th>}
            </tr>
          </thead>

          <tbody>
            {ingredientsView.map((item, idx) => {
              const isConfirmed = item.ingredient_id > 0;
              const units = allowedUnits[item.ingredient_id] ?? [];
              const unitValue =
                unitSelections[item.ingredient_id] ??
                (isEdit ? ingredientsDraft[idx]?.unit_name : item.unit_name) ??
                item.unit_name;

              return (
                <tr key={item.ingredient_id}>
                  <td style={{ position: "relative" }}>
                    {!isEdit ? (
                      item.name
                    ) : (
                      <>
                        <input
                          ref={(el) => (ingNameRefs.current[idx] = el)}
                          value={ingredientsDraft[idx]?.name ?? ""}
                          onChange={(e) => onChangeIngredientName(idx, e.target.value)}
                          onFocus={() => setIngSuggestOpen((prev) => ({ ...prev, [idx]: true }))}
                          onBlur={() => {
                            setTimeout(() => {
                              setIngSuggestOpen((prev) => ({ ...prev, [idx]: false }));
                            }, 120);
                          }}
                          style={{ width: 160 }}
                        />

                        {ingSuggestOpen[idx] &&
                        ((ingSuggest[idx]?.length ?? 0) > 0 || ingSuggestLoading[idx]) ? (
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              zIndex: 50,
                              width: 200,
                              background: "white",
                              border: "1px solid #ddd",
                              borderRadius: 10,
                              maxHeight: 180,
                              overflowY: "auto",
                            }}
                          >
                            {ingSuggestLoading[idx] ? (
                              <div style={{ padding: 10 }}>검색중...</div>
                            ) : (
                              (ingSuggest[idx] ?? []).map((it) => (
                                <div
                                  key={it.id}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => onPickIngredient(idx, it)}
                                  style={{ padding: 10, cursor: "pointer" }}
                                >
                                  {it.name}
                                </div>
                              ))
                            )}
                          </div>
                        ) : null}
                      </>
                    )}
                  </td>

                  <td>
                    {!isEdit ? (
                      item.quantity
                    ) : (
                      <input
                          type="number"
                          value={ingredientsDraft[idx]?.quantity ?? 0}
                          onChange={(e) =>
                            setIngredientQuantity(idx, Number(e.target.value))
                          }
                          onBlur={(e) => {
                            const v = Number(e.target.value);
                            // NaN 방지 + 앞자리 0 정리
                            setIngredientQuantity(idx, Number.isNaN(v) ? 0 : v);
                          }}
                          min={0}
                          style={{ width: 64 }}
                        />

                    )}
                  </td>

                  <td>
                    <select
                      value={unitValue ?? ""}
                      disabled={!isConfirmed || units.length === 0}
                      onChange={(e) => {
                        const v = e.target.value;
                        setUnitSelections((prev) => ({ ...prev, [item.ingredient_id]: v }));
                        setUnitDirty(true);
                        if (isEdit) setIngredientUnit(idx, v);
                      }}
                      style={{ width: 90 }}
                      title={!isConfirmed ? "재료를 먼저 선택해줘" : undefined}
                    >
                      {!isConfirmed ? (
                        <option value="">선택 후 단위</option>
                      ) : units.length ? (
                        units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))
                      ) : (
                        <option value="">단위 없음</option>
                      )}
                    </select>
                  </td>

                  {isEdit && (
                    <td>
                      <button onClick={() => removeIngredient(idx)}>삭제</button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {isEdit && (
          <button className={style.addRowBtn} onClick={addIngredient} type="button">
            <span className={style.addRowPlus}>+</span>
            재료 추가하기
          </button>
        )}

        {isEdit && hasUnconfirmedIngredient && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            확정되지 않은 재료가 있습니다. 드롭다운에서 선택해야 저장됩니다.
          </div>
        )}
      </div>

      <div className={style.line}></div>
      <div className={style.line}></div>

      {/* 레시피 단계 */}
      <div className={style.recipeTitle}>레시피</div>

      <div className={style.recipeBody}>
        {stepsView.map((s: any, idx) => {
          const order = s.step_order as number;
          const picked = stepFiles[order] ?? [];

          return (
            <div className={style.recipeItem} key={order}>
              <div className={style.photoBox}>
                <div className={style.number}>{order}</div>

                {!isEdit ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 8 }}>
                    {(s.image_urls ?? []).map((url: string) => (
                      <img
                        key={url}
                        src={url}
                        alt="step"
                        style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8 }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={style.stepImageArea}>

                  {/* 서버 이미지 or 교체 preview (둘 중 하나만) */}
{picked.length === 0 ? (
  <div className={style.stepImageList}>
    {recipe.steps
      .find((st) => st.step_order === order)
      ?.images?.map((img) => (
        <div key={img.id} className={style.stepImageItem}>
          <img src={img.image_url} className={style.stepThumb} alt="step" />

          {/* 개별 삭제 버튼 */}
          <button
            type="button"
            className={style.stepImageDelete}
            onClick={async () => {
              if (!confirm("이 이미지를 삭제할까요?")) return;
              await deleteStepImage(recipe.id, order, img.id);
              const fresh = await getRecipeDetail(recipe.id);
              setRecipe(fresh);
            }}
          >
            ×
          </button>
        </div>
      ))}
  </div>
) : (
  <div className={style.stepImagePreview}>
  <div className={style.stepImageItem}>
    <img
      src={URL.createObjectURL(picked[0])}
      className={style.stepThumb}
      alt="preview"
    />

    {/* ✅ 선택한 이미지 취소 버튼 */}
    <button
      type="button"
      className={style.stepImageDelete}
      onClick={() => {
        setStepFiles((prev) => {
          const n = { ...prev };
          delete n[order];   // 🔥 picked 제거
          return n;
        });
      }}
    >
      ×
    </button>
  </div>
</div>

)}


                  {/* 3. 기존 UI 그대로: 이미지 추가 */}
                  <input
                    id={`step-file-${order}`}
                    className={style.stepFileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      setStepFiles((prev) => ({ ...prev, [order]: files }));
                    }}
                  />

                  {picked.length === 0 &&
                  recipe.steps.find((st) => st.step_order === order)?.images?.length === 0 && (
                    <label htmlFor={`step-file-${order}`} className={style.stepImageBtn}>
                      <span className={style.stepPlus}>+</span>
                      <span className={style.stepAddText}>이미지 추가</span>
                    </label>
                )}


                </div>


                )}
            
              </div>

              {!isEdit ? (
                <div className={style.textBox}>{s.description}</div>
              ) : (
                <div style={{ width: "100%" }}>
                  <textarea
                    className={style.textBox}
                    value={stepsDraft[idx]?.description ?? ""}
                    onChange={(e) => setStepDescription(idx, e.target.value)}
                    style={{ width: "100%" }}
                  />
                 
<div className={style.stepActionRow}>
    <button
    type="button"
    className={style.stepImageReplaceBtn}
    onClick={() => {
      document.getElementById(`step-file-${order}`)?.click();
    }}
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
              )}
            </div>
          );
        })}

        {/* 단계들 맨 아래에 1번만 */}
        {isEdit && (
          <button className={style.addRowBtn} onClick={addStep} type="button">
            <span className={style.addRowPlus}>+</span>
            단계 추가하기
          </button>
        )}
      </div>

    
      <div className={style.line}></div>
      <div className={style.line}></div>

      {/* 하단 액션바 */}
      {isEdit && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "white",
            borderTop: "1px solid #eee",
            padding: "12px 10px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            zIndex: 60,
          }}
        >
          <button className={style.actionBtn} onClick={() => nav(`/recipe/${recipe.id}`)}>
            취소
          </button>
          <button className={style.actionBtn} onClick={onDelete}>
            삭제
          </button>
          <button
            className={style.actionBtn}
            onClick={onSave}
            disabled={saving || hasUnconfirmedIngredient}
            title={hasUnconfirmedIngredient ? "확정되지 않은 재료가 있어 저장할 수 없음" : undefined}
          >
             {saving ? "저장중..." : "저장하기"}
          </button>
        </div>
      )}

      {!isEdit && (
        <button className={style.recipeDelete} onClick={onDelete}>
          레시피 삭제하기
        </button>
      )}
    </div>
  );
}
