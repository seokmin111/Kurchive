"use client";

import React, { useState, useEffect } from "react";
import style from "./page.module.css";
import { getAllMembers, MemberInfo } from "../../api/admin";

export default function MemberSearchPage() {
  // 1. 상태 변수 선언 (함수 컴포넌트 내부 최상단)
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 2. 회원 목록 조회 로직
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        /** * client.ts의 요청 인터셉터가 localStorage에서 토큰을 꺼내 
         * Authorization 헤더에 Bearer 토큰을 자동으로 넣어줍니다.
         */
        const data = await getAllMembers();
        setMembers(data);
      } catch (err: any) {
        /**
         * 401(인증 만료) 또는 403(권한 없음) 에러가 발생하면
         * client.ts의 응답 인터셉터가 자동으로 /login으로 리다이렉트하므로
         * 여기서는 일반적인 네트워크 에러 등만 처리하면 됩니다.
         */
        console.error("데이터 로딩 실패:", err);
        if (err.response?.status !== 401 && err.response?.status !== 403) {
          setError("데이터를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  return (
    <div className={style.container}>
      {/* 상단 타이틀 섹션 */}
      <div className={style.pageTitle}>
        <div className={style.kurchive}>커카이브</div>
        <div className={style.adminPage}>관리자 페이지</div>
      </div>

      {/* 검색 섹션 */}
      <div className={style.memberSearch}>관리자 위임하기</div>
      <div className={style.memberSearchBody}>
        <input
          placeholder="회원 아이디를 입력해주세요"
          className={style.memberSearchInput}
        />
      </div>

      {/* 테이블 섹션 */}
      <div className={style.tableBody}>
        <div className={style.memberList}>회원 목록</div>
        
        {isLoading ? (
          <div className={style.loadingStatus}>데이터를 불러오는 중...</div>
        ) : error ? (
          <div className={style.errorStatus}>{error}</div>
        ) : (
          <table className={style.userTable}>
            <thead>
              <tr>
                <th>이름</th>
                <th>권한</th>
                <th>수정</th>
              </tr>
            </thead>
            <tbody>
              {/* API에서 받아온 실제 members 데이터를 매핑합니다. */}
              {members.map((member) => (
                <tr key={member.id}>
                  {/* MemberInfo 타입의 nickname 필드 사용 */}
                  <td className={style.userName}>{member.nickname}</td>
                  {/* role이 'staff'인 경우 관리자 스타일 적용 */}
                  <td className={member.role === "staff" ? style.adminRole : style.userRole}>
                    {member.role === "staff" ? "관리자" : "일반 회원"}
                  </td>
                  <td>
                    <button className={style.editBtnLight}>
                      위임하기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}