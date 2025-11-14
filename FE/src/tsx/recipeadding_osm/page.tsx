"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./page.module.css";

interface Step {
  id: number; // 여기서는 step_order로 사용
  description: string;
  imageUrl?: string;
}

/** 백엔드 서버 주소로 axios 인스턴스 생성 */
const api = axios.create({
  baseURL: "http://152.69.228.114:8000/", // 백엔드 주소 (일단 axios를 여기서 연결해놨습니다)
  // withCredentials: true,  // 쿠키 인증 쓰면 주석 해제
});

export default function RecipeEditPage() {
  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [ingredients, setIngredients] = useState<string[]>(["", "", ""]);
  const [nutrition, setNutrition] = useState("");
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, description: "" },
    { id: 2, description: "" },
    { id: 3, description: "" },
  ]);

  // TODO: 라우터에서 받아오도록 나중에 교체
  const recipeId = 1;

  // ==========================
  //  초기 로딩 API (GET)
  // ==========================
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // GET /api/recipe/{recipe_id}
        const res = await api.get(`/api/recipe/${recipeId}`);
        const data = res.data;

        setRecipeName(data.name ?? "");
        setDescription(data.description ?? "");
        setUnit(data.unit ?? "");
        setIngredients(data.ingredients ?? ["", "", ""]);
        setNutrition(data.nutrition ?? "");
        setSteps(
          data.steps?.length
            ? data.steps
            : [
                { id: 1, description: "" },
                { id: 2, description: "" },
                { id: 3, description: "" },
              ]
        );
      } catch (err) {
        console.error("레시피 불러오기 실패:", err);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  // ==========================
  //  저장 API (PUT)
  // ==========================
  const handleSave = async () => {
    try {
      // PUT /api/recipe/{recipe_id}
      await api.put(`/api/recipe/${recipeId}`, {
        name: recipeName,
        description,
        unit,
        ingredients,
        nutrition,
        steps,
      });

      alert("레시피가 저장되었습니다.");
    } catch (err) {
      console.error("레시피 저장 실패:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // ==========================
  //  스텝 추가
  // ==========================
  const handleAddStep = () => {
    setSteps((prev) => {
      const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
      return [...prev, { id: nextId, description: "" }];
    });
  };

  // ==========================
  //  레시피 삭제 (DELETE)
  // ==========================
  const handleDeleteRecipe = async () => {
    try {
      // DELETE /api/recipe/{recipe_id}
      await api.delete(`/api/recipe/${recipeId}`);
      alert("레시피가 삭제되었습니다.");
      // TODO: router.push 등으로 목록 페이지로 이동
    } catch (err) {
      console.error("레시피 삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleStepDescriptionChange = (id: number, value: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, description: value } : step
      )
    );
  };

  // ==========================
  //  스텝 이미지 업로드
  //  Swagger: POST /api/recipe/{recipe_id}/steps/{step_order}/images
  // ==========================
  const handleStepImageUpload = async (stepOrder: number, file: File | null) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post(
        `/api/recipe/${recipeId}/steps/${stepOrder}/images`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const imageUrl = res.data.url as string;

      setSteps((prev) =>
        prev.map((step) =>
          step.id === stepOrder ? { ...step, imageUrl } : step
        )
      );
    } catch (err) {
      console.error("이미지 업로드 실패:", err);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <header>
        <span>뒤로가기</span>
        <button onClick={handleSave}>수정하기</button>
      </header>

      <main style={{ padding: 16 }}>
        <h1>
          <input
            type="text"
            value={recipeName}
            placeholder="음식 이름"
            onChange={(e) => setRecipeName(e.target.value)}
          />
        </h1>

        <textarea
          placeholder="음식 설명"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className={styles["unit-row"]}>
          기본 단위 : (
          <input
            type="text"
            placeholder="예: g, 개, 컵"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />{" "}
          )
          <button>변경하기</button>
        </div>

        <div className={styles.ingredients}>
          <p>기본 재료</p>
          {ingredients.map((ing, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`재료 ${idx + 1}`}
              value={ing}
              onChange={(e) => {
                const copy = [...ingredients];
                copy[idx] = e.target.value;
                setIngredients(copy);
              }}
            />
          ))}
        </div>

        <div className={styles.nutrition}>
          <input
            type="text"
            placeholder="영양성 자료"
            value={nutrition}
            onChange={(e) => setNutrition(e.target.value)}
          />
        </div>

        <div className={styles.divider} />

        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div key={step.id} className="step">
              <div className={styles["step-number"]}>{index + 1}</div>

              <label className={styles["step-image"]}>
                {step.imageUrl ? (
                  <img
                    src={step.imageUrl}
                    alt={`step-${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <>
                    이미지
                    <br />
                    추가
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleStepImageUpload(
                      step.id, // 여기서는 step.id를 step_order로 사용
                      e.target.files?.[0] ?? null
                    )
                  }
                />
              </label>

              <textarea
                placeholder="내용"
                value={step.description}
                onChange={(e) =>
                  handleStepDescriptionChange(step.id, e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button onClick={handleAddStep}>스텝 추가하기</button>
          <button className={styles.delete} onClick={handleDeleteRecipe}>
            레시피 삭제하기
          </button>
        </div>
      </main>
    </div>
  );
}
