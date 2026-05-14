import React, { useState } from "react";
import style from "./page.module.css";
import { adminLogin } from "../../api/admin";
import { useNavigate } from "react-router-dom";

export default function EntrustCompletePage() {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!userid || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const data = await adminLogin({
        userid,
        password,
      });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("admin_token", data.access_token);

      alert("관리자 로그인 성공");
      navigate("/admin/main");

    } catch (error: any) {
      console.error("Login Error:", error);
      alert(error?.response?.data?.detail || "로그인 실패");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className={style.container}>
      <div className={style.adiminPage}>관리자 페이지</div>
      <div className={style.kurchive}>커카이브</div>

      {/* 아이디 입력 */}
      <div className={style.password}>ID</div>
      <input
        type="text"
        placeholder="아이디 입력"
        className={style.inputBox}
        value={userid}
        onChange={(e) => setUserid(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* 비밀번호 입력 */}
      <div className={style.password}>Password</div>
      <input
        type="password"
        placeholder="비밀번호 입력"
        className={style.inputBox}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button className={style.loginBtn} onClick={handleLogin}>
        로그인
      </button>
    </div>
  );
}
