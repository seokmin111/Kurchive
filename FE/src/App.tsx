// 출처: FE/src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

// MainPage 연결 → 파일 출처 명시

// RecipeEditPage 연결 → 파일 출처 명시
// 출처: FE/src/tsx/recipeadding_osm/page.tsx
import RecipeEditPage from "./tsx/recipeadding_osm/page.tsx";
import RestaurantReviewPage from "./tsx/restaurant_osm/page.tsx";
import MyActivityPage from "./tsx/myactivity_pg/page.tsx";

import QuitPage from "./tsx/quitpage_pg/page.tsx";
// 출처: FE/src/MainPage.tsx   ← 네 파일 위치 기준, 정확히 이게 맞음
import MainPage from "./MainPage.tsx";

export default function App() {
  return (
    <div>
      <Routes>
        {/* / → MainPage.tsx */}
        <Route path="/" element={<MainPage />} />

        {/* /restaurant → RecipeEditPage.tsx */}
        <Route path="/restaurant" element={<RestaurantReviewPage />} />

        <Route path="/recipe" element={<RecipeEditPage />} />

        <Route path="/myactivity" element={<MyActivityPage />} />

        <Route path="/quitpage" element={<QuitPage />} />
      </Routes>
    </div>
  );
}
