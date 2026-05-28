import style from "./page.module.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { BookOpen, MapPinned, Utensils } from "lucide-react";
import { getMyPage, type MyPageUser } from "../../api/mypage";
import { useKurchiveI18n } from "../../i18n/LocaleContext";

export default function Home() {
  const { messages } = useKurchiveI18n();
  const myPage = messages.myPage;
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
        <h2>{messages.brand.name}</h2>
        <h3>{messages.brand.tagline}</h3>
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
            <span>{user?.nickname ?? messages.archiveCommon.userFallback}</span>
            {myPage.delete.activityRecord}
          </div>

          <div className={style.favoriteBox}>
            <div className={style.favoriteRes}>
              <div className={style.recordIcon}>
                <Utensils size={18} strokeWidth={2.1} />
              </div>
              <div className={style.favtitle}>{myPage.delete.favoriteRestaurants}</div>
              <div className={style.recordValue}>
                <span className={style.number}>46</span>
                <span className={style.unit}>{myPage.delete.items}</span>
              </div>
            </div>
            <div className={style.favoriteRec}>
              <div className={style.recordIcon}>
                <BookOpen size={18} strokeWidth={2.1} />
              </div>
              <div className={style.favtitle}>{myPage.delete.favoriteRecipes}</div>
              <div className={style.recordValue}>
                <span className={style.number}>21</span>
                <span className={style.unit}>{myPage.delete.items}</span>
              </div>
            </div>
            <div className={style.favoriteArchive}>
              <div className={style.recordIcon}>
                <MapPinned size={18} strokeWidth={2.1} />
              </div>
              <div className={style.favtitle}>{myPage.delete.restaurantArchives}</div>
              <div className={style.recordValue}>
                <span className={style.number}>2</span>
                <span className={style.unit}>{myPage.delete.items}</span>
              </div>
            </div>
          </div>
          <div className={style.cardBrand}>{messages.brand.name}</div>
        </main>
      </div>
      <footer className={style.FootBlock}>
        <div>{myPage.delete.confirm}</div>
        <div className={style.buttonBox}>
          <Link className={style.no} to="/mypage">
            {myPage.delete.no}
          </Link>
          <Link className={style.yes} to="/login">
            {myPage.delete.yes}
          </Link>
        </div>
      </footer>
    </div>
  );
}
