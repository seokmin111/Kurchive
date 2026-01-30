import React, { useState } from "react";
import style from "./page.module.css";
import client from "../../api/client"; // 
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";



export default function AdminMainPage() { 
 
  const navigate = useNavigate()

  const NavigateToMemberManage = () => {
  navigate("/admin/member")
}

  return (
    <div className={style.container}>
      <button className={style.memberAdminBtn} onClick={NavigateToMemberManage}>
        <div className={style.kurchive}>커카이브</div>
        <div className={style.memberAdmin}>회원 관리하기</div>
        <img src="../../public/curson_logo.png" className={style.logo}></img>
      </button>
      <button className={style.passwordBtn}>관리자 비밀번호 변경</button>
      <button className={style.adminChange}>관리자 위임하기</button>
    </div>
  );
}
