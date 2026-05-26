import { useState } from "react";
import styles from "./LanguageSelect.module.css";
import koreanFlag from "../assets/south-korean-flag.svg";
import americanFlag from "../assets/american-flag.svg";
import { LocaleCode, useKurchiveI18n } from "../i18n/LocaleContext";

const LANGUAGES: { code: LocaleCode; triggerCode: string; label: string; flag: string }[] = [
  { code: "KOR", triggerCode: "KR", label: "한국어", flag: koreanFlag },
  { code: "ENG", triggerCode: "EN", label: "English", flag: americanFlag },
];

type LanguageSelectProps = {
  value?: LocaleCode;
  onChange?: (language: LocaleCode) => void;
  labels?: Partial<Record<LocaleCode, string>>;
};

export default function LanguageSelect({ value, onChange, labels }: LanguageSelectProps) {
  const { locale, setLocale, messages } = useKurchiveI18n();
  const [isOpen, setIsOpen] = useState(false);

  const selected = value ?? locale;
  const selectedLanguage = LANGUAGES.find((language) => language.code === selected) ?? LANGUAGES[0];
  const optionLabels = labels ?? {
    KOR: messages.language.korean,
    ENG: messages.language.english,
  };

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
                if (onChange) {
                  onChange(language.code);
                } else {
                  setLocale(language.code);
                }
                setIsOpen(false);
              }}
            >
              <img src={language.flag} alt="" className={styles.flag} />
              <span className={styles.label}>{optionLabels[language.code] ?? language.label}</span>
              {language.code === selected && <span className={styles.check}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
