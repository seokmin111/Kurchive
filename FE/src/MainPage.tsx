import { Link } from "react-router-dom";
import "./components/main.css"; // CSS 위치 맞게 조정

export default function MainPage() {
  return (
    <div>
      {/* 프로필 이미지 */}

      <Link to="/mypage">
      <img src="../public/kurchive_profile.png" className="mypage"></img>
      </Link>

      <div>
        <br />
        <br />
        <br />
        <br />
        <h1 className="title">커카이브</h1>
        <p className="sub-title">우리만의 미식 지도</p>
        <br />
        <br />

        {/* React Router 연결 */}
        <Link to="/restaurant" className="red-btn">
          식당 아카이브
        </Link>

        <br />

        <Link to="/recipe" className="ivory-btn">
          레시피 아카이브
        </Link>
      </div>

      <div className="footer"></div>
    </div>
  );
}
