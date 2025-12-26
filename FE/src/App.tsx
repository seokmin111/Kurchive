import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./tsx/loginpage_pg/page.tsx";
import MainPage from "./MainPage.tsx";

import RecipeEditPage from "./tsx/recipeadding_osm/page.tsx";
import RestaurantFormPage from "./tsx/restaurant_osm/page.tsx";
import RestaurantSearchPage from "./tsx/restaurant_search/page.tsx";
import SearchPage from "./tsx/restaurant_search_process/page.tsx";
import RecipeSearchPage from "./tsx/recipe_search/page.tsx";
import MyActivityPage from "./tsx/myactivity_pg/page.tsx";
import QuitPage from "./tsx/quitpage_pg/page.tsx";

export default function App() {
  return (
    <Routes>
      {/* 모든 페이지는 기본적으로 ProtectedRoute의 관리 하에 둠 */}
      <Route element={<ProtectedRoute />}>
        {/* 공개 페이지도 여기 안에 둬도 됨 (whitelist로 통과) */}
        <Route path="/login" element={<LoginPage />} />

        {/* 나머지는 기본 보호 */}
        <Route path="/" element={<MainPage />} />

        <Route path="/restaurant" element={<RestaurantSearchPage />} />
        <Route path="/restaurant/archive" element={<RestaurantFormPage />} />
        <Route path="/restaurant/archive/search" element={<SearchPage />} />

        <Route path="/recipe/edit" element={<RecipeEditPage />} />
        <Route path="/recipe" element={<RecipeSearchPage />} />

        <Route path="/myactivity" element={<MyActivityPage />} />
        <Route path="/quitpage" element={<QuitPage />} />
      </Route>
    </Routes>
  );
}
