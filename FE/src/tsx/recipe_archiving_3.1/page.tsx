"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getOrCreateIngredient,
  createRecipe,
  replaceThumbnail,
  uploadStepImages,
} from "../../api/recipe";
import { searchIngredients } from "../../api/ingredient";
import {
  DEFAULT_UNIT_MAP,
  UNIT_TYPE_LABEL,
  getUnitOptions,
  getUnitTypeLabelByUnitName,
  normalizeUnitType,
  type UnitType,
} from "../../constants/recipeUnits";
import style from "./page.module.css";

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
};

type SuggestItem = {
  id: number;
  name: string;
};

export default function RecipeCreate() {
  const nav = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [baseServing, setBaseServing] = useState(1);
  const [ingredients, setIngredients] = useState<DraftIngredient[]>([]);
  const [steps, setSteps] = useState<DraftStep[]>([]);
  const [allowedUnits, setAllowedUnits] = useState<Record<number, string[]>>(
    {}
  );
  const [suggest, setSuggest] = useState<Record<string, SuggestItem[]>>({});
  const [suggestOpen, setSuggestOpen] = useState<Record<string, boolean>>({});
  const [suggestLoading, setSuggestLoading] = useState<
    Record<string, boolean>
  >({});
  const [thumbnailFile] = useState<File | null>(null);
  const [stepFiles, setStepFiles] = useState<Record<number, File[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(event.target as Node)) {
        setSuggestOpen({});
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onChangeIngredientName = (idx: number, value: string) => {
    const localId = ingredients[idx].local_id;

    setIngredients((prev) =>
      prev.map((it, i) =>
        i === idx
          ? {
              ...it,
              name: value,
              ingredient_id: -1,
              unit_name: "",
              unit_type: "weight",
              is_existing: false,
            }
          : it
      )
    );

    setSuggestOpen((prev) => ({ ...prev, [localId]: true }));

    const prevTimer = debounceRef.current.get(localId);
    if (prevTimer) clearTimeout(prevTimer);

    const timer = setTimeout(async () => {
      const q = value.trim();
      if (!q) {
        setSuggest((prev) => ({ ...prev, [localId]: [] }));
        return;
      }

      setSuggestLoading((prev) => ({ ...prev, [localId]: true }));

      try {
        const items = await searchIngredients(q, 8);
        setSuggest((prev) => ({ ...prev, [localId]: items }));
      } catch {
        setSuggest((prev) => ({ ...prev, [localId]: [] }));
      } finally {
        setSuggestLoading((prev) => ({ ...prev, [localId]: false }));
      }
    }, 250);

    debounceRef.current.set(localId, timer);
  };

  const onPickIngredient = async (idx: number, pick: SuggestItem) => {
    const created = await getOrCreateIngredient(pick.name);
    const firstUnit = created.units?.[0] ?? "";

    setIngredients((prev) =>
      prev.map((it, i) =>
        i === idx
          ? {
              ...it,
              ingredient_id: created.id,
              name: created.name,
              unit_name: firstUnit,
              unit_type: normalizeUnitType(created.unit_type, firstUnit),
              is_existing: true,
            }
          : it
      )
    );

    setAllowedUnits((prev) => ({
      ...prev,
      [created.id]: created.units ?? [],
    }));
    setSuggestOpen({});
  };

  const addIngredient = () => {
    const localId = crypto.randomUUID();

    setIngredients((prev) => [
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

    setSuggestOpen((prev) => ({ ...prev, [localId]: true }));
  };

  const removeIngredient = (idx: number) => {
    const target = ingredients[idx];
    if (!target) return;

    setIngredients((prev) => prev.filter((_, i) => i !== idx));
    setAllowedUnits((prev) => {
      const copy = { ...prev };
      delete copy[target.ingredient_id];
      return copy;
    });
  };

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

  const onSave = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    setSaving(true);

    try {
      const resolvedIngredients: DraftIngredient[] = [];

      for (const ing of ingredients) {
        if (!ing.name.trim()) continue;

        if (ing.ingredient_id > 0) {
          resolvedIngredients.push(ing);
          continue;
        }

        const created = await getOrCreateIngredient(ing.name, ing.unit_type);
        const firstUnit = created.units?.[0] ?? "";
        resolvedIngredients.push({
          ...ing,
          ingredient_id: created.id,
          unit_name: firstUnit,
          unit_type: normalizeUnitType(created.unit_type, firstUnit),
          is_existing: true,
        });
      }

      const result = await createRecipe({
        title,
        description,
        base_serving: baseServing,
        ingredients: resolvedIngredients.map((x) => ({
          ingredient_id: x.ingredient_id,
          name: x.name,
          quantity: x.quantity,
          unit_name: x.unit_name,
          unit_type: x.unit_type,
        })),
        steps,
      });

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
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "저장에 실패했습니다.";

      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={style.page}>
      <div className={style.container} ref={containerRef}>
        <div className={style.banner}>
          <img
            src="/backstep_white_white_background.png"
            className={style.backstep}
            alt="back"
            onClick={() => nav(-1)}
          />
        </div>

        <main className={style.main}>
          <section className={style.section}>
            <div className={style.infoTitle}>음식 정보</div>
            <div className={style.foodTitle}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="음식 이름을 입력해주세요"
              />
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="음식 설명을 입력해주세요."
              style={{ width: "90%", marginBottom: 20 }}
            />

            <div className={style.portionBody}>
              <div>기준 인분</div>
              <input
                type="number"
                min={1}
                value={baseServing}
                onChange={(e) => setBaseServing(Number(e.target.value))}
              />
            </div>
          </section>

          <div className={style.line}></div>
          <div className={style.line}></div>

          <section className={`${style.section} ${style.ingredientSection}`}>
            <div className={style.ingredientTitle}>재료</div>
            <button className={style.addRowBtn} onClick={addIngredient}>
              <span className={style.addRowPlus}>+</span>
              재료 추가하기
            </button>

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
                  {ingredients.map((item, idx) => {
                    const unitOptions = getUnitOptions(
                      item.ingredient_id,
                      item.unit_type,
                      item.unit_name,
                      allowedUnits
                    );

                    return (
                    <tr key={item.local_id}>
                      <td className={style.ingCell}>
                        <input
                          value={item.name}
                          onFocus={() =>
                            setSuggestOpen((prev) => ({
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
                              (suggest[item.local_id] ?? []).map((it) => (
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
                          min={0}
                          step="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            const safeValue = value < 0 ? 0 : value;

                            setIngredients((prev) =>
                              prev.map((it, i) =>
                                i === idx
                                  ? { ...it, quantity: safeValue }
                                  : it
                              )
                            );
                          }}
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
                          {unitOptions.map((u) => (
                            <option key={u}>{u}</option>
                          ))}
                        </select>
                      </td>

                      <td>
                        {item.is_existing ? (
                          <span>{getUnitTypeLabelByUnitName(item.unit_name)}</span>
                        ) : (
                          <select
                            value={item.unit_type}
                            onChange={(e) =>
                              setIngredients((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                      unit_type: e.target.value as UnitType,
                                      unit_name:
                                          DEFAULT_UNIT_MAP[
                                            e.target.value as UnitType
                                          ][0] ?? "",
                                      }
                                    : it
                                )
                              )
                            }
                          >
                            <option value="weight">{UNIT_TYPE_LABEL.weight}</option>
                            <option value="volume">{UNIT_TYPE_LABEL.volume}</option>
                            <option value="count">{UNIT_TYPE_LABEL.count}</option>
                          </select>
                        )}
                      </td>

                      <td>
                        <button onClick={() => removeIngredient(idx)}>
                          삭제
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className={style.line}></div>
          <div className={style.line}></div>

          <section className={style.section}>
            <div className={style.recipeTitle}>레시피</div>
            <div className={style.recipeBody}>
              {steps.map((s, idx) => {
                const picked = stepFiles[s.step_order] ?? [];

                return (
                  <div key={s.step_order} className={style.recipeItem}>
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
                              [s.step_order]: Array.from(
                                e.target.files ?? []
                              ),
                            }))
                          }
                        />

                        {picked.length === 0 ? (
                          <label
                            htmlFor={`step-file-${s.step_order}`}
                            className={style.stepImageBtn}
                          >
                            <span className={style.stepPlus}>+</span>
                            <span className={style.stepAddText}>
                              이미지 추가
                            </span>
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
                                      copy[s.step_order] = copy[
                                        s.step_order
                                      ].filter((_, j) => j !== i);
                                      return copy;
                                    })
                                  }
                                >
                                  x
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

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

              <div className={style.actionWrap}>
                <button
                  className={style.actionBtn}
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? "생성중..." : "레시피 생성하기"}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
