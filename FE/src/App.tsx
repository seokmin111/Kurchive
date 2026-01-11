//App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

// pages
import MainPage from "./MainPage";
import Login from "./tsx/loginpage/page";
import SignupPage from "./tsx/signUp_1.2/page"

import RestaurantPage from "./tsx/restaurant_4.0/page";
import RestaurantArchivePage from "./tsx/restaurant_archive_4.1/page";
import SearchPage from "./tsx/restaurant_search_4.21/page";
import RestaurantSearchResultsPage from "./tsx/restaurant_search_result_4.3/page";
import RestaurantDetailPage from "./tsx/restaurantSpecific_4.31/page"; 

import RecipeMainPage from "./tsx/recipe_3.0/page"; 
import RecipeSearchPage from "./tsx/recipeSearch_3.2/page";
import RecipeArchivePage from "./tsx/recipe_archiving_3.1/page";

import RecipeSpecific from "./tsx/recipeSpecific_3.31/page";
import RecipeSearchResultsPage from "./tsx/recipesearchcomplete_3.3/page";


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

      {/* 회원가입 */}
       <Route path="/signup" element={<SignupPage />} />

      {/* 메인 이후 페이지들 */}
      <Route path="/main" element={<MainPage />} />

      {/* 레스토랑 */}
      <Route path="/restaurant" element={<RestaurantPage />} />
      <Route path="/restaurant/archive" element={<RestaurantArchivePage />} />
      <Route path="/restaurant/search" element={<SearchPage />} />
      <Route
        path="/restaurant/search/results"
        element={<RestaurantSearchResultsPage />} />

      {/* 식당 상세(4.31) */}
      <Route path="/restaurant/detail/:restaurantId" element={<RestaurantDetailPage />}/>
      {/* 404 */}
      <Route path="*" element={<div style={{ fontSize: 50, color: "red" }}>경로 없음 (404)</div>} />

      {/* 레시피 */}
      <Route path="/recipe" element={<RecipeMainPage />} />
      <Route path="/recipe/search" element={<RecipeSearchPage />} />
      <Route path="/recipe/:recipeId" element={<RecipeSpecific mode="view" />} />
      <Route path="/recipe/:recipeId/edit" element={<RecipeSpecific mode="edit" />} />


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
