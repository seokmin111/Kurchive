import React, { useMemo, useRef, useState } from "react";

// 색상 토큰(스크린샷의 버건디 계열)
const BRAND = {
  primary: "#8A0D2A", // 버건디
  primaryLight: "#b53a55",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  muted: "#6b7280",
};

// 타입 정의
type RecipeStep = {
  id: string;
  image?: string; // objectURL
  desc: string;
};

type FormState = {
  title: string;
  description: string;
  baseUnit: string;
  baseIngredient1: string;
  baseIngredient2: string;
  baseIngredient3: string;
  nutritionNote: string;
  steps: RecipeStep[];
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function RecipeEditor() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<FormState>({
    title: "",
    description: "",
    baseUnit: "",
    baseIngredient1: "",
    baseIngredient2: "",
    baseIngredient3: "",
    nutritionNote: "",
    steps: [
      { id: uid(), desc: "" },
      { id: uid(), desc: "" },
      { id: uid(), desc: "" },
    ],
  });

  const canSave = useMemo(() => state.title.trim().length > 0, [state.title]);

  const set = (patch: Partial<FormState>) =>
    setState((s) => ({ ...s, ...patch }));

  const updateStep = (id: string, patch: Partial<RecipeStep>) => {
    setState((s) => ({
      ...s,
      steps: s.steps.map((st) => (st.id === id ? { ...st, ...patch } : st)),
    }));
  };

  const addStep = () => {
    setState((s) => ({ ...s, steps: [...s.steps, { id: uid(), desc: "" }] }));
  };

  const removeStep = (id: string) => {
    setState((s) => ({ ...s, steps: s.steps.filter((st) => st.id !== id) }));
  };

  const onPickImage = (id: string, file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateStep(id, { image: url });
  };

  const onSave = async () => {
    setSaving(true);
    // 실제 API 연동 부분을 여기에 연결하세요
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    alert("저장 완료 (데모)");
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-sm">
        {/* 헤더 영역 */}
        <div
          className="px-4 pt-10 pb-6"
          style={{ backgroundColor: BRAND.primary, color: "#fff" }}
        >
          <div className="flex items-center justify-between">
            <button
              className="rounded-full p-2/ text-white/90 hover:text-white"
              aria-label="뒤로가기"
              onClick={() => history.back()}
            >
              {/* 뒤로 아이콘 */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              className="px-4 py-2 rounded-2xl text-sm font-medium"
              style={{ backgroundColor: "#F6D9DF", color: BRAND.primary }}
              onClick={onSave}
              disabled={!canSave || saving}
            >
              {saving ? "저장중…" : "수정하기"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm opacity-90">음식 사진 배경</p>
          </div>
        </div>

        {/* 본문 폼 */}
        <div className="px-4 py-6">
          {/* 제목 */}
          <h1 className="text-center text-lg font-bold" style={{ color: BRAND.primary }}>
            음식 이름
          </h1>

          {/* 설명 입력 */}
          <div className="mt-4">
            <label className="sr-only">음식 설명</label>
            <textarea
              value={state.description}
              onChange={(e) => set({ description: e.target.value })}
              placeholder="음식 설명"
              className="w-full rounded-xl border p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
              rows={2}
            />
          </div>

          {/* 기본 단위 */}
          <div className="mt-3 flex items-center gap-2">
            <div className="text-sm text-gray-700">기본 단위 : (</div>
            <input
              value={state.baseUnit}
              onChange={(e) => set({ baseUnit: e.target.value })}
              className="flex-1 border-b px-1 focus:outline-none"
              placeholder="예: g, 개, 컵"
            />
            <div className="text-sm text-gray-700">)</div>
            <button
              className="ml-2 rounded-lg border px-3 py-1 text-sm hover:bg-gray-50"
              onClick={() => alert("단위 선택 모달 (데모)")}
            >
              변경하기
            </button>
          </div>

          {/* 기본 재료 */}
          <div className="mt-5">
            <p className="text-sm font-medium text-gray-700 mb-2">기본 재료</p>
            <div className="space-y-2">
              <input
                value={state.baseIngredient1}
                onChange={(e) => set({ baseIngredient1: e.target.value })}
                className="w-full border-b px-1 py-1 focus:outline-none"
                placeholder="예: 재료 1"
              />
              <input
                value={state.baseIngredient2}
                onChange={(e) => set({ baseIngredient2: e.target.value })}
                className="w-full border-b px-1 py-1 focus:outline-none"
                placeholder="예: 재료 2"
              />
              <input
                value={state.baseIngredient3}
                onChange={(e) => set({ baseIngredient3: e.target.value })}
                className="w-full border-b px-1 py-1 focus:outline-none"
                placeholder="예: 재료 3"
              />
            </div>
          </div>

          {/* 영양성 자료 */}
          <div className="mt-5">
            <input
              value={state.nutritionNote}
              onChange={(e) => set({ nutritionNote: e.target.value })}
              className="w-full border-b px-1 py-1 focus:outline-none"
              placeholder="영양성 자료"
            />
          </div>

          {/* 구분선 */}
          <div className="my-6 border-t border-dashed" />

          {/* 레시피 섹션 헤더 */}
          <div className="text-center mb-3">
            <span className="text-sm font-bold" style={{ color: BRAND.primary }}>
              레시피
            </span>
          </div>

          {/* 레시피 스텝들 */}
          <div className="space-y-3">
            {state.steps.map((step, idx) => (
              <RecipeStepRow
                key={step.id}
                no={idx + 1}
                step={step}
                onPickImage={(file) => onPickImage(step.id, file)}
                onChangeDesc={(v) => updateStep(step.id, { desc: v })}
                onRemove={() => removeStep(step.id)}
              />
            ))}
          </div>

          {/* 스텝 추가 */}
          <div className="mt-4 flex gap-2">
            <button
              className="flex-1 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              onClick={addStep}
            >
              스텝 추가하기
            </button>
            <button
              className="rounded-xl border px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={() => set({ steps: [] })}
            >
              레시피 삭제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecipeStepRow({
  no,
  step,
  onPickImage,
  onChangeDesc,
  onRemove,
}: {
  no: number;
  step: RecipeStep;
  onPickImage: (file?: File) => void;
  onChangeDesc: (v: string) => void;
  onRemove: () => void;
}) {
  const localRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="flex items-stretch gap-3">
      {/* 번호 배지 */}
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-semibold"
        style={{ backgroundColor: BRAND.primary }}
        aria-label={`스텝 ${no}`}
      >
        {no}
      </div>

      {/* 이미지 박스 */}
      <div
        className="w-24 h-24 rounded-xl border border-dashed flex items-center justify-center bg-gray-50 overflow-hidden"
        role="button"
        onClick={() => localRef.current?.click()}
        title="이미지 추가"
      >
        {step.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={step.image} alt="step" className="w-full h-full object-cover" />
        ) : (
          <div className="text-xs text-gray-400 text-center">
            이미지
            <br />
            추가
          </div>
        )}
        <input
          ref={localRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPickImage(e.target.files?.[0])}
        />
      </div>

      {/* 내용 박스 */}
      <div className="flex-1">
        <div className="rounded-xl border p-3 min-h-[96px]">
          <textarea
            value={step.desc}
            onChange={(e) => onChangeDesc(e.target.value)}
            placeholder="내용"
            className="w-full h-full resize-none focus:outline-none"
            rows={3}
          />
        </div>
        <div className="mt-2 flex justify-end">
          <button
            className="text-xs text-red-600 hover:underline"
            onClick={onRemove}
          >
            스텝 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
