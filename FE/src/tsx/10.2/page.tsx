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
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<MemberInfo[]>([]);
  const [isSearched, setIsSearched] = useState(false);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<"staff" | "member">("member");

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    try {
      const result = await searchMembers(searchKeyword);
      setFilteredMembers(result);
      setIsSearched(true);
    } catch (err) {
      console.error(err);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  const handleForceWithdraw = async (member: MemberInfo) => {
    if (!confirm(`${member.nickname} 회원을 강제 탈퇴시키겠습니까?`)) return;
    try {
      await forceWithdrawMember(member.userid);
      alert("강제 탈퇴 완료");
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

  const handleEditClick = (member: MemberInfo) => {
    if (editingUserId === member.userid) {
      handleSave(member);
    } else {
      setEditingUserId(member.userid);
      setEditingRole(member.role);
    }
  };

  const handleSave = async (member: MemberInfo) => {
    try {
      if (editingRole === member.role) {
        setEditingUserId(null);
        return;
      }
      await updateMembersStatus({
        members: [{ userid: member.userid, role: editingRole }],
      });
      alert("변경 완료");
      setEditingUserId(null);
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

  const displayMembers = isSearched ? filteredMembers : members;

  return (
    <div className={style.container}>
      <div className={style.pageTitle}>
        <div className={style.kurchive}>커카이브</div>
        <div className={style.adminPage}>관리자 페이지</div>
      </div>

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
              {displayMembers.map((member) => (
                <tr key={member.id}>
                  <td className={style.userName}>{member.nickname}</td>
                  <td>
                    {editingUserId === member.userid ? (
                      <select
                        value={editingRole}
                        onChange={(e) =>
                          setEditingRole(e.target.value as "staff" | "member")
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
                  <td>
                    <button
                      className={style.editBtnLight}
                      onClick={() => handleEditClick(member)}
                      disabled={member.is_admin}
                    >
                      {editingUserId === member.userid ? "저장" : "권한 수정"}
                    </button>
                  </td>
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