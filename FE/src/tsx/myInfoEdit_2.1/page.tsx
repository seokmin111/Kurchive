import styles from "./page.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyPage, updateNickname as updateNicknameAPI, updatePassword as updatePasswordAPI } from "../../api/mypage";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";


export default function MainPage() {

    // =====================
    // state
    // =====================
    const [nickname, setNickname] = useState("");
    const [newNickname, setNewNickname] = useState("");

    const [currentPW, setCurrentPW] = useState("");
    const [newPW, setNewPW] = useState("");
    const [confirmPW, setConfirmPW] = useState("");

    // =====================
    // 내 정보 조회
    // =====================
    useEffect(() => {
        document.body.style.overflowY = "hidden";

        getMyPage()
            .then((me) => {
            setNickname(me.nickname);
            })
            .catch(() => {
            alert("내 정보를 불러오지 못했습니다.");
            });

        return () => {
            document.body.style.overflowY = "auto";
        };
        }, []);


    // =====================
    // 닉네임 변경
    // =====================
 
    const updateNickname = async () => {
        if (!newNickname.trim()) {
            alert("새 닉네임을 입력해주세요");
            return;
        }

        await updateNicknameAPI(newNickname);

        // ⭐ 서버 기준으로 다시 가져오기
        const me = await getMyPage();
        setNickname(me.nickname);

        setNewNickname("");
        alert("닉네임이 변경되었습니다");
        };


    // =====================
    // 비밀번호 변경
    // =====================
    const navigate = useNavigate();

    const updatePassword = async () => {
        if (!currentPW || !newPW || !confirmPW) {
            alert("모든 비밀번호를 입력해주세요");
            return;
        }

        if (newPW !== confirmPW) {
            alert("새 비밀번호가 일치하지 않습니다");
            return;
        }

        try {
            await updatePasswordAPI(currentPW, newPW);

            alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");

            localStorage.removeItem("access_token");
            navigate("/login", { replace: true });

        } catch (e: any) {
            const msg =
            e?.response?.data?.detail ??
            "비밀번호 변경에 실패했습니다.";
            alert(msg);
        }
        };


    return (
        <main className={styles.nomrg}>
            {/* 상단 */}
            <div className={styles.header}>
                <div className={styles.chevronLeft} onClick={() => navigate("/main")}>
                    <FontAwesomeIcon icon={faChevronLeft}
                     />
                </div>
                <div className={styles.header_title}>
                    <p className={styles.sub_title} style={{ display: 'inline' }}>우리만의 미식 지도</p>
                    <h1 className={styles.title} style={{ display: 'inline' }}>커카이브</h1>
                </div>
                <div
                    className={styles.mypage}
                    onClick={() => navigate("/mypage")}
                    >
                    마이페이지
                    </div>

            </div>

            {/* 닉네임 변경 */}
            <div className={styles.nicknameChange}>
                <h6 className={styles.nicknameChange__title}>닉네임 변경</h6>
                <div className={styles.nicknameChange__bar}></div>

                <div className={styles.nicknameChange__main}>
                    <div className={styles.present__nickname}>
                        <div className={styles.present__nickname__title}>현재 닉네임</div>
                        <div className={styles.present__nickname__data}>
                            {nickname}
                        </div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.new__nickname}>
                        <div className={styles.new__nickname__title}>
                            새 닉네임을 입력해주세요
                        </div>
                        <input
                            className={styles.new__nickname__input}
                            value={newNickname}
                            onChange={(e) => setNewNickname(e.target.value)}
                        />
                    </div>
                </div>

                <div
                    className={styles.nicknameChange__save}
                    onClick={updateNickname}
                >
                    변경사항 저장하기
                </div>
            </div>

            {/* 비밀번호 변경 */}
            <div className={styles.passwordChange}>
                <h6 className={styles.passwordChange__title}>비밀번호 변경</h6>
                <div className={styles.nicknameChange__bar}></div>

                <div>
                    <div className={styles.passwordChange__input}>
                        <div>현재 비밀번호를 입력해주세요</div>
                        <input
                            type="password"
                            value={currentPW}
                            onChange={(e) => setCurrentPW(e.target.value)}
                            placeholder="현재 비밀번호 입력"
                        />
                    </div>

                    <div className={styles.passwordChange__input}>
                        <div>변경할 비밀번호를 입력해주세요</div>
                        <input
                            type="password"
                            value={newPW}
                            onChange={(e) => setNewPW(e.target.value)}
                            placeholder="변경할 비밀번호 입력"
                        />
                    </div>

                    <div className={styles.passwordChange__input}>
                        <div>변경할 비밀번호를 다시 입력해주세요</div>
                        <input
                            type="password"
                            value={confirmPW}
                            onChange={(e) => setConfirmPW(e.target.value)}
                            placeholder="변경할 비밀번호 재입력"
                        />
                    </div>
                </div>
            </div>

            <div className={styles.passwordChange__submit__carrier}>
                <div
                    className={styles.passwordChange__submit}
                    onClick={updatePassword}
                >
                    비밀번호 변경하기
                </div>
                <div className={styles.passwordChange__submit__background}></div>
            </div>

            <div className={styles.designCircle}></div>
        </main>
    );
}
