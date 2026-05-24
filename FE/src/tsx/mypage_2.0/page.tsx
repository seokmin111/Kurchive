"use client"

import styles from './page.module.css';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

import { getMyPage } from "../../api/mypage";
import { MyPageUser } from "../../api/mypage";
import { logout as logoutApi } from "../../api/auth";

import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';


export default function Mypage() {
    const navigate = useNavigate();
    let today = new Date();   // 날짜 구하기
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1;  // 월
    let date = today.getDate();  // 날짜

    const [user, setUser] = useState<MyPageUser | null>(null);
    const roleLabel = (user: MyPageUser) => {
        if (user.role === "admin") return "관리자";
        if (user.role === "staff") return "운영진";
        return "일반 회원";
    };

    // logout

    useEffect(() => {
        document.body.style.overflowX = 'hidden';
    },[]);

    useEffect(() => {
        getMyPage()
            .then(setUser)
            .catch(err => {
                console.error(err);
                alert("로그인이 필요합니다.");
                navigate("/login");
            });
    }, [navigate]);

    async function logout() {
        if (!confirm("로그아웃 하시겠습니까?")) return;
        try {
            await logoutApi(); 
        } catch (err) {
            console.error(err);
        } finally {
            localStorage.removeItem("access_token");
            alert("로그아웃 되었습니다.");
            navigate("/");
        }
    }

    if (!user) return <div>로딩중...</div>;

    return (
        <main className={styles.nomrg}>
            {/* 배경 장식용 로고 위치를 카드 밖 컨테이너로 뺌 */}
            <img src="/images/curson_logo.png" className={styles.logo} alt="bg" />

            <div className={styles.header}>
                {/* ✅ CSS 정렬을 위해 왼쪽 아이템들을 묶음 */}
                <div className={styles.headerLeft}>
                    <div className={styles.chevronLeft} onClick={() => navigate("/")}>
                        <FontAwesomeIcon icon={faChevronLeft}/>
                    </div>
                    <div className={styles.header_title}>
                        <p className={styles.sub_title}>우리만의 미식 지도</p>
                        <h1 className={styles.title}>커카이브</h1>
                    </div>
                </div>
                <div className={styles.mypage}>마이페이지</div>
            </div>

            <div className={styles.info}>
                <div className={styles.info__body}>
                    <div className={styles.body__title}>
                        <span className={styles.body__title__my}>나의 </span>
                        <span className={styles.body__title__curchive}>커카이브 </span>
                        <span className={styles.body__title__card}>활동카드</span>
                    </div>
                    
                    <div className={styles.body__main}>
                        <div className={styles.body__main__picture}>
                            <img
                                src="/curson_logo.png"
                                alt="커카이브 로고"
                                className={styles.profile_logo}
                            />
                        </div>

                        <div className={styles.body__main__info}>
                            <div className={styles.body__main__info__title}>
                                <span>이름</span>
                                <span>닉네임</span>
                                <span>가입일</span>
                                <span>등급</span>
                            </div>
                            <div className={styles.body__main__info__info}>
                                <span>{user.name}</span>
                                <span>{user.nickname}</span>
                                <span>
                                    {user.created_at
                                        ? new Date(user.created_at).toLocaleDateString()
                                        : "-"}
                                </span>
                                <span>{roleLabel(user)}</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.body__main__date}>{year}년 {month}월 {date}일</div>
                </div>
                {/* 카드의 배경 그림자 역할을 하는 태그 */}
                <div className={styles.info__shadow}></div>
            </div>

            <div className={styles.info_change} onClick={() => navigate("/infoedit")}>
                사용자 정보 수정하기 
            </div>
                                    
            <div className={styles.bigButtonSplit}>

            <div
                className={styles.splitItem}
            >
                <div className={styles.buttonTitle}
                >나의 찜목록</div>
                <div className={styles.buttonSubRow}>
                    <span
                        className={styles.subItem}
                        onClick={() => navigate("/my-restaurant-favorite")}
                    >
                        식당
                    </span>

                    <span className={styles.subDivider}>|</span>

                    <span
                        className={styles.subItem}
                        onClick={() => navigate("/my-recipe-favorite")}
                    >
                        레시피
                    </span>
                </div>
            </div>

            <div className={styles.divider}></div>

            <div
                className={styles.splitItem}
                >
                <div className={styles.buttonTitle}>내 활동기록</div>

                <div className={styles.buttonSubRow}>
                    <span
                    className={styles.subItem}
                    onClick={() => navigate("/my-restaurant-activity")}
                    >
                    식당
                    </span>

                    <span className={styles.subDivider}>|</span>

                    <span
                    className={styles.subItem}
                    onClick={() => navigate("/my-recipe-activity")}
                    >
                    레시피
                    </span>
                </div>
                </div>

            </div>
            <div 
                className={styles.leave} 
                onClick={logout} 
                style={{ cursor: 'pointer' }}
            >
                <div className={styles.leave__title} style={{ color: '#8B0028', fontWeight: '500' }}>로그아웃</div>
            </div>
            
            <div className={styles.leave} onClick={() => navigate("/quitpage")} style={{ marginTop: '8px' }}>
                <div className={styles.leave__title}>회원 탈퇴하기</div>
                <div className={styles.leave__bar}></div>
            </div>
        </main>
    );
}