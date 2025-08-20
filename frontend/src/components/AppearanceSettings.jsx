"use client";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { getUserLocale, setUserLocale } from "../services/locale";
import { getUserTheme, setUserTheme } from "../services/theme";

export default function AppearanceSettings() {
  const t = useTranslations("AppearanceSettings");
  const [theme, setTheme] = useState(null);
  const [language, setLanguage] = useState(null);

  // Récupération du thème et de la langue
  useEffect(() => {
    getUserTheme().then((storedTheme) => storedTheme && setTheme(storedTheme));
    getUserLocale().then(
      (storedLanguage) => storedLanguage && setLanguage(storedLanguage)
    );
  }, []);

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);
    setUserTheme(selectedTheme);
  };

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    setUserLocale(selectedLanguage);
  };

  return (
    <>
      <div className="dropdown relative">
        <button
          id="dropdown-default"
          type="button"
          className="dropdown-toggle btn btn-primary btn-outline max-sm:btn-square"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-label="Dropdown"
        >
          <span className="max-sm:hidden">{t("theme")}</span>
          <span className="icon-[tabler--palette] block size-6"></span>
          <span className="icon-[tabler--chevron-down] dropdown-open:rotate-180 size-5 max-sm:hidden"></span>
        </button>
        <ul
          className="dropdown-menu dropdown-open:opacity-100 hidden min-w-40"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="dropdown-default"
        >
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller btn btn-text w-full justify-start"
              aria-label={t("systemTheme")}
              value=""
              checked={theme === null || theme === ""}
              onChange={handleThemeChange}
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller btn btn-text w-full justify-start"
              aria-label={t("lightTheme")}
              value="light"
              checked={theme === "light"}
              onChange={handleThemeChange}
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller btn btn-text w-full justify-start"
              aria-label={t("darkTheme")}
              value="dark"
              checked={theme === "dark"}
              onChange={handleThemeChange}
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller btn btn-text w-full justify-start"
              aria-label={t("blackTheme")}
              value="black"
              checked={theme === "black"}
              onChange={handleThemeChange}
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller btn btn-text w-full justify-start"
              aria-label="Gourmet"
              value="gourmet"
              checked={theme === "gourmet"}
              onChange={handleThemeChange}
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller btn btn-text w-full justify-start"
              aria-label="Corporate"
              value="corporate"
              checked={theme === "corporate"}
              onChange={handleThemeChange}
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller btn btn-text w-full justify-start"
              aria-label="Luxury"
              value="luxury"
              checked={theme === "luxury"}
              onChange={handleThemeChange}
            />
          </li>
          <li>
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller btn btn-text w-full justify-start"
              aria-label="Soft"
              value="soft"
              checked={theme === "soft"}
              onChange={handleThemeChange}
            />
          </li>
        </ul>
      </div>
      <div className="dropdown relative">
        <button
          id="dropdown-default"
          type="button"
          className="dropdown-toggle btn btn-secondary btn-outline max-sm:btn-square"
          aria-haspopup="menu"
          aria-expanded="false"
          aria-label="Dropdown"
        >
          <span className="max-sm:hidden">{t("language")}</span>
          <span className="icon-[tabler--language] block size-6"></span>
          <span className="icon-[tabler--chevron-down] dropdown-open:rotate-180 size-5 max-sm:hidden"></span>
        </button>
        <ul
          className="dropdown-menu dropdown-open:opacity-100 hidden min-w-40"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="dropdown-default"
        >
          <li>
            <input
              type="radio"
              name="language-dropdown"
              className="language-controller btn btn-text w-full justify-start"
              aria-label="English"
              value="en"
              checked={language === "en"}
              onChange={handleLanguageChange}
            />
          </li>
          <li>
            <input
              type="radio"
              name="language-dropdown"
              className="language-controller btn btn-text w-full justify-start"
              aria-label="Français"
              value="fr"
              checked={language === "fr"}
              onChange={handleLanguageChange}
            />
          </li>
          <li>
            <input
              type="radio"
              name="language-dropdown"
              className="language-controller btn btn-text w-full justify-start"
              aria-label="Deutsch"
              value="de"
              checked={language === "de"}
              onChange={handleLanguageChange}
            />
          </li>
          <li>
            <input
              type="radio"
              name="language-dropdown"
              className="language-controller btn btn-text w-full justify-start"
              aria-label="العربية"
              value="ar"
              checked={language === "ar"}
              onChange={handleLanguageChange}
            />
          </li>
          <li>
            <input
              type="radio"
              name="language-dropdown"
              className="language-controller btn btn-text w-full justify-start"
              aria-label="中文"
              value="zh"
              checked={language === "zh"}
              onChange={handleLanguageChange}
            />
          </li>
        </ul>
      </div>
    </>
  );
}
