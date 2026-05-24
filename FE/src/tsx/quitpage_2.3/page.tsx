import style from "./page.module.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { BookOpen, MapPinned, Utensils } from "lucide-react";
import { getMyPage, type MyPageUser } from "../../api/mypage";

export default function Home() {
  const [user, setUser] = useState<MyPageUser | null>(null);

  useEffect(() => {
    getMyPage()
      .then(setUser)
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className={style.mainPage}>
      <header className={style.title}>
        <h2>커카이브</h2>
        <h3>우리만의 미식 지도</h3>
      </header>
      <div className={style.stackedContainer}>
        <main className={style.mainBlock}>
          <img
            src="/curson_logo.png"
            alt=""
            className={style.cardWatermark}
            aria-hidden="true"
          />
          <div className={style.nickname}>
            <span>{user?.nickname ?? "사용자"}</span> 님의 활동 기록
          </div>

          <div className={style.favoriteBox}>
            <div className={style.favoriteRes}>
              <div className={style.recordIcon}>
                <Utensils size={18} strokeWidth={2.1} />
              </div>
              <div className={style.favtitle}>즐겨찾기 식당</div>
              <div className={style.recordValue}>
                <span className={style.number}>46</span>
                <span className={style.unit}>개</span>
              </div>
            </div>
            <div className={style.favoriteRec}>
              <div className={style.recordIcon}>
                <BookOpen size={18} strokeWidth={2.1} />
              </div>
              <div className={style.favtitle}>즐겨찾기 레시피</div>
              <div className={style.recordValue}>
                <span className={style.number}>21</span>
                <span className={style.unit}>개</span>
              </div>
            </div>
            <div className={style.favoriteArchive}>
              <div className={style.recordIcon}>
                <MapPinned size={18} strokeWidth={2.1} />
              </div>
              <div className={style.favtitle}>식당 아카이빙</div>
              <div className={style.recordValue}>
                <span className={style.number}>2</span>
                <span className={style.unit}>개</span>
              </div>
            </div>
          </div>
          <div className={style.cardBrand}>커카이브</div>
        </main>
      </div>
      <footer className={style.FootBlock}>
        <div>정말 탈퇴하시겠습니까?</div>
        <div className={style.buttonBox}>
          <Link className={style.no} to="/mypage">아니요</Link>
          <Link className={style.yes} to="/login">예</Link>
        </div>
      </footer>
    </div>
  );
}
