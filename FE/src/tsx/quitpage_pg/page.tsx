import style from "./page.module.css";

export default function Home() {
  return (
    <div className={style.mainPage}>
      <header className={style.title}>
        <h2 style={{ color: "#8B0029" }}>커카이브</h2>
        <h3 style={{ color: "#8B0029", marginLeft: "5px", marginTop: "30px" }}>
          우리의 미식지도
        </h3>
      </header>
      <div className={style.stackedContainer}>
        <main className={style.mainBlock}>
          <div className={style.nickname}>(닉네임) 님의 활동 기록</div>

          <div className={style.favoriteBox}>
            <div className={style.favoriteRes}>
              <div style={{ color: "#8B0029" }} className={style.favtitle}>
                즐겨찾기 식당
              </div>
              <div className={style.number}>46</div>
              <div className={style.unit}>개</div>
            </div>
            <div className={style.favoriteRec}>
              <div style={{ color: "#8B0029" }} className={style.favtitle}>
                즐겨찾기 레시피
              </div>
              <div className={style.number}>21</div>
              <div className={style.unit}>개</div>
            </div>
            <div className={style.favoriteArchive}>
              <div style={{ color: "#8B0029" }} className={style.favtitle}>
                식당 아카이빙
              </div>
              <div className={style.number}>2</div>
              <div className={style.unit}>개</div>
            </div>
          </div>
          <div
            style={{
              paddingTop: "20px",
              fontSize: "30px",
              color: "#8B0029",
              opacity: "0.2",
            }}
          >
            커카이브
          </div>
        </main>
        <div className={style.backgroundBlock}></div>
      </div>
      <footer className={style.FootBlock}>
        <div
          style={{
            marginBottom: "60px",
            color: "#8B0029",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          정말 탈퇴하시겠습니까?
        </div>
        <div className={style.buttonBox}>
          <button className={style.no}>아니요</button>
          <button className={style.yes}>예</button>
        </div>
      </footer>
    </div>
  );
}
