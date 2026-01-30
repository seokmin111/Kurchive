import React, { useState } from "react";
import style from "./page.module.css";
import client from "../../api/client"; // 



export default function EntrustCompletePage() { 
 
  return (
    <div className={style.container}>
      <div className={style.adiminPage}>관리자 페이지</div>
      <div className={style.kurchive}>커카이브</div>
      <div className={style.password}>Password</div>
      <input type="password" placeholder="비밀번호 입력" className={style.inputBox}></input>
      <button className={style.loginBtn}>로그인</button>
    </div>
  );
}
