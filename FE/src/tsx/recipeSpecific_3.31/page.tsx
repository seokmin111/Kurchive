"use client";

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
    unit_type: UnitType;
  }[];
};

type UnitType = "mass" | "volume" | "count" | "misc";

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

export default function RecipeSpecific({ mode }: { mode: "view" | "edit" }) {
  const [saving, setSaving] = useState(false);
  const ingNameRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { recipeId } = useParams();
  const nav = useNavigate();

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [isEdit, setIsEdit] = useState(mode === "edit");

  // ✅ 권한 확인 및 즐겨찾기용 상태
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [isZzim, setIsZzim] = useState(false);

  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const[baseServingDraft, setBaseServingDraft] = useState<number>(1);
  const [ingredientsDraft, setIngredientsDraft] = useState<DraftIngredient[]>([]);
  const [stepsDraft, setStepsDraft] = useState<DraftStep[]>([]);

  const [servingsInput, setServingsInput] = useState<number>(2);

  const [unitSelections, setUnitSelections] = useState<Record<number, string>>({});
  const[allowedUnits, setAllowedUnits] = useState<Record<number, string[]>>({});
  const[unitDirty, setUnitDirty] = useState(false);

  const [ingSuggest, setIngSuggest] = useState<Record<string, IngredientSuggestItem[]>>({});
  const [ingSuggestOpen, setIngSuggestOpen] = useState<Record<string, boolean>>({});
  const [ingSuggestLoading, setIngSuggestLoading] = useState<Record<string, boolean>>({});
  const debounceTimersRef = useRef<Map<string, any>>(new Map());

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [stepFiles, setStepFiles] = useState<Record<number, File[]>>({});

  useEffect(() => {
    setIsEdit(mode === "edit");
    if (mode === "edit") {
      setSaving(false);
    }
  }, [mode]);

  const stepsSorted = useMemo(() => {
    return (recipe?.steps ??[]).slice().sort((a, b) => a.step_order - b.step_order);
  }, [recipe]);

  const ingredientsView = isEdit ? ingredientsDraft : recipe?.ingredients ??[];
  const stepsView = isEdit ? stepsDraft : stepsSorted;

  const normalizeSteps = (steps: DraftStep[]) =>
    steps.map((s, i) => ({ ...s, step_order: i + 1 }));

  // ✅ 1. 내 정보 로드 (수정 권한 확인용)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    client.get("/mypage")
      .then((res) => setCurrentUser(res.data.data || res.data))
      .catch(() => {});
  },[]);

  // ✅ 2. 찜하기 상태 로드
  useEffect(() => {
  const token = localStorage.getItem("access_token");
  if (!token) return;   // 🔥 이 줄 추가

  const id = Number(recipeId);
  if (!id || Number.isNaN(id)) return;

  client.get(`/recipe/${id}/favorite`)
    .then((res) => setIsZzim(res.data.is_favorite))
    .catch(() => {});
}, [recipeId]);

  // ✅ 3. 즐겨찾기 토글 (하트 누를 때)
  const toggleFavorite = async () => {
    try {
      const res = await client.post(`/recipe/${recipeId}/favorite`);
      setIsZzim(res.data.is_favorite);
    } catch (e) {
      console.error(e);
      alert("즐겨찾기 상태를 변경할 수 없습니다.");
    }
  };

  // ✅ 4. 수정/삭제 권한 체크
  const canEdit = useMemo(() => {
    if (!currentUser || !recipe) return false;

    const myId = currentUser.id || currentUser.user_id;
    const uploaderId = recipe.uploader_id;

    const authorCheck =
      myId !== undefined &&
      uploaderId !== undefined &&
      String(myId) === String(uploaderId);

    const adminCheck =
      currentUser.is_admin === 1 ||
      currentUser.is_admin === true ||
      currentUser.role === "admin" ||
      currentUser.role === "staff";

    return authorCheck || adminCheck;
  }, [currentUser, recipe]);

  // 레시피 데이터 로드
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
          (data.ingredients ??[]).map((x) => ({
            local_id: crypto.randomUUID(),
            ingredient_id: x.ingredient_id,
            name: x.name,
            quantity: x.quantity,
            unit_name: x.unit_name,
            unit_type: x.unit_type as UnitType,
            is_existing: true,
          }))
        );
        setStepsDraft(
          (data.steps ??[])
            .slice()
            .sort((a, b) => a.step_order - b.step_order)
            .map((s) => ({
              step_order: s.step_order,
              description: s.description,
              image_urls: s.image_urls ??[],
            }))
        );

        setServingsInput(data.base_serving);

        const initUnits: Record<number, string> = {};
        (data.ingredients ??[]).forEach((it) => {
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

  useEffect(() => {
    const src = ingredientsDraft;
    if (!src.length) return;

    (async () => {
      const map: Record<number, string[]> = {};

      for (const ing of src) {
        if (ing.ingredient_id < 0) {
          map[ing.ingredient_id] =[];
          continue;
        }
        try {
          const data = await getIngredientUnitsByName(ing.name);
          const units = (data.units ??[]).filter(Boolean);
          map[ing.ingredient_id] = units;
        } catch {
          map[ing.ingredient_id] =[];
        }
      }

      setAllowedUnits(map);
    })();
  }, [recipe, ingredientsDraft]);

 useEffect(() => {
  if (!loading && isEdit && !canEdit) {
    alert("수정 권한이 없습니다.");
    nav(`/recipe/${recipeId}`);
  }
}, [loading, isEdit, canEdit]);
  // 재료

  const onClickBack = () => nav(-1);

  const defaultUnitMap: Record<UnitType, string[]> = {
    mass: ["g", "kg"],
    volume: ["ml", "L"],
    count: ["개"],
    misc:[],
  };

  const onChangeIngredientName = (idx: number, v: string) => {
    const localId = ingredientsDraft[idx].local_id;

    setIngredientsDraft((prev) =>
      prev.map((it, i) =>
        i === idx
          ? {
              ...it,
              name: v,
              ingredient_id: -1,
              unit_name: "",
              unit_type: "mass",
              is_existing: false,
            }
          : it
      )
    );

    setIngSuggestOpen((prev) => ({ ...prev, [localId]: true }));

    const prevT = debounceTimersRef.current.get(localId);
    if (prevT) clearTimeout(prevT);

    const t = setTimeout(async () => {
      const q = v.trim();
      if (!q) {
        setIngSuggest((prev) => ({ ...prev, [localId]:[] }));
        return;
      }

      setIngSuggestLoading((prev) => ({ ...prev, [localId]: true }));

      try {
        const items = await searchIngredients(q, 8);
        setIngSuggest((prev) => ({ ...prev, [localId]: items }));
      } catch {
        setIngSuggest((prev) => ({ ...prev, [localId]:[] }));
      } finally {
        setIngSuggestLoading((prev) => ({ ...prev, [localId]: false }));
      }
    }, 250);

    debounceTimersRef.current.set(localId, t);
  };

  const onPickIngredient = async (idx: number, pick: IngredientSuggestItem) => {
    const localId = ingredientsDraft[idx].local_id;

    const u = await getIngredientUnitsByName(pick.name);
    const first = (u.units ?? [])[0] ?? "";

    setIngredientsDraft((prev) =>
      prev.map((it, i) =>
        i === idx
          ? {
              ...it,
              ingredient_id: pick.id,
              name: pick.name,
              unit_name: first,
              unit_type: (pick.unit_type as UnitType) ?? "mass",
              is_existing: true,
            }
          : it
      )
    );

    setAllowedUnits((prev) => ({ ...prev, [pick.id]: u.units ??[] }));
    setUnitSelections((prev) => ({ ...prev, [pick.id]: first }));
    setIngSuggestOpen((prev) => ({ ...prev, [localId]: false }));
  };

  const onSave = async () => {
    if (!recipe) return;
    if (saving) return;

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
          .filter((x) => x.name?.trim())
          .map((x) => ({
            ingredient_id: x.ingredient_id > 0 ? x.ingredient_id : undefined,
            name: x.name,
            unit_type: x.unit_type,  
            quantity: Number(x.quantity),
            unit_name: x.unit_name,
          })),
        steps: stepsDraft.map((s) => ({
          step_order: s.step_order,
          description: s.description,
          image_urls: s.image_urls ??[],
        })),
      };

      const updated: RecipeDetail = await updateRecipe(recipe.id, body);

      if (thumbnailFile) {
        await replaceThumbnail(updated.id, thumbnailFile);
      }

      for (const s of stepsDraft) {
        const files = stepFiles[s.step_order];
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
        fresh.ingredients.map((x) => ({
          local_id: crypto.randomUUID(),
          ingredient_id: x.ingredient_id,
          name: x.name,
          quantity: x.quantity,
          unit_name: x.unit_name,
          unit_type: x.unit_type as UnitType,
          is_existing: true,
        }))
      );

      setStepsDraft(
        (fresh.steps ??[])
          .slice()
          .sort((a, b) => a.step_order - b.step_order)
          .map((s) => ({
            step_order: s.step_order,
            description: s.description,
            image_urls: s.image_urls ??[],
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
        (scaled.ingredients ??[]).map((x) => ({
          local_id: crypto.randomUUID(),
          ingredient_id: x.ingredient_id,
          name: x.name,
          quantity: x.quantity,
          unit_name: x.unit_name,
          unit_type: x.unit_type as UnitType,
          is_existing: true,
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
    (ingredientsDraft.length ? ingredientsDraft : recipe.ingredients ??[]).forEach((it) => {
      const sel = unitSelections[it.ingredient_id];
      if (sel) units[it.ingredient_id] = sel;
    });

    try {
      setErrMsg("");
      const converted: RecipeDetail = await convertRecipeUnits(recipe.id, { units });
      setRecipe(converted);

      setIngredientsDraft(
        (converted.ingredients ??[]).map((x) => ({
          local_id: crypto.randomUUID(),
          ingredient_id: x.ingredient_id,
          name: x.name,
          quantity: x.quantity,
          unit_name: x.unit_name,
          unit_type: x.unit_type as UnitType,
          is_existing: true,
        }))
      );

      const newUnits: Record<number, string> = {};
      (converted.ingredients ??[]).forEach((it) => {
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
    const localId = crypto.randomUUID();

    setIngredientsDraft((prev) =>[
      ...prev,
      {
        local_id: localId,
        ingredient_id: -1,
        name: "",
        quantity: 0,
        unit_name: "g",
        unit_type: "mass",
        is_existing: false,
      },
    ]);

    setTimeout(() => {
      const idx = ingredientsDraft.length;
      ingNameRefs.current[idx]?.focus();
    }, 0);

    setIngSuggestOpen((m) => ({ ...m, [localId]: true }));
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
      {/* ===== 헤더 및 우측 버튼 ===== */}
      <div className={style.banner}>
        <img
          src="/backstep_white_white_background.png"
          className={style.backstep}
          alt="back"
          onClick={onClickBack}
        />

        {!isEdit && (
          <div className={style.rightActions}>
            {canEdit && (
              <button
                className={style.actionIconBtn}
                onClick={() => nav(`/recipe/${recipeId}/edit`)}
                title="수정하기"
              >
                ✏️
              </button>
            )}
            <button
              className={style.actionIconBtn}
              onClick={toggleFavorite}
              title="찜하기"
            >
              {isZzim ? "❤️" : "🤍"}
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
              <th>타입</th>
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
                <tr key={item.local_id}>
                  <td className={style.ingCell}>
                    {!isEdit ? (
                      item.name
                    ) : (
                      <>
                        <input
                          ref={(el) => (ingNameRefs.current[idx] = el)}
                          value={ingredientsDraft[idx]?.name ?? ""}
                          onChange={(e) => onChangeIngredientName(idx, e.target.value)}
                          onFocus={() =>
                            setIngSuggestOpen((prev) => ({
                              ...prev,
                              [ingredientsDraft[idx].local_id]: true,
                            }))
                          }
                          style={{ width: 160 }}
                        />
                        {ingSuggestOpen[item.local_id] && (
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
                            {ingSuggestLoading[item.local_id] ? (
                              <div style={{ padding: 10 }}>검색중...</div>
                            ) : (
                              (ingSuggest[item.local_id] ??[]).map((it) => (
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
                        )}
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
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          setIngredientQuantity(idx, Number.isNaN(v) ? 0 : v);
                        }}
                        min={0}
                        style={{ width: 64 }}
                      />
                    )}
                  </td>
                  <td>
                    <select
                      value={
                        item.ingredient_id > 0
                          ? (unitSelections[item.ingredient_id] ?? item.unit_name)
                          : item.unit_name
                      }
                      disabled={item.ingredient_id > 0 ? (allowedUnits[item.ingredient_id]?.length ?? 0) === 0 : false}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (item.ingredient_id > 0) {
                          setUnitSelections((prev) => ({ ...prev, [item.ingredient_id]: v }));
                          setUnitDirty(true);
                        }
                        setIngredientsDraft((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, unit_name: v } : it))
                        );
                      }}
                    >
                      {item.ingredient_id > 0
                        ? (allowedUnits[item.ingredient_id] ??[]).map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))
                        : (defaultUnitMap[item.unit_type] ??[]).map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                    </select>
                  </td>
                  <td>
                    {item.is_existing ? (
                      <span>
                        {item.unit_type === "mass" && "질량"}
                        {item.unit_type === "volume" && "부피"}
                        {item.unit_type === "count" && "개수"}
                        {item.unit_type === "misc" && "기타"}
                      </span>
                    ) : (
                      <select
                        value={item.unit_type}
                        onChange={(e) =>
                          setIngredientsDraft((prev) =>
                            prev.map((it, i) =>
                              i === idx
                                ? {
                                    ...it,
                                    unit_type: e.target.value as UnitType,
                                    unit_name: defaultUnitMap[e.target.value as UnitType][0] ?? "",
                                  }
                                : it
                            )
                          )
                        }
                      >
                        <option value="mass">질량</option>
                        <option value="volume">부피</option>
                        <option value="count">개수</option>
                      </select>
                    )}
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
      </div>

      <div className={style.line}></div>
      <div className={style.line}></div>

      {/* 레시피 단계 */}
      <div className={style.recipeTitle}>레시피</div>

      <div className={style.recipeBody}>
        {stepsView.map((s: any, idx) => {
          const order = s.step_order as number;
          const picked = stepFiles[order] ??[];

          return (
            <div className={style.recipeItem} key={order}>
              <div className={style.photoBox}>
                <div className={style.number}>{order}</div>

                {!isEdit ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: 8 }}>
                    {(s.image_urls ??[]).map((url: string) => (
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
                    {picked.length === 0 ? (
                      <div className={style.stepImageList}>
                        {recipe.steps
                          .find((st) => st.step_order === order)
                          ?.images?.map((img) => (
                            <div key={img.id} className={style.stepImageItem}>
                              <img src={img.image_url} className={style.stepThumb} alt="step" />
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
                          <button
                            type="button"
                            className={style.stepImageDelete}
                            onClick={() => {
                              setStepFiles((prev) => {
                                const n = { ...prev };
                                delete n[order];
                                return n;
                              });
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}

                    <input
                      id={`step-file-${order}`}
                      className={style.stepFileInput}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files ??[]);
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
          <button className={style.actionBtn} onClick={onSave} disabled={saving}>
             {saving ? "저장중..." : "저장하기"}
          </button>
        </div>
      )}

      {/* ✅ 삭제 버튼도 권한(canEdit)이 있는 경우에만 표시되게 개선 */}
      {!isEdit && canEdit && (
        <div
          style={{
            marginTop: 30,
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: "#8B0029",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={onDelete}
          >
            삭제하기
          </button>
        </div>
      )}
    </div>
  );
}