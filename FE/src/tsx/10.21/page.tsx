import React, { useState } from "react";
import style from "./page.module.css";
import client from "../../api/client"; // 

const users = [
    { id: 1, name: "홍지우", role: "관리자", isAdmin: true },
    { id: 2, name: "신윤희", role: "일반 회원", isAdmin: false },
    { id: 3, name: "김민지", role: "일반 회원", isAdmin: false },
    // ... 더 많은 데이터
  ];


export default function MemberSearchResultPage() { 
 
  return (
    <div className={style.container}>
      <div className={style.pageTitle}>
        <div className={style.kurchive}>커카이브</div>
        <div className={style.adminPage}>관리자 페이지</div>
      </div>

     <div className={style.memberSearch}>회원 조회하기</div>

     <div className={style.memberSearchBody}>
        <input placeholder="회원 아이디를 입력해주세요" className={style.memberSearchInput}></input>
      </div>

    <Positive></Positive>

    </div>
  );
}

function Positive(){
  return(
    <div className={style.positiveBody}>
      <div>일치하는 회원</div>
      <div>
        <div>
          <div>
            <span>이름</span>
            <span>최은우</span>
          </div>
          <div>
            <span>권한</span>
            <span>일반 회원</span>
          </div>
        </div>
        <div>권한 수정하기</div>
      </div>
      <div>강제탈퇴</div>
    </div>
  )
}

function Negative(){
  return(
    <div>
      <div>존재하지 않는 회원정보입니다.<br/>다시 검색해주세요.  </div>
    </div>
  )
}