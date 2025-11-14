import style from "./page.module.css";

export default function Home() {
  return (
    <div className={style.mainPage}>
      <header className={style.topBar}>
        <img
          src="/backstep_button.svg.png"
          alt="뒤로가기"
          width={50}
          height={50}
          className={style.backstep_button}
        />
        <h1 className={style.title}>
          <div>우리의 미식 지도</div>
          <div>커카이브</div>
        </h1>
        <button className={style.myPageButton}>마이페이지</button>
      </header>
      <div>
        <img
          src="/curson_logo.png"
          alt="커손연 이미지"
          width={450}
          height={450}
          className={style.blurImage}
        />
      </div>

      <section className={style.favoritesSection}>
        <h2 className={style.sectionTitle}>즐겨찾기 목록</h2>
        <div className={style.underline} />

        <div className={style.listItem}>
          <div className={style.listContent}>
            <span className={style.listText}>식당 목록</span>
            <span className={style.heartCount}>♡ 46</span>
          </div>
          <div className={style.arrow}>&gt;</div>
        </div>

        <div className={style.listItem2}>
          <div className={style.listContent}>
            <span className={style.listText}>레시피 목록</span>
            <span className={style.heartCount}>♡ 21</span>
          </div>
          <div className={style.arrow}>&gt;</div>
        </div>
      </section>

      <section className={style.recentSection}>
        <p className={style.recentTitle}>내가 최근 저장한 식당 &amp;레시피</p>
        <div className={style.underline2} />
        <div className={style.recentItems}>
          <button className={style.recentItemButton}>···</button>
          <button className={style.recentItemButton}>···</button>
          <button className={style.recentItemButton}>···</button>
          <button className={style.recentItemButton}>···</button>
          <button className={style.recentItemButton}>○</button>
        </div>
      </section>
    </div>
  );
}
