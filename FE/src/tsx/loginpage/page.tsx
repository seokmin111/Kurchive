import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./page.module.css";


interface FormData {
  id: string;
  password: string;
}
function loginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    id: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("로그인 시도");

    const loginData = {
      ID: formData.id,
      PW: formData.password,
    };

    try {
      const response = await fetch("/api/login", {
        // POST API 엔드포인트
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(loginData),
      });
      const responseText = await response.text();
      const responseData = responseText ? JSON.parse(responseText) : {};

      if (response.ok) {
        // 성공 로직: 토큰 저장 및 처리
        const token = responseData.access_token;

        if (token) {
          localStorage.setItem("authToken", token);
          console.log("로그인 성공! 토큰 저장됨:", token);
          alert("로그인 성공!");

          navigate("/main");
        } else {
          console.warn(
            "로그인 성공! 응답 본문에 토큰 키가 없습니다. 쿠키/헤더를 확인하세요."
          );
          alert("로그인 성공했으나, 토큰을 찾을 수 없습니다.");
        }
      } else {
        // 실패 로직: 오류 메시지 출력 (422 오류 포함)
        const errorMessage =
          responseData.message ||
          (response.status === 422
            ? "요청 데이터 구조가 잘못되었습니다. (키 불일치)"
            : response.statusText);

        console.error("로그인 실패:", responseData);
        alert(`로그인 실패 (${response.status}): ${errorMessage}`);
      }
    } catch (error) {
      console.error("API 통신 오류:", error);
      alert("서버와 통신하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={style.container}>
      <header className={style.header}>베너 이미지</header>
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
              placeholder="Value"
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
              placeholder="Value"
              required
              value={formData.password}
              onChange={handleChange}
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

export default loginPage;
