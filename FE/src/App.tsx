import { Routes, Route, Navigate } from "react-router-dom";

// RecipeEditPage 연결 → 파일 출처 명시
// 출처: FE/src/tsx/recipeadding_osm/page.tsx
import RestaurantArchivePage from "./tsx/restaurant_archive_4.1/page.tsx";
import RestaurantPage from "./tsx/restaurant_4.0/page.tsx";
import SearchPage from "./tsx/restaurant_search_4.21/page.tsx";
import RecipeSearchPage from "./tsx/recipe_3.0/page.tsx";
import MyActivityPage from "./tsx/myactivity_2.2/page.tsx";
import RecipeArchivePage from "./tsx/recipe_archiving_3.1/page.tsx"
import MyPage from "./tsx/mypage_2.0/page.tsx"
import MyInfoEdit from "./tsx/myInfoEdit_2.1/page.tsx"
import Login from "./tsx/loginpage/page.tsx"
import QuitPage from "./tsx/quitpage_2.3/page.tsx";
import MainPage from "./MainPage.tsx";
import SignIn from "./tsx/signin_1.2/page.tsx"
import RestaurantSpecific from "./tsx/restaurantSpecific_4.31/page.tsx";
import MyRestaurantArchive from "./tsx/myRestaurantArchive_2.21/page.tsx";
import MyRecipeArchive from "./tsx/myRecipeArchive_2.22/page.tsx"

export default function App() {
  return (
    <Routes>
      {/* 초기 진입 → 로그인 */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 로그인 */}
      <Route path="/login" element={<Login />} />

        {/*레스토랑 관련 라우팅*/}
        <Route path="/restaurant" element={<RestaurantPage/>} />
        <Route path="/restaurant/archive" element={<RestaurantArchivePage></RestaurantArchivePage>}></Route>
        <Route path="/restaurant/search" element={<SearchPage></SearchPage>}></Route>
        <Route path="/restaurant/specific" element={<RestaurantSpecific></RestaurantSpecific>}></Route>
        

        {/*레시피 관련 라우팅*/}
        <Route path="/recipe/archive" element={<RecipeArchivePage/>}/>
        <Route path="/recipe" element={<RecipeSearchPage></RecipeSearchPage>}></Route>
        
        
        {/*마이페이지 관련 라우팅*/}
        <Route path="/mypage" element={<MyPage></MyPage>}></Route>
        <Route path="/myactivity" element={<MyActivityPage />} />
        <Route path="/quitpage" element={<QuitPage />} />
        <Route path="/infoedit" element={<MyInfoEdit></MyInfoEdit>}></Route>
        <Route path="/myRestaurant" element={<MyRestaurantArchive></MyRestaurantArchive>}></Route>
        <Route path="/myRecipe" element={<MyRecipeArchive></MyRecipeArchive>}></Route>
 
        {/*로그인 및 회원가입*/}
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/signin" element={<SignIn></SignIn>}></Route>

      {/* 404 */}
      <Route
        path="*"
        element={<div style={{ fontSize: 50, color: "red" }}>경로 없음 (404)</div>}
      />
    </Routes>
  );
}
