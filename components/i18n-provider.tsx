"use client";

import ru from "@/lib/i18n/ru.json";
import en from "@/lib/i18n/en.json";
import { createContext, useContext, useMemo, useState } from "react";

type Lang = "ru" | "en";
type Dictionary = typeof ru;

const I18nContext = createContext<{
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dictionary;
} | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ru");
  const value = useMemo(() => ({ lang, setLang, t: lang === "ru" ? ru : en }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
