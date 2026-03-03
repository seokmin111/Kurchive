import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./page.module.css";
import client from "../../api/client"; // 

interface FormData {
  id: string;
  password: string;
}

export default function LoginPage() { 
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    id: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // 백엔드 스펙 맞추기: ID/PW (대문자)
      const res = await client.post("/login", {
        ID: formData.id,
        PW: formData.password,
      });

      const token = res.data?.access_token;
      if (!token) throw new Error("access_token 없음");

      // 프로젝트 전체에서 이 키로 통일(인터셉터가 이거 읽음)
      localStorage.setItem("access_token", token);
      navigate("/"); 
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      // 422면 “요청 형식 틀림” (대부분 키 불일치)
      if (status === 422) {
        alert("로그인 요청 형식이 잘못됐어(422). ID/PW 키 확인해줘.");
      } else if (status === 401) {
        alert("아이디/비밀번호가 틀렸습니다.");
      } else {
        alert(detail || "로그인 실패");
      }

      console.error(err);
    }
  };

  return (
    <div className={style.container}>
      <header className={style.header}>이 웹페이지는 고려대학교 동아리인 커리손으로먹기연구회와 KUCC의 협력으로 제작되었습니다.</header>
      <main className={style.main}>
        <div className={style.logoGroup}>
          <img className={style.logo} src="/curson_logo.png" alt="logo" />
          <div className={style.brandName}>커카이브</div>
          <div className={style.pageTitle}>로그인 페이지</div>
        </div>

        <form className={style.loginForm} onSubmit={handleSubmit}>
          <div className={style.inputGroup}>
            <label htmlFor="id">ID</label>
            <input
              type="text"
              id="id"
              name="id"
              placeholder="ID"
              required
              value={formData.id}
              onChange={handleChange}
            />
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className={style.loginButton}>
            로그인
          </button>
        </form>
{/*
        <div className={style.linkGroup}>
          <a href="#">아이디를 잊으셨나요?</a>
          <span className={style.separator}>|</span>
          <a href="#">비밀번호를 잊으셨나요?</a>
        </div>
        */}
      </main>

      <footer className={style.footer}>
        <button
          type="button"
          className={style.signupButton}
          onClick={() => navigate("/signup")}
        >
          회원가입
        </button>
      </footer>

    </div>
  );
}
