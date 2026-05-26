import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import koMessages from "../messages/ko/common.json";
import enMessages from "../messages/en/common.json";

export type LocaleCode = "KOR" | "ENG";

const STORAGE_KEY = "kurchive_locale";

const messagesByLocale = {
  KOR: koMessages,
  ENG: enMessages,
} as const;

type KurchiveMessages = typeof koMessages;

type LocaleContextValue = {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  messages: KurchiveMessages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const getInitialLocale = (): LocaleCode => {
  if (typeof window === "undefined") return "KOR";
  return window.localStorage.getItem(STORAGE_KEY) === "ENG" ? "ENG" : "KOR";
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(getInitialLocale);

  const setLocale = (nextLocale: LocaleCode) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages: messagesByLocale[locale] as KurchiveMessages,
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useKurchiveI18n() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useKurchiveI18n must be used within LocaleProvider");
  }

  return context;
}
