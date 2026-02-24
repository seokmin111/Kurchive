"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import style from "./page.module.css";
import {
  searchIngredients,
  getIngredientUnitsByName,
} from "../../api/ingredient";
import {
  createRecipe,
  replaceThumbnail,
  uploadStepImages,
  getOrCreateIngredient
} from "../../api/recipe";

type DraftIngredient = {
  local_id: string;
  ingredient_id: number;
  name: string;
  quantity: number;
  unit_name: string;
};

type DraftStep = {
  step_order: number;
  description: string;
};

type SuggestItem = {
  id: number;
  name: string;
};

export default function RecipeCreate() {
// state 정의
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [baseServing, setBaseServing] = useState(1);
  const [ingredients, setIngredients] = useState<DraftIngredient[]>([]);
  const [steps, setSteps] = useState<DraftStep[]>([]);
  const [allowedUnits, setAllowedUnits] = useState<Record<number, string[]>>(
    {}
  );

  // 자동완성
  const [suggest, setSuggest] = useState<Record<string, SuggestItem[]>>({});
  const [suggestOpen, setSuggestOpen] = useState<Record<string, boolean>>({});
  const [suggestLoading, setSuggestLoading] = useState<Record<string, boolean>>({});
  const debounceRef = useRef<Map<string, any>>(new Map());
  const [saving, setSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
// 이미지 state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [stepFiles, setStepFiles] = useState<Record<number, File[]>>({});

  useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (!dropdownRef.current) return;

    if (!dropdownRef.current.contains(e.target as Node)) {
      setSuggestOpen({});
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


  // -----------------------------
  // 재료 자동완성
  // -----------------------------
  const handleIngredientBlur = async (idx: number) => {
  const item = ingredients[idx];
  if (!item.name.trim()) return;

  if (item.ingredient_id > 0) return;

  try {
    const created = await getOrCreateIngredient(item.name);

    setIngredients(prev =>
      prev.map((it, i) =>
        i === idx
          ? {
              ...it,
              ingredient_id: created.id,
              unit_name: created.units?.[0] ?? "",  // 기본 단위 자동 세팅
            }
          : it
      )
    );

    setAllowedUnits(prev => ({
      ...prev,
      [created.id]: created.units ?? [],
    }));

  } catch (e) {
    console.error("ingredient 생성 실패", e);
  }
};
  const onChangeIngredientName = (idx: number, value: string) => {
  const localId = ingredients[idx].local_id;

  setIngredients(prev =>
    prev.map((it, i) =>
      i === idx
        ? {
            ...it,
            name: value,
            ingredient_id: it.ingredient_id > 0 ? -1 : it.ingredient_id,
            unit_name: it.ingredient_id > 0 ? "" : it.unit_name,
          }
        : it
    )
  );

  setSuggestOpen(prev => ({ ...prev, [localId]: true }));

  const prevTimer = debounceRef.current.get(localId);
  if (prevTimer) clearTimeout(prevTimer);

  const timer = setTimeout(async () => {
    const q = value.trim();
    if (!q) {
      setSuggest(prev => ({ ...prev, [localId]: [] }));
      return;
    }

    setSuggestLoading(prev => ({ ...prev, [localId]: true }));

    try {
      const items = await searchIngredients(q, 8);
      setSuggest(prev => ({ ...prev, [localId]: items }));
    } catch {
      setSuggest(prev => ({ ...prev, [localId]: [] }));
    } finally {
      setSuggestLoading(prev => ({ ...prev, [localId]: false }));
    }
  }, 250);

  debounceRef.current.set(localId, timer);
};

  const onPickIngredient = async (idx: number, pick: SuggestItem) => {
  const localId = ingredients[idx].local_id;

  const created = await getOrCreateIngredient(pick.name);

  setIngredients(prev =>
    prev.map((it, i) =>
      i === idx
        ? {
            ...it,
            ingredient_id: created.id,
            name: created.name,
            unit_name: created.units?.[0] ?? "",
          }
        : it
    )
  );

  setAllowedUnits(prev => ({
    ...prev,
    [created.id]: created.units ?? [],
  }));

  setSuggestOpen(prev => ({ ...prev, [localId]: false })); // ✅ 수정
};

  // -----------------------------
  // 재료 관리
  // -----------------------------
  const addIngredient = () => {
  const localId = crypto.randomUUID();

  setIngredients(prev => [
    ...prev,
    {
      local_id: localId,
      ingredient_id: -1,
      name: "",
      quantity: 0,
      unit_name: "",
    },
  ]);

  setSuggestOpen(prev => ({ ...prev, [localId]: true }));
};
  const removeIngredient = (idx: number) => {
  const target = ingredients[idx];
  if (!target) return;

  setIngredients(prev => prev.filter((_, i) => i !== idx));

  setAllowedUnits(prev => {
    const copy = { ...prev };
    delete copy[target.ingredient_id];
    return copy;
  });
};
  // -----------------------------
  // 단계 관리
  // -----------------------------
  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { step_order: prev.length + 1, description: "" },
    ]);
  };

  const removeStep = (idx: number) => {
  const removedOrder = steps[idx].step_order;

  setSteps((prev) =>
    prev
      .filter((_, i) => i !== idx)
      .map((s, i) => ({ ...s, step_order: i + 1 }))
  );

  setStepFiles((prev) => {
    const copy = { ...prev };
    delete copy[removedOrder];
    return copy;
  });
};

  // -----------------------------
  // 저장
  // -----------------------------
  const onSave = async () => {
    if (!title.trim()) return;

    setSaving(true);

    try {
      const body = {
        title,
        description,
        base_serving: baseServing,
        ingredients: ingredients.map((x) => ({
          ingredient_id: x.ingredient_id > 0 ? x.ingredient_id : undefined,
          name: x.name,
          quantity: x.quantity,
          unit_name: x.unit_name,
          unit_type: "mass",
        })),
        steps,
      };

      const result = await createRecipe(body);
	  if (thumbnailFile) {
  await replaceThumbnail(result.id, thumbnailFile);
}

for (const s of steps) {
  const files = stepFiles[s.step_order];
  if (files?.length) {
    await uploadStepImages(result.id, s.step_order, files);
  }
}
      nav(`/recipe/${result.id}`);
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // =====================  UI  ============================
  // =======================================================

  return (
    <div className={style.container} ref={containerRef}>
      {/* 헤더 */}
      <div className={style.banner}>
        <img
          src="/backstep_white_white_background.png"
          className={style.backstep}
          alt="back"
          onClick={() => nav(-1)}
        />
      </div>

      {/* 제목 */}
      <div className={style.foodTitle}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="음식 이름을 입력해주세요"
          style={{ width: "90%" }}
        />
      </div>

      {/* 설명 */}
      <div className={style.foodDescription}>음식 설명</div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="음식 설명을 입력해주세요."
        style={{ width: "90%", marginBottom: 20 }}
      />

      {/* 기준 인분 */}
      <div className={style.portionBody}>
        <div>기준 인분</div>
        <input
          type="number"
          min={1}
          value={baseServing}
          onChange={(e) => setBaseServing(Number(e.target.value))}
        />
      </div>

      <div className={style.line}></div>
      <div className={style.line}></div>

      {/* 재료 */}
      <div className={style.ingredientBody}>
        <div className={style.ingredientTitle}>재료</div>

        <table className={style.table}>
          <thead>
            <tr>
              <th>재료</th>
              <th>숫자</th>
              <th>단위</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((item, idx) => (
              <tr key={item.local_id}>
               <td className={style.ingCell}>
  <input
  onBlur={() => handleIngredientBlur(idx)}
    value={item.name}
    onFocus={() =>
      setSuggestOpen(prev => ({
        ...prev,
        [item.local_id]: true,
      }))
    }
    onChange={(e) =>
      onChangeIngredientName(idx, e.target.value)
    }
  />

  {suggestOpen[item.local_id] && (
    <div
    ref={dropdownRef}
    className={style.ingDropdown}
  >
      {suggestLoading[item.local_id] ? (
  <div className={style.ingDropdownLoading}>
    검색중...
  </div>
) : (
  (suggest[item.local_id] ?? []).map(it => (
    <div
      key={it.id}
      className={style.ingDropdownItem}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onPickIngredient(idx, it)}
    >
      {it.name}
    </div>
  ))
)}
    </div>
  )}
</td>

                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      setIngredients((prev) =>
                        prev.map((it, i) =>
                          i === idx
                            ? { ...it, quantity: Number(e.target.value) }
                            : it
                        )
                      )
                    }
                  />
                </td>

                <td>
                  <select
                    value={item.unit_name}
                    onChange={(e) =>
                      setIngredients((prev) =>
                        prev.map((it, i) =>
                          i === idx
                            ? { ...it, unit_name: e.target.value }
                            : it
                        )
                      )
                    }
                  >
                    {(allowedUnits[item.ingredient_id] ?? []).map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </td>

                <td>
                  <button onClick={() => removeIngredient(idx)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className={style.addRowBtn} onClick={addIngredient}>
          <span className={style.addRowPlus}>+</span>
          재료 추가하기
        </button>
      </div>

      <div className={style.line}></div>
      <div className={style.line}></div>

      {/* 단계 */}
      <div className={style.recipeTitle}>레시피</div>
      <div className={style.recipeBody}>
  {steps.map((s, idx) => {
    const picked = stepFiles[s.step_order] ?? [];

    return (
      <div key={s.step_order} className={style.recipeItem}>
        {/* 이미지 영역 */}
        <div className={style.photoBox}>
          <div className={style.number}>{s.step_order}</div>

          <div className={style.stepImageArea}>
  <input
    id={`step-file-${s.step_order}`}
    type="file"
    hidden
    multiple
    accept="image/*"
    onChange={(e) =>
      setStepFiles((prev) => ({
        ...prev,
        [s.step_order]: Array.from(e.target.files ?? []),
      }))
    }
  />

  {picked.length === 0 ? (
    <label
      htmlFor={`step-file-${s.step_order}`}
      className={style.stepImageBtn}
    >
      <span className={style.stepPlus}>+</span>
      <span className={style.stepAddText}>이미지 추가</span>
    </label>
  ) : (
    <div className={style.stepImageList}>
      {picked.map((file, i) => (
        <div key={i} className={style.stepImageItem}>
          <img
            src={URL.createObjectURL(file)}
            className={style.stepThumb}
            alt="preview"
          />
          <button
            type="button"
            className={style.stepImageDelete}
            onClick={() =>
              setStepFiles((prev) => {
                const copy = { ...prev };
                copy[s.step_order] = copy[s.step_order].filter(
                  (_, j) => j !== i
                );
                return copy;
              })
            }
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}
</div>
        </div>

        {/* 텍스트 영역 */}
        <div style={{ flex: 1 }}>
          <textarea
            className={style.textBox}
            value={s.description}
            onChange={(e) =>
              setSteps((prev) =>
                prev.map((st, i) =>
                  i === idx
                    ? { ...st, description: e.target.value }
                    : st
                )
              )
            }
          />

          <div className={style.stepActionRow}>
  <button
    type="button"
    className={style.stepImageReplaceBtn}
    onClick={() =>
      document
        .getElementById(`step-file-${s.step_order}`)
        ?.click()
    }
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

  <button className={style.addRowBtn} onClick={addStep}>
    <span className={style.addRowPlus}>+</span>
    단계 추가하기
  </button>
  <div style={{ width: "90%", margin: "30px 0 60px" }}>
  <button
    className={style.actionBtn}
    onClick={onSave}
    disabled={saving}
    style={{ width: "100%" }}
  >
    {saving ? "생성중..." : "레시피 생성하기"}
  </button>
</div>
</div>
</div>
  ); }