import React, { useState } from "react";
import style from "./page.module.css";
import client from "../../api/client"; // 



export default function AdminFirstPage() { 
 
  return (
    <div className={style.container}>
      <div className={style.adiminPage}>관리자 페이지</div>
      <div className={style.kurchive}>커카이브</div>
      <div className={style.body}>
        <div className={style.entrust}>위임되었습니다.</div>
        <div className={style.thank}>감사합니다.</div>
      </div>
      <button className={style.loginBtn}>확인</button>
    </div>
  );
}
