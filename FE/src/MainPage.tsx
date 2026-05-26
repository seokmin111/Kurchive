import { Link } from "react-router-dom";
import "./components/main.css"; // CSS 위치 맞게 조정
import LanguageSelect from "./components/LanguageSelect";
import {
  getMyPage,
  updateNickname as updateNicknameAPI,
  updatePassword as updatePasswordAPI,
} from "../../api/mypage";
import { useKurchiveI18n } from "./i18n/LocaleContext";

export default function MainPage() {
  const { messages } = useKurchiveI18n();
  const main = messages.main;

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
        <h1 className="title">{messages.brand.name}</h1>
        <p className="sub-title">{messages.brand.tagline}</p>
        <br />
        <br />

        {/* React Router 연결 */}
        <Link to="/restaurant" className="red-btn">
          {main.restaurantArchive}
        </Link>

        <br />

        <Link to="/recipe" className="ivory-btn">
          {main.recipeArchive}
        </Link>
      </div>

      <div className="footer">
        <a
          href="https://docs.google.com/forms/d/10IjDgTdbvtc1RTPZ_hRkvWbvE2oc8yT1tcHfCHVt3SQ/edit#responses"
          target="_blank"
          rel="noopener noreferrer"
          className="contactButton"
          aria-label={main.contact}
        >
          <span className="contactIcon">📩</span>
          <span className="contactButtonText">{main.contact}</span>
        </a>

        <div className="footerDivider"></div>

        <p className="footerDescription">{main.footerDescription}</p>
        <p className="footerCredit">{main.footerCredit}</p>
      </div>
    </div>
  );
}
