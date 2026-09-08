"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "bn" | "en";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (bnText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<Language>("bn");

  useEffect(() => {
    document.body.style.fontFamily =
      language === "bn" ? "var(--font-bangla)" : "var(--font-english)";
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "bn" ? "en" : "bn"));
  };

  const t = (bnText: string, enText: string) => {
    return language === "bn" ? bnText : enText;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
