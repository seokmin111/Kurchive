"use client";

import React, { useState, useEffect } from "react";
import style from "./page.module.css";
import {
  getAllMembers,
  MemberInfo,
  updateMembersStatus,
} from "../../api/admin";

export default function MemberSearchPage() {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 검색
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<MemberInfo[]>([]);
  const [isSearched, setIsSearched] = useState(false);

  // 🔥 수정 상태
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<"staff" | "member">("member");

  // 검색
  const handleSearch = () => {
    if (!searchKeyword.trim()) return;

    const result = members.filter((m) =>
      m.userid.includes(searchKeyword)
    );

    setFilteredMembers(result);
    setIsSearched(true);
  };

  // 🔥 수정 버튼 클릭
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

  // 🔥 저장
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
        const data = await getAllMembers();
        setMembers(data);
      } catch (err: any) {
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

  // 🔥 표시할 데이터 (검색 반영)
  const displayMembers = isSearched ? filteredMembers : members;

  return (
    <div className={style.container}>
      {/* 타이틀 */}
      <div className={style.pageTitle}>
        <div className={style.kurchive}>커카이브</div>
        <div className={style.adminPage}>관리자 페이지</div>
      </div>

      {/* 검색 */}
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

      {/* 테이블 */}
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
              {displayMembers.map((member) => (
                <tr key={member.id}>
                  <td className={style.userName}>
                    {member.nickname}
                  </td>

                  {/* 🔥 권한 */}
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

                  {/* 🔥 버튼 */}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}