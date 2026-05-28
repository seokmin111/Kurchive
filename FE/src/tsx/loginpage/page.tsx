import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import style from "./page.module.css";
import client from "../../api/client";
import LanguageSelect from "../../components/LanguageSelect";
import { useKurchiveI18n } from "../../i18n/LocaleContext";

interface FormData {
  id: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { messages } = useKurchiveI18n();
  const login = messages.auth.login;

  const [formData, setFormData] = useState<FormData>({
    id: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // 백엔드 스펙 맞추기: ID/PW (대문자)
      const res = await client.post("/login", {
        ID: formData.id,
        PW: formData.password,
      });

      const token = res.data?.access_token;
      if (!token) throw new Error("Missing access_token");

      // 프로젝트 전체에서 이 키로 통일(인터셉터가 이거 읽음)
      localStorage.setItem("access_token", token);
      navigate("/");
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;

      // 422면 “요청 형식 틀림” (대부분 키 불일치)
      if (status === 422) {
        alert(login.errors.invalidRequest);
      } else if (status === 401) {
        alert(login.errors.invalidCredentials);
      } else {
        alert(detail || login.errors.failed);
      }

      console.error(err);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.languageSlot}>
        <LanguageSelect />
      </div>
      <header className={style.header}>
        {login.notice}
      </header>
      <main className={style.main}>
        <div className={style.logoGroup}>
          <img className={style.logo} src="/curson_logo.png" alt="logo" />
          <div className={style.brandName}>{messages.brand.name}</div>
          <div className={style.pageTitle}>{login.title}</div>
        </div>

        <form className={style.loginForm} onSubmit={handleSubmit}>
          <div className={style.inputGroup}>
            <label htmlFor="id">{login.idLabel}</label>
            <input
              type="text"
              id="id"
              name="id"
              placeholder={login.idPlaceholder}
              required
              value={formData.id}
              onChange={handleChange}
            />
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="password">{login.passwordLabel}</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder={login.passwordPlaceholder}
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className={style.loginButton}>
            {login.submit}
          </button>
        </form>
      </main>

      <footer className={style.footer}>
        <button
          type="button"
          className={style.signupButton}
          onClick={() => navigate("/signup")}
        >
          {login.signup}
        </button>
      </footer>
    </div>
  );
}
