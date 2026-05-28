"use client";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMyPage, MyPageUser } from "../../api/mypage";
import { logout as logoutApi } from "../../api/auth";
import { useKurchiveI18n } from "../../i18n/LocaleContext";

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";

export default function Mypage() {
  const navigate = useNavigate();
  const { locale, messages } = useKurchiveI18n();
  const myPage = messages.myPage;
  const today = new Date();
  const formattedDate =
    locale === "ENG"
      ? today.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const [user, setUser] = useState<MyPageUser | null>(null);

  const roleLabel = (user: MyPageUser) => {
    if (user.role === "admin") return myPage.activityCard.roles.admin;
    if (user.role === "staff") return myPage.activityCard.roles.staff;
    return myPage.activityCard.roles.member;
  };

  useEffect(() => {
    document.body.style.overflowX = "hidden";
  }, []);

  useEffect(() => {
    getMyPage()
      .then(setUser)
      .catch((err) => {
        console.error(err);
        alert(myPage.messages.loginRequired);
        navigate("/login");
      });
  }, [navigate]);

  async function logout() {
    if (!confirm(myPage.messages.logoutConfirm)) return;
    try {
      await logoutApi();
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("access_token");
      alert(myPage.messages.logoutSuccess);
      navigate("/");
    }
  }

  if (!user) return <div>{messages.common.loading}</div>;

  return (
    <main className={styles.nomrg}>
      <img src="/images/curson_logo.png" className={styles.logo} alt="bg" />

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.chevronLeft} onClick={() => navigate("/")}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </div>
          <div className={styles.header_title}>
            <p className={styles.sub_title}>{messages.brand.tagline}</p>
            <h1 className={styles.title}>{messages.brand.name}</h1>
          </div>
        </div>
        <div className={styles.mypage}>{myPage.title}</div>
      </div>

      <div className={styles.info}>
        <div className={styles.info__body}>
          <div className={styles.body__title}>
            <span className={styles.body__title__my}>{myPage.activityCard.prefix} </span>
            <span className={styles.body__title__curchive}>
              {myPage.activityCard.brand}{" "}
            </span>
            <span className={styles.body__title__card}>{myPage.activityCard.suffix}</span>
          </div>

          <div className={styles.body__main}>
            <div className={styles.body__main__picture}>
              <img
                src="/curson_logo.png"
                alt={messages.brand.name}
                className={styles.profile_logo}
              />
            </div>

            <div className={styles.body__main__info}>
              <div className={styles.body__main__info__title}>
                <span>{myPage.activityCard.name}</span>
                <span>{myPage.activityCard.nickname}</span>
                <span>{myPage.activityCard.joined}</span>
                <span>{myPage.activityCard.role}</span>
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
          <div className={styles.body__main__date}>{formattedDate}</div>
        </div>
        <div className={styles.info__shadow}></div>
      </div>

      <div className={styles.info_change} onClick={() => navigate("/infoedit")}>
        {myPage.actions.editProfile}
      </div>

      <div className={styles.bigButtonSplit}>
        <div className={styles.splitItem}>
          <div className={styles.buttonTitle}>{myPage.actions.favorites}</div>
          <div className={styles.buttonSubRow}>
            <span
              className={styles.subItem}
              onClick={() => navigate("/my-restaurant-favorite")}
            >
              {myPage.actions.restaurants}
            </span>

            <span className={styles.subDivider}>|</span>

            <span
              className={styles.subItem}
              onClick={() => navigate("/my-recipe-favorite")}
            >
              {myPage.actions.recipes}
            </span>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.splitItem}>
          <div className={styles.buttonTitle}>{myPage.actions.activity}</div>

          <div className={styles.buttonSubRow}>
            <span
              className={styles.subItem}
              onClick={() => navigate("/my-restaurant-activity")}
            >
              {myPage.actions.restaurants}
            </span>

            <span className={styles.subDivider}>|</span>

            <span
              className={styles.subItem}
              onClick={() => navigate("/my-recipe-activity")}
            >
              {myPage.actions.recipes}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.leave} onClick={logout} style={{ cursor: "pointer" }}>
        <div
          className={styles.leave__title}
          style={{ color: "#8B0028", fontWeight: "500" }}
        >
          {myPage.actions.logout}
        </div>
      </div>

      <div
        className={styles.leave}
        onClick={() => navigate("/quitpage")}
        style={{ marginTop: "8px" }}
      >
        <div className={styles.leave__title}>{myPage.actions.deleteAccount}</div>
        <div className={styles.leave__bar}></div>
      </div>
    </main>
  );
}
