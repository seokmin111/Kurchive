import client from "../../api/client";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import style from "./page.module.css";
import { getIngredientUnitsByName } from "../../api/ingredient";

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
  steps: { step_order: number; description: string; image_urls?: string[] }[];
  ingredients: {
    ingredient_id: number;
    name: string;
    quantity: number;
    unit_name: string;
  }[];
};

export default function RecipeSpecific() {

  const { recipeId } = useParams();
  const nav = useNavigate();

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // 수정/저장(기존)
  const [isEdit, setIsEdit] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [baseServingDraft, setBaseServingDraft] = useState<number>(1);
  const [ingredientsDraft, setIngredientsDraft] = useState<
    { ingredient_id: number; name: string; quantity: number; unit_name: string }[]
  >([]);
  const [stepsDraft, setStepsDraft] = useState<
    { step_order: number; description: string }[]
  >([]);

  // ✅ 인분 변경 UI 상태
  const [servingsInput, setServingsInput] = useState<number>(2);

  // ✅ 단위 선택 상태: ingredient_id -> unit string
  const [unitSelections, setUnitSelections] = useState<Record<number, string>>({});

  const stepsSorted = useMemo(() => {
    return (recipe?.steps ?? []).slice().sort((a, b) => a.step_order - b.step_order);
  }, [recipe]);

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
            .map((s) => ({ step_order: s.step_order, description: s.description }))
        );

        // ✅ 인분 input 기본값
        setServingsInput(data.base_serving);

        // ✅ 단위 선택 기본값(현재 단위)
        const initUnits: Record<number, string> = {};
        (data.ingredients ?? []).forEach((it) => {
          initUnits[it.ingredient_id] = it.unit_name;
        });
        setUnitSelections(initUnits);
      } catch (e: any) {
        console.error(e);
        setErrMsg(e?.response?.data?.detail ?? e?.message ?? "불러오기 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, [recipeId]);

  const onClickBack = () => nav(-1);

  // 수정모드 토글
  const onClickModify = () => {
    if (!recipe) return;

    if (!isEdit) {
      setTitleDraft(recipe.title);
      setBaseServingDraft(recipe.base_serving);
      setIngredientsDraft(
        (recipe.ingredients ?? []).map((x) => ({
          ingredient_id: x.ingredient_id,
          name: x.name,
          quantity: x.quantity,
          unit_name: x.unit_name,
        }))
      );
      setStepsDraft(
        (recipe.steps ?? [])
          .slice()
          .sort((a, b) => a.step_order - b.step_order)
          .map((s) => ({ step_order: s.step_order, description: s.description }))
      );
    }

    setIsEdit((v) => !v);
  };

  // 저장
  const onSave = async () => {
    if (!recipe) return;

    try {
      setErrMsg("");

      const body = {
        title: titleDraft.trim(),
        base_serving: baseServingDraft,
        ingredients: ingredientsDraft.map((x) => ({
          ingredient_id: x.ingredient_id,
          quantity: Number(x.quantity),
          unit_name: x.unit_name,
        })),
        steps: stepsDraft.map((s) => ({
          step_order: s.step_order,
          description: s.description,
          image_urls: [],
        })),
      };

      const updated: RecipeDetail = await updateRecipe(recipe.id, body);
      setRecipe(updated);
      setIsEdit(false);

      // ✅ 저장 후 단위 선택도 최신 단위로 동기화
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

      // 단위 선택은 유지(가능하면)
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
  const [allowedUnits, setAllowedUnits] =
  useState<Record<number, string[]>>({});
  const [unitDirty, setUnitDirty] = useState(false);

  

  useEffect(() => {
  if (!recipe) return;

  (async () => {
    const map: Record<number, string[]> = {};

    for (const ing of recipe.ingredients) {
      try {
        const data = await getIngredientUnitsByName(ing.name);
        map[ing.ingredient_id] = data.units;
      } catch (e) {
        console.error("unit fetch fail:", ing.name, e);
        map[ing.ingredient_id] = [ing.unit_name]; // fallback
      }
    }

    setAllowedUnits(map);
  })();
}, [recipe]);


  const onConvertUnits = async () => {
    if (!recipe) return;

    // 선택값을 units 맵으로 구성
    const units: Record<number, string> = {};
    (recipe.ingredients ?? []).forEach((it) => {
      const sel = unitSelections[it.ingredient_id];
      if (sel) units[it.ingredient_id] = sel;
    });

    try {
      setErrMsg("");
      console.log("convert request units:", units);
      const converted: RecipeDetail = await convertRecipeUnits(recipe.id, { units });
      console.log(
        "convert response:",
        converted.ingredients.map(i => [i.ingredient_id, i.name, i.quantity, i.unit_name])
      );
      setRecipe(converted);

      // 변환 후 단위선택도 응답에 맞춰 동기화
      const newUnits: Record<number, string> = {};
      (converted.ingredients ?? []).forEach((it) => {
        newUnits[it.ingredient_id] = it.unit_name;
      });
      setUnitSelections(newUnits);
    } catch (e: any) {
      console.error(e);
      setErrMsg(e?.response?.data?.detail ?? e?.message ?? "단위 변환 실패");
    }
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
          <button className={style.modifyBtn} onClick={onClickModify}>
            수정하기
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8, marginBottom: 100 }}>
            <button className={style.modifyBtn} onClick={onSave}>
              저장
            </button>
            <button className={style.modifyBtn} onClick={onClickModify}>
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

      <div className={style.foodDescription}>음식 설명</div>

      {/* 인분 변경 */}
      <div className={style.portionBody}>
        <div>기준 인분: {recipe.base_serving}인분</div>

        <input
          type="number"
          min={1}
          value={servingsInput}
          onChange={(e) => setServingsInput(Number(e.target.value))}
          style={{ width: 70, marginRight: 10 }}
        />
        <button onClick={onScaleServings}>변경하기</button>
      </div>

      <div className={style.line}></div>
      <div className={style.line}></div>

      {/* 재료 + 단위 선택 */}
      <div className={style.ingredientBody}>
        <div className={style.ingredientHeader}>
          <div className={style.ingredientTitle}>재료</div>

          <button
            className={style.applyUnitBtn}
            onClick={onConvertUnits}
            disabled={!recipe.ingredients?.length || !unitDirty}

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
            </tr>
          </thead>
          <tbody>
            {recipe.ingredients?.map((item) => (
              <tr key={item.ingredient_id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>
                  <select
                    value={unitSelections[item.ingredient_id] ?? item.unit_name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setUnitSelections((prev) => ({
                        ...prev,
                        [item.ingredient_id]: v,
                      }));
                      setUnitDirty(true);
                    }}
                  >
                    {(allowedUnits[item.ingredient_id] ?? [item.unit_name]).map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>

                </td>

              </tr>
            ))}
          </tbody>
        </table>

      
      </div>

      <div className={style.line}></div>
      <div className={style.line}></div>

      {/* 레시피 단계 */}
      <div className={style.recipeTitle}>레시피</div>
      <div className={style.recipeBody}>
        {stepsSorted.map((s) => (
          <div className={style.recipeItem} key={s.step_order}>
            <div className={style.photoBox}>
              <div className={style.number}>{s.step_order}</div>
            </div>
            <div className={style.textBox}>{s.description}</div>
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
