import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMyPage,
  updateNickname as updateNicknameAPI,
  updatePassword as updatePasswordAPI,
} from "../../api/mypage";
import { useKurchiveI18n } from "../../i18n/LocaleContext";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export default function MainPage() {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const myPage = messages.myPage;

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
        alert(myPage.messages.profileLoadFailed);
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
      alert(myPage.messages.newNicknameRequired);
      return;
    }

    await updateNicknameAPI(newNickname);

    // ⭐ 서버 기준으로 다시 가져오기
    const me = await getMyPage();
    setNickname(me.nickname);
    setNewNickname("");
    alert(myPage.messages.nicknameUpdated);
  };

  // =====================
  // 비밀번호 변경
  // =====================

  const updatePassword = async () => {
    if (!currentPW || !newPW || !confirmPW) {
      alert(myPage.messages.passwordFieldsRequired);
      return;
    }

    if (newPW !== confirmPW) {
      alert(myPage.messages.passwordMismatch);
      return;
    }

    try {
      await updatePasswordAPI(currentPW, newPW);

      alert(myPage.messages.passwordUpdated);
      localStorage.removeItem("access_token");
      navigate("/login", { replace: true });
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? myPage.messages.passwordUpdateFailed;
      alert(msg);
    }
  };

  return (
    <main className={styles.nomrg}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.chevronLeft} onClick={() => navigate("/mypage")}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </div>
          <div className={styles.header_title}>
            <p className={styles.sub_title}>{messages.brand.tagline}</p>
            <h1 className={styles.title}>{messages.brand.name}</h1>
          </div>
        </div>
        <div className={styles.mypage} onClick={() => navigate("/mypage")}>
          {myPage.title}
        </div>
      </div>

      <div className={styles.nicknameChange}>
        <h6 className={styles.nicknameChange__title}>{myPage.edit.changeNickname}</h6>
        <div className={styles.nicknameChange__bar}></div>

        <div className={styles.nicknameChange__main}>
          <div className={styles.present__nickname}>
            <div className={styles.present__nickname__title}>
              {myPage.edit.currentNickname}
            </div>
            <div className={styles.present__nickname__data}>{nickname}</div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.new__nickname}>
            <div className={styles.new__nickname__title}>{myPage.edit.newNickname}</div>
            <input
              className={styles.new__nickname__input}
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.nicknameChange__save} onClick={updateNickname}>
          {myPage.edit.saveChanges}
        </div>
      </div>

      <div className={styles.passwordChange}>
        <h6 className={styles.passwordChange__title}>{myPage.edit.changePassword}</h6>
        <div className={styles.nicknameChange__bar}></div>

        <div>
          <div className={styles.passwordChange__input}>
            <div>{myPage.edit.currentPassword}</div>
            <input
              type="password"
              value={currentPW}
              onChange={(e) => setCurrentPW(e.target.value)}
              placeholder={myPage.edit.currentPasswordPlaceholder}
            />
          </div>

          <div className={styles.passwordChange__input}>
            <div>{myPage.edit.newPassword}</div>
            <input
              type="password"
              value={newPW}
              onChange={(e) => setNewPW(e.target.value)}
              placeholder={myPage.edit.newPasswordPlaceholder}
            />
          </div>

          <div className={styles.passwordChange__input}>
            <div>{myPage.edit.confirmPassword}</div>
            <input
              type="password"
              value={confirmPW}
              onChange={(e) => setConfirmPW(e.target.value)}
              placeholder={myPage.edit.confirmPasswordPlaceholder}
            />
          </div>
        </div>
      </div>

      <div className={styles.passwordChange__submit__carrier}>
        <div className={styles.passwordChange__submit} onClick={updatePassword}>
          {myPage.edit.changePassword}
        </div>
        <div className={styles.passwordChange__submit__background}></div>
      </div>

      <div className={styles.designCircle}></div>
    </main>
  );
}
