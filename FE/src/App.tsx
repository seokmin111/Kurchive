import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

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

export default function App() {
  return (
    <div>
    <Routes>
        {/* 공개 페이지도 여기 안에 둬도 됨 (whitelist로 통과) */}
        <Route path="/login" element={<Login/>} />

        {/* 나머지는 기본 보호 */}
        <Route path="/" element={<MainPage />} />

        {/*레스토랑 관련 라우팅*/}
        <Route path="/restaurant" element={<RestaurantPage/>} />
        <Route path="/restaurant/archive" element={<RestaurantArchivePage></RestaurantArchivePage>}></Route>
        <Route path="/restaurant/search" element={<SearchPage></SearchPage>}></Route>

        {/*레시피 관련 라우팅*/}
        <Route path="/recipe/archive" element={<RecipeArchivePage/>}/>
        <Route path="/recipe" element={<RecipeSearchPage></RecipeSearchPage>}></Route>
        
        


        {/*마이페이지 관련 라우팅*/}
        <Route path="/mypage" element={<MyPage></MyPage>}></Route>
        <Route path="/myactivity" element={<MyActivityPage />} />
        <Route path="/quitpage" element={<QuitPage />} />
        <Route path="/infoedit" element={<MyInfoEdit></MyInfoEdit>}></Route>

        {/*로그인*/}
        <Route path="/login" element={<Login></Login>}></Route>

        {/*디버깅용*/}
        <Route path="*" element={<div style={{fontSize: 50, color: 'red'}}>경로 없음 (404)</div>} />
      </Routes>
    </div>
  );
}
