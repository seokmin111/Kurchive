"use client";

import React, { useState, useEffect } from "react";
import style from "./page.module.css";
import {
  getAllMembers,
  MemberInfo,
  updateMembersStatus,
  searchMembers,
  forceWithdrawMember,
} from "../../api/admin";

export default function MemberSearchPage() {
  // 1. 상태 변수 선언 (함수 컴포넌트 내부 최상단)
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
 // 2. 검색 변수
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<MemberInfo[]>([]);
  const [isSearched, setIsSearched] = useState(false);

  // 수정 상태
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<"staff" | "member">("member");

  // 검색 수정: 검색을 로컬 필터 대신 API로 교체
  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;

    try {
      const result = await searchMembers(searchKeyword); // 이름 기반 검색 API 호출
      setFilteredMembers(result);
      setIsSearched(true);
    } catch (err) {
      console.error(err);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  //  강제탈퇴 핸들러
  const handleForceWithdraw = async (member: MemberInfo) => {
    if (!confirm(`${member.nickname} 회원을 강제 탈퇴시키겠습니까?`)) return;

    try {
      await forceWithdrawMember(member.userid);
      alert("강제 탈퇴 완료");

      // 탈퇴 후 목록 갱신 (검색 중이면 검색 결과도 갱신)
      const data = await getAllMembers();
      setMembers(data);
      if (isSearched) {
        const refreshed = await searchMembers(searchKeyword);
        setFilteredMembers(refreshed);
      }
    } catch (err) {
      console.error(err);
      alert("강제 탈퇴 실패");
    }
  };

  // 수정 버튼 클릭
  const handleEditClick = (member: MemberInfo) => {
    if (editingUserId === member.userid) {
      // 저장
      handleSave(member);
    } else {
      // 수정 모드 진입
      setEditingUserId(member.userid);
      setEditingRole(member.role);
    }
  };

  // 저장
  const handleSave = async (member: MemberInfo) => {
    try {
      // 변경 없으면 그냥 종료
      if (editingRole === member.role) {
        setEditingUserId(null);
        return;
      }

      await updateMembersStatus({
        members: [
          {
            userid: member.userid,
            role: editingRole,
          },
        ],
      });

      alert("변경 완료");

      setEditingUserId(null);

      // 다시 불러오기
      const data = await getAllMembers();
      setMembers(data);

    } catch (err) {
      console.error(err);
      alert("변경 실패");
    }
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        /** * client.ts의 요청 인터셉터가 localStorage에서 토큰을 꺼내 
         * Authorization 헤더에 Bearer 토큰을 자동으로 넣어줌.
         */
        const data = await getAllMembers();
        setMembers(data);
      } catch (err: any) {
        /**
         * 401(인증 만료) 또는 403(권한 없음) 에러가 발생하면
         * client.ts의 응답 인터셉터가 자동으로 /login으로 리다이렉트하므로
         * 여기서는 일반적인 네트워크 에러 등만 처리하면 됨.
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
      <div className={style.memberSearch}>회원 조회하기</div>
      <div className={style.memberSearchBody}>
          <input
    placeholder="회원 아이디를 입력해주세요"
    className={style.memberSearchInput}
    value={searchKeyword}
    onChange={(e) => setSearchKeyword(e.target.value)}
  />

  <button onClick={handleSearch}>검색</button>
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
                <th>탈퇴</th>
              </tr>
            </thead>
            <tbody>
              {/* API에서 받아온 실제 members 데이터를 매핑 */}
              {members.map((member) => (
                <tr key={member.id}>
                  <td className={style.userName}>
                    {member.nickname}
                  </td>

                  {/* 권한 */}
                  <td>
                    {editingUserId === member.userid ? (
                      <select
                        value={editingRole}
                        onChange={(e) =>
                          setEditingRole(
                            e.target.value as "staff" | "member"
                          )
                        }
                      >
                        <option value="member">일반 회원</option>
                        <option value="staff">임원진</option>
                      </select>
                    ) : (
                      <span
                        className={
                          member.role === "staff" && member.is_admin
                            ? style.adminRole
                            : member.role === "staff"
                            ? style.staffRole
                            : style.userRole
                        }
                      >
                        {member.role === "staff" && member.is_admin
                          ? "관리자"
                          : member.role === "staff"
                          ? "임원진"
                          : "일반 회원"}
                      </span>
                    )}
                  </td>

                  {/* 수정 버튼 */}
                  <td>
                    <button
                      className={style.editBtnLight}
                      onClick={() => handleEditClick(member)}
                      disabled={member.is_admin}
                    >
                      {editingUserId === member.userid
                        ? "저장"
                        : "권한 수정"}
                    </button>
                  </td>

                  {/* 강제탈퇴 버튼 (관리자는 비활성화) */}
                  <td>
                    <button
                      className={style.withdrawBtn}
                      onClick={() => handleForceWithdraw(member)}
                      disabled={member.is_admin}
                    >
                      강제 탈퇴
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