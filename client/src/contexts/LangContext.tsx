import React, { createContext, useContext, useEffect, useState } from "react";
import { Lang, setLang } from "@/lib/i18n";

interface LangContextType {
  lang: Lang;
  changeLang: (l: Lang) => void;
  isRTL: boolean;
}

const LangContext = createContext<LangContextType>({
  lang: "ar",
  changeLang: () => {},
  isRTL: true,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem("lang") as Lang) || "ar"
  );

  useEffect(() => {
    setLang(lang);
  }, [lang]);

  const changeLang = (l: Lang) => {
    setLangState(l);
    setLang(l);
  };

  return (
    <LangContext.Provider value={{ lang, changeLang, isRTL: lang === "ar" }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
