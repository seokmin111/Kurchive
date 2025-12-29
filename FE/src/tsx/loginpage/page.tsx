import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import style from "./page.module.css";
import logo from "../../assets/logo.png";
import { login } from "../../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();


  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(id, pw);

      // 로그인 성공 여부 확정 체크
      if (!res?.access_token) {
        throw new Error("로그인 응답에 access_token이 없습니다.");
      }

      localStorage.setItem("access_token", res.access_token);

     const from = (location.state as any)?.from || "/main";
     navigate(from, { replace: true });


    } catch (err: any) {

      // 백엔드가 400이면 "아이디 또는 비밀번호" 메시지 나옴.
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "로그인에 실패했습니다.";
      alert(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <header className={style.header}>베너 이미지</header>

      <main className={style.main}>
        <div className={style.logoGroup}>
          <img className={style.logo} src={logo} alt="logo" />
          <div className={style.brandName}>커카이브</div>
          <div className={style.pageTitle}>로그인 페이지</div>
        </div>

        <form className={style.loginForm} onSubmit={onSubmit}>
          <div className={style.inputGroup}>
            <label htmlFor="id">ID</label>
            <input
              type="text"
              id="id"
              name="id"
              placeholder="Value"
              required
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Value"
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>

          <button type="submit" className={style.loginButton} disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className={style.linkGroup}>
          <a href="#">아이디를 잊으셨나요?</a>
          <span className={style.separator}>|</span>
          <a href="#">비밀번호를 잊으셨나요?</a>
        </div>
      </main>

      <footer className={style.footer}>
        <button
          type="button"
          className={style.signupButton}
          onClick={() => navigate("/signup")} // 회원가입 라우트로 수정 가능
        >
          회원가입
        </button>
      </footer>
    </div>
  );
}



