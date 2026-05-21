import { useState } from "react";
import styles from "./LanguageSelect.module.css";
import koreanFlag from "../assets/south-korean-flag.svg";
import americanFlag from "../assets/american-flag.svg";

type LanguageCode = "KOR" | "ENG";

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: "KOR", label: "한국어", flag: koreanFlag },
  { code: "ENG", label: "English", flag: americanFlag },
];

export default function LanguageSelect() {
  const [selected, setSelected] = useState<LanguageCode>("KOR");
  const [isOpen, setIsOpen] = useState(false);

  const selectedLanguage = LANGUAGES.find((language) => language.code === selected) ?? LANGUAGES[0];
  const otherLanguages = LANGUAGES.filter((language) => language.code !== selected);

  return (
    <div className={styles.languageSelect}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="언어 선택"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <img src={selectedLanguage.flag} alt="" className={styles.flag} />
        <span className={styles.code}>{selectedLanguage.code}</span>
        <span className={`${styles.chevron} ${isOpen ? styles.open : ""}`} />
      </button>

      {isOpen && (
        <div className={styles.menu}>
          {otherLanguages.map((language) => (
            <button
              key={language.code}
              type="button"
              className={styles.option}
              onClick={() => {
                setSelected(language.code);
                setIsOpen(false);
              }}
            >
              <img src={language.flag} alt="" className={styles.flag} />
              <span className={styles.code}>{language.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
