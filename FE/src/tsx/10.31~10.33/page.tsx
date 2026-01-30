"use client";

import React, { useState } from "react";
import style from "./page.module.css";

export default function MemberSearchResultPage() { 

  // 1. 검색 결과가 있으면 true 없으면 false -> 이 state에 따라서 Negative 혹은 Positive 모달 보여줌
  const [isPositive,setIsPositive] = useState(true)
  // 2. 팝업 열림/닫힘 상태 관리
  const [isDropOpen, setIsDropOpen] = useState(false);
  // 3. 탈퇴 대상자 이름을 동적으로 보여주기 위한 상태 (선택 사항)
  const [targetName, setTargetName] = useState("최은우");

  return (
    <div className={style.container}>
      {/* 배경 클릭 시 팝업 닫기 효과를 주고 싶다면 여기에 overlay를 추가할 수 있습니다 */}
      
      <div className={style.pageTitle}>
        <div className={style.kurchive}>커카이브</div>
        <div className={style.adminPage}>관리자 페이지</div>
      </div>

      <div className={style.memberSearch}>관리자 위임하기</div>

      <div className={style.memberSearchBody}>
        <input placeholder="회원 아이디를 입력해주세요" className={style.memberSearchInput} />
      </div>

      {/* Positive 컴포넌트에 탈퇴 버튼 클릭 함수 전달 */}
      {
        isPositive ? <Positive onExpelClick={() => setIsDropOpen(true)} /> : <Negative></Negative>
      }

      {/* 3. 조건부 렌더링: isDropOpen이 true일 때만 Drop 컴포넌트 표시 */}
      {isDropOpen && (
        <Drop 
          name={targetName} 
          onClose={() => setIsDropOpen(false)} 
          onConfirm={() => {
            console.log("탈퇴 처리 로직 실행");
            setIsDropOpen(false);
          }} 
        />
      )}
    </div>
  );
}

function Negative(){
  return(
    <div className={style.negativeBody}>
      <img src="../../public/손사진.png" className={style.handImg}></img>
      <div className={style.negativeText}>존재하지 않는 회원 정보입니다.</div>
      <div className={style.negativeText}>다시 검색해주세요.</div>
    </div>
  )
}

// 4. Positive 컴포넌트: props로 함수를 받아 실행
function Positive({ onExpelClick }: { onExpelClick: () => void }) {
  return (
    <div className={style.positiveBody}>
      <div className={style.title}>일치하는 회원</div>
      <div className={style.contentsBody}>
        <div className={style.contents}>
          <div>
            <span className={style.nameTitle}>이름</span>
            <span className={style.name}>최은우</span>
          </div>
          <div>
            <span className={style.authorityTitle}>권한</span>
            <span className={style.authority}>일반 회원</span>
          </div>
        </div>
        <button className={style.modify} onClick={onExpelClick}>권한 위임하기</button>
      </div>
    </div>
  )
}

// 5. Drop 컴포넌트: 닫기 및 이름 반영 기능 추가
function Drop({ name, onClose, onConfirm }: { name: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className={style.dropOverlay}> {/* 화면 전체를 덮는 어두운 배경 */}
      <div className={style.dropContainer}>
        <div className={style.dropText}>
          <strong>(이름) 님께 관리자 권한을 <br/> 위임하시겠습니까?</strong>
        </div>
        <div className={style.dropInfo}>
          <div>
            <span>이름</span>
            <span>최은우</span>
          </div>
          <div>
            <span>권한</span>
            <span>일반 회원</span>
          </div>
        </div>
        <div className={style.dropButtons}>
          <button className={style.cancelBtn} onClick={onClose}>아니오</button>
          <button className={style.confirmBtn} onClick={onConfirm}>예</button>
        </div>
      </div>
    </div>
  )
}