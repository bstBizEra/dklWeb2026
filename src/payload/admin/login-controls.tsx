"use client";

import { useTheme } from "@payloadcms/ui";
import { useEffect, useState } from "react";

export type CmsLanguage = "en" | "lo";

export function useCmsLanguage() {
  const [language, setLanguage] = useState<CmsLanguage>("en");
  useEffect(() => {
    const readSaved = () => setLanguage(window.localStorage.getItem("dklao-cms-language") === "lo" ? "lo" : "en");
    queueMicrotask(readSaved);
    window.addEventListener("storage", readSaved);
    window.addEventListener("dklao-cms-language", readSaved);
    return () => { window.removeEventListener("storage", readSaved); window.removeEventListener("dklao-cms-language", readSaved); };
  }, []);
  function changeLanguage(next: CmsLanguage) {
    setLanguage(next);
    window.localStorage.setItem("dklao-cms-language", next);
    window.dispatchEvent(new Event("dklao-cms-language"));
  }
  return { language, changeLanguage };
}

export default function LoginControls({ language, onLanguageChange }: {
  language: CmsLanguage; onLanguageChange: (value: CmsLanguage) => void;
}) {
  const { setTheme } = useTheme();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const readTheme = () => setDark(document.documentElement.dataset.theme === "dark");
    const observer = new MutationObserver(readTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    queueMicrotask(readTheme);
    return () => observer.disconnect();
  }, []);
  function changeTheme() {
    const next = dark ? "light" : "dark";
    setDark(!dark);
    document.documentElement.dataset.theme = next;
    document.cookie = `payload-theme=${next}; Max-Age=31536000; Path=/; SameSite=Lax`;
    setTheme(next);
  }
  return <div className="cms-login-controls" lang={language} aria-label={language === "lo" ? "ການສະແດງຜົນ" : "Display settings"}>
    <div className="cms-login-controls__group" role="group" aria-label={language === "lo" ? "ພາສາ" : "Language"}>
      <button type="button" lang="en" aria-pressed={language === "en"} onClick={() => onLanguageChange("en")}>EN</button>
      <button type="button" lang="lo" aria-pressed={language === "lo"} onClick={() => onLanguageChange("lo")}>ລາວ</button>
    </div>
    <button className="cms-login-controls__theme" type="button" role="switch" aria-label={language === "lo" ? `ໂໝດ${dark ? "ມືດ" : "ສະຫວ່າງ"}` : `${dark ? "Dark" : "Light"} theme`} aria-checked={dark} onClick={changeTheme}>
      <span className="cms-login-controls__theme-mark" aria-hidden="true" /><span>{dark ? (language === "lo" ? "ມືດ" : "Dark") : (language === "lo" ? "ສະຫວ່າງ" : "Light")}</span>
    </button>
  </div>;
}
