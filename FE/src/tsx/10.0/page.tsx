import React, { useState,useEffect } from "react";
import style from "./page.module.css";
import { adminLogin } from "../../api/admin"; // 정의된 API 임포트
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 훅

export default function EntrustCompletePage() {
  const [password, setPassword] = useState(""); // 패스워드 상태 관리
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // 1. API 호출
      // 참고: 현재 admin.ts의 adminLogin은 파라미터를 받지 않도록 설계되어 있습니다.
      const data = await adminLogin();

      // 2. 응답 데이터 처리 (액세스 토큰 저장)
      if (data.access_token) {
        localStorage.setItem("admin_token", data.access_token);
        // 필요 시 axios client의 공통 헤더에 토큰 설정 로직 추가 가능
        
        alert("관리자 인증에 성공했습니다.");
        navigate("/admin/main"); // 로그인 성공 시 이동할 경로
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("로그인에 실패했습니다. 비밀번호를 확인해주세요.");
    }
  };

  // 엔터 키 눌렀을 때 로그인 실행
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  useEffect(()=>{console.log(password)},[password])

  return (
    <div className={style.container}>
      <div className={style.adiminPage}>관리자 페이지</div>
      <div className={style.kurchive}>커카이브</div>
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