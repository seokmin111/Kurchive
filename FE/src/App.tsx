import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import MyFavoritePage from "./tsx/myactivity_2.2/page";
import MyRestaurantFavoritePage from "./tsx/myRestaurantArchive_2.21/page"; 
import MyRecipeFavoritePage from "./tsx/myRecipeArchive_2.22/page"; 
import MyActivityRestaurant from "./tsx/myActivityRestaurant_2.31/page";
import MyActivityRecipe from "./tsx/myActivityRecipe_2.32/page";

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
    <>
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
      <Route path="/recipe/search/results" element={<RecipeSearchResultsPage />} />
      <Route path="/recipe/:recipeId" element={<RecipeSpecific mode="view" />} />

      {/* 🔐 보호 페이지 */}

      <Route
        path="/restaurant/archive"
        element={
          <ProtectedRoute>
            <RestaurantArchivePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/restaurant/:restaurantId/edit"
        element={
          <ProtectedRoute>
            <RestaurantEditPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recipe/archive"
        element={
          <ProtectedRoute>
            <RecipeArchivePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recipe/:recipeId/edit"
        element={
          <ProtectedRoute>
            <RecipeSpecific mode="edit" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mypage"
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/myfavorites"
        element={
          <ProtectedRoute>
            <MyFavoritePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-restaurant-favorite"
        element={
          <ProtectedRoute>
            <MyRestaurantFavoritePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-recipe-favorite"
        element={
          <ProtectedRoute>
            <MyRecipeFavoritePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-restaurant-activity"
        element={
          <ProtectedRoute>
            <MyActivityRestaurant />
          </ProtectedRoute>
        }
      />
    <Route
        path="/my-recipe-activity"
        element={
          <ProtectedRoute>
            <MyActivityRecipe />
          </ProtectedRoute>
        }
      />
      <Route
        path="/infoedit"
        element={
          <ProtectedRoute>
            <MyInfoEdit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quitpage"
        element={
          <ProtectedRoute>
            <QuitPage />
          </ProtectedRoute>
        }
      />

      {/* 관리자 */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminFirstPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/main"
        element={
          <ProtectedRoute>
            <AdminMainPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/member"
        element={
          <ProtectedRoute>
            <MemberSearchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/member/result"
        element={
          <ProtectedRoute>
            <MemberSearchResultPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/entrust/result"
        element={
          <ProtectedRoute>
            <AdminEntrustPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/entrust/complete"
        element={
          <ProtectedRoute>
            <AdminEntrustCompletePage />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<div style={{ fontSize: 50, color: "red" }}>경로 없음 (404)</div>} />

    </Routes>
    <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}