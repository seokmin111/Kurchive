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

    useEffect(() => {
    document.body.style.overflowY = 'hidden';})

    return (
        //상단
        <main className={styles.nomrg}>
            <div className={styles.header}>
                <div className={styles.chevronLeft}><FontAwesomeIcon icon={faChevronLeft}/></div>
                <div className={styles.header_title}>
                  <p className={styles.sub_title} style={{ display: 'inline' }}>우리만의 미식 지도</p>
                  <h1 className={styles.title} style={{ display: 'inline' }}>커카이브</h1>
                </div>
                <div className={styles.mypage}>마이페이지</div>
            </div>

            <div className={styles.nicknameChange}>
                <h6 className={styles.nicknameChange__title}>닉네임 변경</h6>
                <div className={styles.nicknameChange__bar}></div>
                <div className={styles.nicknameChange__main}>
                    <div className={styles.present__nickname}>
                        <div className={styles.present__nickname__title}>현재 닉네임</div>
                        <div className={styles.present__nickname__data}>ooo</div>
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.new__nickname}>
                        <div className={styles.new__nickname__title}>새 닉네임을 입력하주세요</div>
                        <input className={styles.new__nickname__input} placeholder='닉네임 입력'></input>
                    </div>
                </div>
                <div className={styles.nicknameChange__save}>변경사항 저장하기</div>
            </div>

            <div className={styles.passwordChange}>
                <h6 className={styles.passwordChange__title}>비밀번호 변경</h6>
                <div className={styles.nicknameChange__bar}></div>
                <div>
                    <div className={styles.passwordChange__input}>
                        <div>현재 비밀번호를 입력해주세요</div>
                        <input type='text' placeholder='현재 비밀번호 입력'></input>
                    </div>
                    <div className={styles.passwordChange__input}>
                        <div>변경할 비밀번호를 입력해주세요</div>
                        <input type='text' placeholder='변경할 비밀번호 입력'></input>
                    </div>
                    <div className={styles.passwordChange__input}>
                        <div>변경할 비밀번호를 다시 입력해주세요</div>
                        <input type='text' placeholder='변경할 비밀번호 재입력'></input>
                    </div>
                </div>
            </div>
            <div className={styles.passwordChange__submit__carrier}>
                <div className={styles.passwordChange__submit}>비밀번호 변경하기</div>
                <div className={styles.passwordChange__submit__background}></div>
            </div>
            <div className={styles.designCircle}></div>
        </main>
    );
}