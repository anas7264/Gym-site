import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const savedLang = localStorage.getItem("gym-lang") || "en";
document.documentElement.dir = savedLang === "ar" || savedLang === "he" ? "rtl" : "ltr";
document.documentElement.lang = savedLang;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
