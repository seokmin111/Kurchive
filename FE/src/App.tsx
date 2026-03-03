//App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

// pages
import MainPage from "./MainPage";
import Login from "./tsx/loginpage/page";
import SignupPage from "./tsx/signUp_1.2/page"

import RestaurantPage from "./tsx/restaurant_4.0/page";
import RestaurantArchivePage from "./tsx/restaurant_archive_4.1/page";
import SearchPage from "./tsx/restaurant_search_4.21/page";
import RestaurantSearchResultsPage from "./tsx/restaurant_search_result_4.3/page";
import RestaurantDetailPage from "./tsx/restaurantSpecific_4.31/page"; 
import RestaurantEditPage from "./tsx/restaurantSpecific_4.31_edit/page";
import MapPage from "./tsx/restaurantmap_4.32/page"; 

import RecipeMainPage from "./tsx/recipe_3.0/page"; 
import RecipeSearchPage from "./tsx/recipeSearch_3.2/page";
import RecipeArchivePage from "./tsx/recipe_archiving_3.1/page";
import RecipeSpecific from "./tsx/recipeSpecific_3.31/page"
import RecipeSearchResultsPage from "./tsx/recipesearchcomplete_3.3/page";


import MyPage from "./tsx/mypage_2.0/page";
import MyActivityPage from "./tsx/myactivity_2.2/page";
import MyRestaurantArchivePage from "./tsx/myRestaurantArchive_2.21/page"; 
import MyRecipeArchivePage from "./tsx/myRecipeArchive_2.22/page"; 
import MyInfoEdit from "./tsx/myInfoEdit_2.1/page";
import QuitPage from "./tsx/quitpage_2.3/page";

import AdminFirstPage from "./tsx/10.0/page";
import AdminMainPage from "./tsx/10.1/page";
import MemberSearchPage from "./tsx/10.2/page";
import MemberSearchResultPage from "./tsx/10.21~23/page";
import AdminEntrustPage from './tsx/10.31~10.33/page'
import AdminEntrustCompletePage from './tsx/10.34/page'

export default function App() {
  return (
    <Routes>
      {/* 공개 페이지 */}
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* 레스토랑 조회 (공개) */}
      <Route path="/restaurant" element={<RestaurantPage />} />
      <Route path="/restaurant/search" element={<SearchPage />} />
      <Route path="/restaurant/search/results" element={<RestaurantSearchResultsPage />} />
      <Route path="/restaurant/map" element={<MapPage />} />
      <Route path="/restaurant/:restaurantId" element={<RestaurantDetailPage />} />

      {/* 레시피 조회 (공개) */}
      <Route path="/recipe" element={<RecipeMainPage />} />
      <Route path="/recipe/search" element={<RecipeSearchPage />} />
      <Route path="/recipe/:recipeId" element={<RecipeSpecific mode="view" />} />

      {/* 🔐 보호 영역 */}
      <Route element={<ProtectedRoute />}>
        {/* 식당 작성/수정 */}
        <Route path="/restaurant/archive" element={<RestaurantArchivePage />} />
        <Route path="/restaurant/:restaurantId/edit" element={<RestaurantEditPage />} />

        {/* 레시피 작성/수정 */}
        <Route path="/recipe/archive" element={<RecipeArchivePage />} />
        <Route path="/recipe/:recipeId/edit" element={<RecipeSpecific mode="edit" />} />

        {/* 마이페이지 */}
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/myactivity" element={<MyActivityPage />} />
        <Route path="/my-restaurant-archive" element={<MyRestaurantArchivePage />} />
        <Route path="/my-recipe-archive" element={<MyRecipeArchivePage />} />
        <Route path="/infoedit" element={<MyInfoEdit />} />
        <Route path="/quitpage" element={<QuitPage />} />

        {/* 관리자 */}
        <Route path="/admin" element={<AdminFirstPage />} />
        <Route path="/admin/main" element={<AdminMainPage />} />
        <Route path="/admin/member" element={<MemberSearchPage />} />
        <Route path="/admin/member/result" element={<MemberSearchResultPage />} />
        <Route path="/admin/entrust/result" element={<AdminEntrustPage />} />
        <Route path="/admin/entrust/complete" element={<AdminEntrustCompletePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<div style={{ fontSize: 50, color: "red" }}>경로 없음 (404)</div>} />
    </Routes>
  );
}