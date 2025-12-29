import { Routes, Route, Navigate } from "react-router-dom";

// pages
import MainPage from "./MainPage";
import Login from "./tsx/loginpage/page";

import RestaurantPage from "./tsx/restaurant_4.0/page";
import RestaurantArchivePage from "./tsx/restaurant_archive_4.1/page";
import SearchPage from "./tsx/restaurant_search_4.21/page";
import RestaurantSearchResultsPage from "./tsx/restaurant_search_result_4.3/page";

import RecipeSearchPage from "./tsx/recipe_3.0/page";
import RecipeArchivePage from "./tsx/recipe_archiving_3.1/page";

import MyPage from "./tsx/mypage_2.0/page";
import MyActivityPage from "./tsx/myactivity_2.2/page";
import MyInfoEdit from "./tsx/myInfoEdit_2.1/page";
import QuitPage from "./tsx/quitpage_2.3/page";

export default function App() {
  return (
    <Routes>
      {/* 초기 진입 → 로그인 */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 로그인 */}
      <Route path="/login" element={<Login />} />

      {/* 메인 이후 페이지들 */}
      <Route path="/main" element={<MainPage />} />

      {/* 레스토랑 */}
      <Route path="/restaurant" element={<RestaurantPage />} />
      <Route path="/restaurant/archive" element={<RestaurantArchivePage />} />
      <Route path="/restaurant/search" element={<SearchPage />} />
      <Route
        path="/restaurant/search/results"
        element={<RestaurantSearchResultsPage />} />

      {/* 레시피 */}
      <Route path="/recipe" element={<RecipeSearchPage />} />
      <Route path="/recipe/archive" element={<RecipeArchivePage />} />

      {/* 마이페이지 */}
      <Route path="/mypage" element={<MyPage />} />
      <Route path="/myactivity" element={<MyActivityPage />} />
      <Route path="/infoedit" element={<MyInfoEdit />} />
      <Route path="/quitpage" element={<QuitPage />} />

      {/* 404 */}
      <Route
        path="*"
        element={<div style={{ fontSize: 50, color: "red" }}>경로 없음 (404)</div>}
      />
    </Routes>
  );
}
