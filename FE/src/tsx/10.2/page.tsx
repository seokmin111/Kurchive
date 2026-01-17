import React, { useState } from "react";
import style from "./page.module.css";
import client from "../../api/client"; // 

const users = [
    { id: 1, name: "홍지우", role: "관리자", isAdmin: true },
    { id: 2, name: "신윤희", role: "일반 회원", isAdmin: false },
    { id: 3, name: "김민지", role: "일반 회원", isAdmin: false },
    // ... 더 많은 데이터
  ];


export default function MemberSearchPage() { 
 
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

    <div className={style.tableBody}>
      <div className={style.memberList}>회원 목록</div>
      <table className={style.userTable}>
        <thead>
          <tr>
            <th>이름</th>
            <th>권한</th>
            <th>수정</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className={style.userName}>{user.name}</td>
              <td className={user.isAdmin ? style.adminRole : style.userRole}>
                {user.role}
              </td>
              <td>
                <button className={style.editBtnLight}>
                  수정하기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
