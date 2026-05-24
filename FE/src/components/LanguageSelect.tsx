import { useState } from "react";
import styles from "./LanguageSelect.module.css";
import koreanFlag from "../assets/south-korean-flag.svg";
import americanFlag from "../assets/american-flag.svg";

type LanguageCode = "KOR" | "ENG";

const LANGUAGES: { code: LanguageCode; triggerCode: string; label: string; flag: string }[] = [
  { code: "KOR", triggerCode: "KR", label: "한국어", flag: koreanFlag },
  { code: "ENG", triggerCode: "EN", label: "English", flag: americanFlag },
];

export default function LanguageSelect() {
  const [selected, setSelected] = useState<LanguageCode>("KOR");
  const [isOpen, setIsOpen] = useState(false);

  const selectedLanguage = LANGUAGES.find((language) => language.code === selected) ?? LANGUAGES[0];

  return (
    <div className={styles.languageSelect}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="언어 선택"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={styles.triggerCode}>{selectedLanguage.triggerCode}</span>
        <span className={`${styles.chevron} ${isOpen ? styles.open : ""}`} />
      </button>

      {isOpen && (
        <div className={styles.menu}>
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              className={`${styles.option} ${language.code === selected ? styles.selected : ""}`}
              onClick={() => {
                setSelected(language.code);
                setIsOpen(false);
              }}
            >
              <img src={language.flag} alt="" className={styles.flag} />
              <span className={styles.label}>{language.label}</span>
              {language.code === selected && <span className={styles.check}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
