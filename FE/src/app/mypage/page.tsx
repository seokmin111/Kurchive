"use client"

import styles from './page.module.css';
import Link from 'next/link';
import axios from 'axios';
import { useEffect } from 'react';

import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

export default function MainPage() {

    let today = new Date();   //날짜 구하기
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1;  // 월
    let date = today.getDate();  // 날짜

    useEffect(() => {
    document.body.style.overflowX = 'hidden';})

    return (
        <main className={styles.nomrg}>
            <div className={styles.header}>
                <div className={styles.chevronLeft}><FontAwesomeIcon icon={faChevronLeft}/></div>
                <div className={styles.header_title}>
                  <p className={styles.sub_title} style={{ display: 'inline' }}>우리만의 미식 지도</p>
                  <h1 className={styles.title} style={{ display: 'inline' }}>커카이브</h1>
                </div>
                <div className={styles.mypage}>마이페이지</div>
            </div>
            <div className={styles.info}>
                <div className={styles.info__body}>
                    <img src="/images/curson_logo.png" className={styles.info__logo}/>
                    <div className={styles.body__title}>
                        <span className={styles.body__title__my}>나의 </span>
                        <span className={styles.body__title__curchive}> 커카이브 </span>
                        <span className={styles.body__title__card}> 활동카드</span>
                    </div>
                    <div className={styles.body__main}>
                        <div className={styles.body__main__picture}></div>
                        <div className={styles.body__main__info}>
                            <div className={styles.body__main__info__title}>
                                <span>이름</span>
                                <span>닉네임</span>
                                <span>권한</span>
                                <span>가입일자</span>
                            </div>
                            <div className={styles.body__main__info__info}>
                                <span>ooo</span>
                                <span>ooo</span>
                                <span>ooo</span>
                                <span>ooo</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.body__main__date}>{year}년 {month}월 {date}일</div>
                </div>
                <div className={styles.info__shadow}></div>
                <img src="/images/curson_logo.png" className={styles.logo}/>
            </div>
            <div className={styles.info_change}>기존 정보 수정하기</div>
            <div className={styles.mychoice}>
                <div className={styles.mychoice__title}>나의 찜목록 보러가기</div>
                <div className={styles.mychoice__specefic}>
                  <span className={styles.mychoice__restaurant}>식당</span>
                  <span className={styles.mychoice__bar}> | </span>
                  <span className={styles.mychoice__recipe}>레시피</span>
                </div>
            </div>
            <div className={styles.leave}>
              <div className={styles.leave__title}>회원 탈퇴하기</div>
              <div className={styles.leave__bar}></div>
            </div>
        </main>
    );
}
//const data:[] = 