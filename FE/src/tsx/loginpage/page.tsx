import style from "./page.module.css";
import logo from "../../assets/logo.png";

export default function loginpage() {
  return (
    <div className={style.container}>
      <header className={style.header}>베너 이미지</header>
      <main className={style.main}>
        <div className={style.logoGroup}>
          <img className={style.logo} src={logo} alt="logo" />
          <div className={style.brandName}>커카이브</div>
          <div className={style.pageTitle}>로그인 페이지</div>
        </div>
        <form className={style.loginForm}>
          <div className={style.inputGroup}>
            <label htmlFor="id">ID</label>
            <input type="text" id="id" name="id" placeholder="Value" required />
          </div>
          <div className={style.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Value"
              required
            />
          </div>
          <button type="submit" className={style.loginButton}>
            로그인
          </button>
        </form>
        <div className={style.linkGroup}>
          <a href="#">아이디를 잊으셨나요?</a>
          <span className={style.separator}>|</span>
          <a href="#">비밀번호를 잊으셨나요?</a>
        </div>
      </main>
      <footer className={style.footer}>
        <button type="button" className={style.signupButton}>
          회원가입
        </button>
      </footer>
    </div>
  );
}
