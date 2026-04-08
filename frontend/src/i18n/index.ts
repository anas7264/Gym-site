import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./translations";

const savedLang = localStorage.getItem("gym-lang") || "en";

i18n.use(initReactI18next).init({
  resources: translations,
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
  localStorage.setItem("gym-lang", lang);
  document.documentElement.dir = lang === "ar" || lang === "he" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
};

// Set initial direction
document.documentElement.dir = savedLang === "ar" || savedLang === "he" ? "rtl" : "ltr";
document.documentElement.lang = savedLang;

export default i18n;
