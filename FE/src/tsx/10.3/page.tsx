"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import style from "./page.module.css";
import { getAllMembers, MemberInfo } from "../../api/admin";

export default function AdminEntrustSearchPage() {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<MemberInfo[]>([]);
  const [isSearched, setIsSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    const keyword = searchKeyword.trim();
    if (!keyword) {
      setFilteredMembers([]);
      setIsSearched(false);
      return;
    }

    setFilteredMembers(members.filter((member) => member.userid.includes(keyword)));
    setIsSearched(true);
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        setMembers(await getAllMembers());
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
        <button type="button" className={style.backBtn} onClick={() => navigate("/admin/main")}>
          &lt;
        </button>
        <h1 className={style.kurchive}>커카이브</h1>
        <p className={style.adminPage}>관리자 페이지</p>
      </div>

      <div className={style.memberSearch}>관리자 위임하기</div>
      <form
        className={style.memberSearchBody}
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
      >
        <input
          placeholder="회원 아이디를 입력해주세요"
          className={style.memberSearchInput}
          value={searchKeyword}
          onChange={(event) => setSearchKeyword(event.target.value)}
        />
        <button type="submit" className={style.searchButton} aria-label="검색">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </form>

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
                  <td className={style.userName}>{member.nickname}</td>
                  <td className={member.role === "staff" ? style.adminRole : style.userRole}>
                    {member.role === "staff" ? "관리자" : "일반 회원"}
                  </td>
                  <td>
                    <button
                      className={style.editBtnLight}
                      onClick={(event) => event.currentTarget.blur()}
                    >
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
