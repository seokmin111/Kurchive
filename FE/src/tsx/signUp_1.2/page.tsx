"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./page.module.css";
import client from "../../api/client";
import LanguageSelect from "../../components/LanguageSelect";

export default function SignupPage() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [nickname, setNickname] = useState("");
  const [name, setName] = useState("");

  const [joinCode, setJoinCode] = useState("");

  const [idChecked, setIdChecked] = useState(false);
  const [nickChecked, setNickChecked] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  const [idMsg, setIdMsg] = useState<string | null>(null);
  const [nickMsg, setNickMsg] = useState<string | null>(null);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);

  const pwMatch = useMemo(() => pw.length > 0 && pw === pw2, [pw, pw2]);

  // 입력 바뀌면 “확인 상태” 리셋 (중요)
  const onChangeId = (v: string) => {
    setUserId(v);
    setIdChecked(false);
    setIdMsg(null);
  };
  const onChangeNick = (v: string) => {
    setNickname(v);
    setNickChecked(false);
    setNickMsg(null);
  };
  const onChangeCode = (v: string) => {
    setJoinCode(v);
    setCodeVerified(false);
    setCodeMsg(null);
  };

  const canSubmit =
    userId.trim().length >= 3 &&
    pwMatch &&
    nickname.trim().length >= 2 &&
    name.trim().length >= 1 &&
    idChecked &&
    nickChecked &&
    codeVerified;

  // ---- API---
  const checkId = async () => {
  const v = userId.trim();
  if (v.length < 3) {
    setIdChecked(false);
    setIdMsg("ID는 3자 이상 입력해 주세요.");
    return;
  }

  try {
    // GET /signup/check_id?userid=...
    const res = await client.get("/signup/check_id", { params: { userid: v } });
    const isDup = Boolean(res.data?.isDuplicate);

    if (isDup) {
      setIdChecked(false);
      setIdMsg("이미 존재하는 ID입니다.");
    } else {
      setIdChecked(true);
      setIdMsg("사용 가능한 ID입니다.");
    }
  } catch {
    setIdChecked(false);
    setIdMsg("ID 중복 확인에 실패했습니다.");
  }
};


  const checkNickname = async () => {
  const v = nickname.trim();
  if (v.length < 2) {
    setNickChecked(false);
    setNickMsg("닉네임은 2자 이상 입력해 주세요.");
    return;
  }

  try {
    // GET /check_nickname?nickname=...
    const res = await client.get("/check_nickname", { params: { nickname: v } });
    const isDup = Boolean(res.data?.isDuplicate);

    if (isDup) {
      setNickChecked(false);
      setNickMsg("이미 존재하는 닉네임입니다.");
    } else {
      setNickChecked(true);
      setNickMsg("사용 가능한 닉네임입니다.");
    }
  } catch {
    setNickChecked(false);
    setNickMsg("닉네임 중복 확인에 실패했습니다.");
  }
};

{/* 가입 코드 확인 */}
  const verifyJoinCode = async () => {
  const v = joinCode.trim();
  if (!v) {
    setCodeVerified(false);
    setCodeMsg("가입 코드를 입력해 주세요.");
    return;
  }

  try {
    // POST /validate_code  body: { code }
    const res = await client.post("/validate_code", { code: v });
    const status = res.data?.status as "valid" | "invalid" | "inactive";

    if (status === "valid") {
      setCodeVerified(true);
      setCodeMsg("가입 코드가 확인되었습니다.");
    } else if (status === "inactive") {
      setCodeVerified(false);
      setCodeMsg("비활성화된 가입 코드입니다.");
    } else {
      setCodeVerified(false);
      setCodeMsg("가입 코드가 존재하지 않습니다.");
    }
  } catch {
    setCodeVerified(false);
    setCodeMsg("가입 코드 확인에 실패했습니다.");
  }
};

{/* 회원가입 제출 */ }
  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 프론트에서 1차 방어(UX)
  if (pw !== pw2) {
    alert("비밀번호 확인이 일치하지 않습니다.");
    return;
  }

  try {
    // POST /signup
    await client.post("/signup", {
      userid: userId.trim(),
      pw,
      pwConfirm: pw2,
      nickname: nickname.trim(),
      name: name.trim(),
      code: joinCode.trim(),
    });

    alert("회원가입 성공!");
    navigate("/login");
  } catch (err: any) {
    // FastAPI HTTPException detail이 여기로 옴
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      "회원가입에 실패했습니다.";
    alert(msg);
  }
};


  return (
    <div className={styles.container}>
      <div className={styles.languageSlot}>
        <LanguageSelect />
      </div>
      {/* 배너(피그마의 배너 이미지 영역) */}
      <div className={styles.header}>배너 이미지</div>

      {/* 카드 */}
      <main className={styles.main}>
        <div className={styles.logoGroup}>
          {/* 여기에 로고 이미지 넣고 싶으면 img 태그 추가 */}
          <h1 className={styles.title}>커카이브</h1>
          <p className={styles.subTitle}>회원가입</p>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          {/* ID + 중복확인 (버튼 붙는 애는 inputRow) */}
          <div className={styles.inputGroup}>
            <label htmlFor="userId">ID</label>

            <div className={styles.inputWrap}>
                <input
                id="userId"
                value={userId}
                onChange={(e) => onChangeId(e.target.value)}
                />
                <button
                type="button"
                className={styles.inlineBtn}
                onClick={checkId}
                >
                중복확인
                </button>
            </div>

            {idMsg && (
                <p className={idChecked ? styles.okText : styles.errText}>{idMsg}</p>
            )}
            </div>


          {/* Password (세로) */}
          <div className={styles.inputGroup}>
            <label htmlFor="pw">Password</label>
            <input
              id="pw"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </div>

          {/* Password 확인 (세로) */}
          <div className={styles.inputGroup}>
            <label htmlFor="pw2">Password 확인</label>
            <input
              id="pw2"
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
            />
            {!pwMatch && pw2.length > 0 && (
              <p className={styles.errText}>비밀번호가 일치하지 않습니다</p>
            )}
          </div>

          {/* 닉네임 + 중복확인 */}
         <div className={styles.inputGroup}>
            <label htmlFor="nickname">닉네임</label>

            <div className={styles.inputWrap}>
                <input
                id="nickname"
                value={nickname}
                onChange={(e) => onChangeNick(e.target.value)}
                />
                <button
                type="button"
                className={styles.inlineBtn}
                onClick={checkNickname}
                >
                중복확인
                </button>
            </div>

            {nickMsg && (
                <p className={nickChecked ? styles.okText : styles.errText}>{nickMsg}</p>
            )}
            </div>


          {/* 이름 */}
          <div className={styles.inputGroup}>
            <label htmlFor="name">이름</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 커손연 코드 + 확인 */}
         <div className={styles.inputGroup}>
        <label htmlFor="joinCode">커손연 회원 코드 입력하기</label>

        <div className={styles.inputWrap}>
            <input
            id="joinCode"
            value={joinCode}
            onChange={(e) => onChangeCode(e.target.value)}
            />
            <button
            type="button"
            className={styles.inlineBtn}
            onClick={verifyJoinCode}
            >
            확인
            </button>
        </div>

        {codeMsg && (
            <p className={codeVerified ? styles.okText : styles.errText}>{codeMsg}</p>
        )}
        </div>


          <button
            className={styles.signupButton}
            type="submit"
            disabled={!canSubmit}
          >
            회원가입
          </button>

          {/* (선택) 이미 계정 있으면 로그인으로 */}
          <button
            type="button"
            className={styles.backToLoginBtn}
            onClick={() => navigate("/login")}
          >
            로그인으로 돌아가기
          </button>
        </form>
      </main>
    </div>
  );
}
