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
} from "../../api/recipe";

type RecipeDetail = {
  id: number;
  title: string;
  base_serving: number;
  uploader_id: number;
  created_at: string;
  thumbnail_url?: string | null;

  // (BE에 없어도 FE에서 안전하게 다룸: 없으면 그냥 "" 처리)
  description?: string | null;

  steps: { step_order: number; description: string; image_urls?: string[] }[];
  ingredients: {
    ingredient_id: number;
    name: string;
    quantity: number;
    unit_name: string;
  }[];
};

type DraftIngredient = {
  ingredient_id: number;
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
  const ingNameRefs = useRef<Array<HTMLInputElement | null>>([]);

  const { recipeId } = useParams();
  const nav = useNavigate();

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // 편집모드: /edit 라우트면 true
  const [isEdit, setIsEdit] = useState(mode === "edit");

  // Draft들(저장 payload의 원천)
  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [baseServingDraft, setBaseServingDraft] = useState<number>(1);
  const [ingredientsDraft, setIngredientsDraft] = useState<DraftIngredient[]>([]);
  const [stepsDraft, setStepsDraft] = useState<DraftStep[]>([]);

  // 인분 변경 UI (scale API용)
  const [servingsInput, setServingsInput] = useState<number>(2);

  // 단위 선택/허용 단위
  const [unitSelections, setUnitSelections] = useState<Record<number, string>>({});
  const [allowedUnits, setAllowedUnits] = useState<Record<number, string[]>>({});
  const [unitDirty, setUnitDirty] = useState(false);

  // ============================================================
  // 재료 자동완성(행 인덱스 기준)
  // ============================================================
  const [ingSuggest, setIngSuggest] = useState<Record<number, IngredientSuggestItem[]>>({});
  const [ingSuggestOpen, setIngSuggestOpen] = useState<Record<number, boolean>>({});
  const [ingSuggestLoading, setIngSuggestLoading] = useState<Record<number, boolean>>({});
  const debounceTimersRef = useRef<Map<number, any>>(new Map());

  // ============================================================
  // 단계 이미지 URL 추가(행 인덱스 기준)
  // ============================================================
  const [stepImageUrlInput, setStepImageUrlInput] = useState<Record<number, string>>({});

  // mode가 바뀌면 편집모드도 동기화
  useEffect(() => {
    setIsEdit(mode === "edit");
  }, [mode]);

  // 보기용 steps 정렬
  const stepsSorted = useMemo(() => {
    return (recipe?.steps ?? []).slice().sort((a, b) => a.step_order - b.step_order);
  }, [recipe]);

  // 화면 렌더링 데이터 소스: edit이면 draft를 보여줌
  const ingredientsView = isEdit ? ingredientsDraft : recipe?.ingredients ?? [];
  const stepsView = isEdit ? stepsDraft : stepsSorted;

  // step_order 1..N 재정렬
  const normalizeSteps = (steps: DraftStep[]) =>
    steps.map((s, i) => ({ ...s, step_order: i + 1 }));

  // 초기 데이터 로드
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

        // draft 초기화
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

        // 인분 input 기본값
        setServingsInput(data.base_serving);

        // 단위 선택 기본값
        const initUnits: Record<number, string> = {};
        (data.ingredients ?? []).forEach((it) => {
          initUnits[it.ingredient_id] = it.unit_name;
        });
        setUnitSelections(initUnits);
        setUnitDirty(false);
      } catch (e: any) {
        console.error(e);
        setErrMsg(e?.response?.data?.detail ?? e?.message ?? "불러오기 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, [recipeId]);

  // allowedUnits 로드: 현재 재료 기준
  useEffect(() => {
    const DEFAULT_UNITS: Record<string, string[]> = {
      mass: ["g", "kg"],
      volume: ["ml", "L"],
      count: ["개"],
      misc: [],
    };
    const src = ingredientsDraft.length ? ingredientsDraft : recipe?.ingredients ?? [];
    if (!src.length) return;

    (async () => {
      const map: Record<number, string[]> = {};
      for (const ing of src) {
        try {
          if (!ing.name?.trim()) {
            map[ing.ingredient_id] = ing.unit_name ? [ing.unit_name] : DEFAULT_UNITS.mass;
            continue;
          }

          const data = await getIngredientUnitsByName(ing.name);
          const units = (data.units ?? []).filter(Boolean);

          // ✅ 비어있으면 기본값
          map[ing.ingredient_id] = units.length ? units : DEFAULT_UNITS.mass;
        } catch (e) {
          // ✅ 실패해도 기본값
          map[ing.ingredient_id] = DEFAULT_UNITS.mass;
        }
      }
      setAllowedUnits(map);
    })();
  }, [recipe, ingredientsDraft]);

  const onClickBack = () => nav(-1);

  // ============================================================
  // 재료 자동완성 핸들러
  // ============================================================
  const onChangeIngredientName = (idx: number, v: string) => {
    setIngredientsDraft((prev) => prev.map((it, i) => (i === idx ? { ...it, name: v } : it)));

    // 입력 중에는 ingredient_id를 “선택된 재료”로 확정하지 않음 (기존 id 유지)
    // 만약 사용자가 기존 재료를 타이핑으로 바꾸면, 저장 시 name 기반으로 생성되게 하고 싶으면
    // 아래처럼 id를 임시 음수로 바꿔도 됨. (원하면 이 라인 주석 해제)
    // setIngredientsDraft(prev => prev.map((it,i)=> i===idx ? {...it, ingredient_id: it.ingredient_id>0 ? -Date.now() : it.ingredient_id} : it));

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
      i === idx
        ? {
            ...it,
            ingredient_id: pick.id,
            name: pick.name,
            // unit_name 비어있으면 임시로 넣어두기(나중에 allowedUnits 로드되면 사용자가 바꿀 수 있음)
            unit_name: it.unit_name || (allowedUnits[pick.id]?.[0] ?? it.unit_name),
          }
        : it
    )
  );

  // 단위 select 값도 같이 맞추기
  const fallbackUnit = allowedUnits[pick.id]?.[0];
  if (fallbackUnit) {
    setUnitSelections((prev) => ({ ...prev, [pick.id]: fallbackUnit }));
    setUnitDirty(true);
  }

  setIngSuggestOpen((prev) => ({ ...prev, [idx]: false }));
};


  // ============================================================
  // 저장
  // ============================================================
  const onSave = async () => {
    if (!recipe) return;

    try {
      setErrMsg("");

      const body = {
        title: titleDraft.trim(),
        base_serving: baseServingDraft,
        description: descDraft, // BE가 아직 없으면 무시될 수 있음
        ingredients: ingredientsDraft.map((x) => {
          const isTemp = x.ingredient_id < 0;
          return {
            ...(isTemp ? { name: x.name?.trim() } : { ingredient_id: x.ingredient_id }),
            quantity: Number(x.quantity),
            unit_name: x.unit_name,
          };
        }),
        steps: stepsDraft.map((s) => ({
          step_order: s.step_order,
          description: s.description,
          image_urls: s.image_urls ?? [],
        })),
      };

      const updated: RecipeDetail = await updateRecipe(recipe.id, body);
      setRecipe(updated);

      // 저장 후 view로 이동 (프로젝트 라우팅이 /recipe 라면 여기 바꿔야 함)
      nav(`/recipe/${updated.id}`);

      // 단위 상태 동기화
      const newUnits: Record<number, string> = {};
      (updated.ingredients ?? []).forEach((it) => {
        newUnits[it.ingredient_id] = it.unit_name;
      });
      setUnitSelections(newUnits);
      setUnitDirty(false);

      setServingsInput(updated.base_serving);
    } catch (e: any) {
      console.error(e);
      const status = e?.response?.status;
      if (status === 403) setErrMsg("작성자만 수정할 수 있어요.");
      else setErrMsg(e?.response?.data?.detail ?? e?.message ?? "수정 실패");
    }
  };

  // 삭제
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

  // 인분 변경 API
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

      // scale 이후 draft도 같이 갱신
      setBaseServingDraft(scaled.base_serving);
      setIngredientsDraft(
        (scaled.ingredients ?? []).map((x) => ({
          ingredient_id: x.ingredient_id,
          name: x.name,
          quantity: x.quantity,
          unit_name: x.unit_name,
        }))
      );

      const newUnits: Record<number, string> = { ...unitSelections };
      (scaled.ingredients ?? []).forEach((it) => {
        if (!newUnits[it.ingredient_id]) newUnits[it.ingredient_id] = it.unit_name;
      });
      setUnitSelections(newUnits);
    } catch (e: any) {
      console.error(e);
      setErrMsg(e?.response?.data?.detail ?? e?.message ?? "인분 변환 실패");
    }
  };

  // 단위 변환 API
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

      // 변환 결과를 draft에 반영 (edit 저장에 반영)
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

  // draft 수정 헬퍼들
  const setIngredientQuantity = (idx: number, quantity: number) => {
    setIngredientsDraft((prev) => prev.map((it, i) => (i === idx ? { ...it, quantity } : it)));
  };

  const setIngredientUnit = (idx: number, unit_name: string) => {
    setIngredientsDraft((prev) => prev.map((it, i) => (i === idx ? { ...it, unit_name } : it)));
  };

  const removeIngredient = (idx: number) => {
    setIngredientsDraft((prev) => prev.filter((_, i) => i !== idx));

    // idx 기반 상태는 꼬이기 쉬워서 통째로 초기화가 안전
    setIngSuggest({});
    setIngSuggestOpen({});
    setIngSuggestLoading({});
  };

  const addIngredient = () => {
      const newId = -Date.now();

      setIngredientsDraft((prev) => {
        const newIdx = prev.length;

        // dropdown 열어두기
        setIngSuggestOpen((m) => ({ ...m, [newIdx]: true }));

        // 렌더 후 포커스
        setTimeout(() => {
          ingNameRefs.current[newIdx]?.focus();
        }, 0);

        return [
          ...prev,
          {
            ingredient_id: newId,
            name: "",
            quantity: 0,
            unit_name: "",
          },
        ];
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
    setStepsDraft((prev) => normalizeSteps(prev.filter((_, i) => i !== idx)));
    setStepImageUrlInput((prev) => {
      const n = { ...prev };
      delete n[idx];
      return n;
    });
  };

  // 단계 이미지 추가/삭제(URL 기반)
  const addStepImageUrl = (idx: number) => {
    const raw = (stepImageUrlInput[idx] ?? "").trim();
    if (!raw) return;

    setStepsDraft((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        const next = Array.from(new Set([...(s.image_urls ?? []), raw]));
        return { ...s, image_urls: next };
      })
    );

    setStepImageUrlInput((prev) => ({ ...prev, [idx]: "" }));
  };

  const removeStepImageUrl = (idx: number, url: string) => {
    setStepsDraft((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        return { ...s, image_urls: (s.image_urls ?? []).filter((u) => u !== url) };
      })
    );
  };

  if (loading) return <div className={style.container}>로딩중...</div>;
  if (errMsg) return <div className={style.container}>{errMsg}</div>;
  if (!recipe) return <div className={style.container}>데이터 없음</div>;

  return (
    <div className={style.container}>
      <div className={style.banner}>
        {/* 뒤로가기 */}
        <img
          src="/backstep_white_background.png"
          className={style.backstep}
          alt="back"
          onClick={onClickBack}
        />

        {/* 수정/저장 */}
        {!isEdit ? (
          <button className={style.modifyBtn} onClick={() => nav(`/recipe/${recipeId}/edit`)}>
            수정하기
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8, marginBottom: 100 }}>
            <button className={style.modifyBtn} onClick={onSave}>
              저장
            </button>
            <button className={style.modifyBtn} onClick={() => nav(`/recipe/${recipe.id}`)}>
              취소
            </button>
          </div>
        )}
      </div>

      {/* 제목 */}
      {!isEdit ? (
        <div className={style.foodTitle}>{recipe.title}</div>
      ) : (
        <input
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          style={{ marginTop: 20, marginBottom: 20, width: "80%" }}
        />
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

        {/* scale */}
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
      {isEdit && (
        <button className={style.applyUnitBtn} onClick={addIngredient}>
          + 재료 추가
        </button>
      )}

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
            {ingredientsView.map((item, idx) => (
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
                          // 클릭 선택을 위해 약간 늦게 닫음
                          setTimeout(() => {
                            setIngSuggestOpen((prev) => ({ ...prev, [idx]: false }));
                          }, 120);
                        }}
                        style={{ width: 120 }}
                      />

                      {ingSuggestOpen[idx] &&
                      ((ingSuggest[idx]?.length ?? 0) > 0 || ingSuggestLoading[idx]) ? (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            zIndex: 50,
                            width: 180,
                            background: "white",
                            border: "1px solid #ddd",
                            borderRadius: 6,
                            maxHeight: 180,
                            overflowY: "auto",
                          }}
                        >
                          {ingSuggestLoading[idx] ? (
                            <div style={{ padding: 8 }}>검색중...</div>
                          ) : (
                            (ingSuggest[idx] ?? []).map((it) => (
                              <div
                                key={it.id}
                                onMouseDown={(e) => e.preventDefault()} // blur 방지
                                onClick={() => onPickIngredient(idx, it)}
                                style={{ padding: 8, cursor: "pointer" }}
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
                      onChange={(e) => setIngredientQuantity(idx, Number(e.target.value))}
                      style={{ width: 70 }}
                    />
                  )}
                </td>

                <td>
                  <select
                    value={
                      unitSelections[item.ingredient_id] ??
                      (isEdit ? ingredientsDraft[idx]?.unit_name : item.unit_name) ??
                      item.unit_name
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      setUnitSelections((prev) => ({ ...prev, [item.ingredient_id]: v }));
                      setUnitDirty(true);
                      if (isEdit) setIngredientUnit(idx, v);
                    }}
                  >
                    {(allowedUnits[item.ingredient_id] ?? (item.unit_name ? [item.unit_name] : []))
                      .filter(Boolean)
                      .map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                  </select>
                </td>

                {isEdit && (
                  <td>
                    <button onClick={() => removeIngredient(idx)}>삭제</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={style.line}></div>
      <div className={style.line}></div>

      {/* 레시피 단계 */}
      <div className={style.recipeTitle}>레시피</div>
      {isEdit && (
        <button className={style.applyUnitBtn} onClick={addStep}>
          + 단계 추가
        </button>
      )}

      <div className={style.recipeBody}>
        {stepsView.map((s: any, idx) => (
          <div className={style.recipeItem} key={s.step_order}>
            <div className={style.photoBox}>
              <div className={style.number}>{s.step_order}</div>

              {/* 이미지 영역 */}
              {!isEdit ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 8 }}>
                  {(s.image_urls ?? []).map((url: string) => (
                    <img
                      key={url}
                      src={url}
                      alt="step"
                      style={{
                        width: 90,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ width: "100%", padding: 8 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(stepsDraft[idx]?.image_urls ?? []).map((url) => (
                      <div key={url} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <img
                          src={url}
                          alt="step"
                          style={{
                            width: 90,
                            height: 90,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                        <button
                          onClick={() => removeStepImageUrl(idx, url)}
                          style={{ fontSize: 12 }}
                        >
                          제거
                        </button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <input
                      value={stepImageUrlInput[idx] ?? ""}
                      onChange={(e) =>
                        setStepImageUrlInput((prev) => ({ ...prev, [idx]: e.target.value }))
                      }
                      placeholder="이미지 URL 붙여넣기"
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => addStepImageUrl(idx)}>추가</button>
                  </div>
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
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <button onClick={() => removeStep(idx)}>단계 삭제</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={style.line}></div>
      <div className={style.line}></div>

      {/* 삭제 */}
      <button className={style.recipeDelete} onClick={onDelete}>
        레시피 삭제하기
      </button>
    </div>
  );
}
