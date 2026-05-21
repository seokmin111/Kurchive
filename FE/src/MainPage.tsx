import { Link } from "react-router-dom";
import "./components/main.css"; // CSS 위치 맞게 조정
import LanguageSelect from "./components/LanguageSelect";
import {
  getMyPage,
  updateNickname as updateNicknameAPI,
  updatePassword as updatePasswordAPI,
} from "../../api/mypage";

export default function MainPage() {
  return (
    <div>
      {/* 프로필 이미지 */}
      <div className="language-slot">
        <LanguageSelect />
      </div>


      <Link to="/mypage">
      <img src="/kurchive_profile.png" className="mypage"></img>
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

      <div className="footer">
        <a
          href="https://docs.google.com/forms/d/10IjDgTdbvtc1RTPZ_hRkvWbvE2oc8yT1tcHfCHVt3SQ/edit#responses"
          target="_blank"
          rel="noopener noreferrer"
          className="contactButton"
          aria-label="문의하기"
        >
          <span className="contactIcon">📩</span>
          <span className="contactButtonText">문의하기</span>
        </a>

        <div className="footerDivider"></div>

        <p className="footerDescription">커리손연구회 커리 아카이빙 서비스</p>
        <p className="footerCredit">Built with 💗 by Kurchive Team</p>
      </div>
    </div>
  );
}
