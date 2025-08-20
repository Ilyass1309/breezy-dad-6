import "./globals.css";
import "notyf/notyf.min.css";

import FlyonuiScript from "../components/FlyonuiScript";

import { NextIntlClientProvider } from "next-intl";

import { getUserLocale } from "../services/locale";
import { getUserTheme } from "../services/theme";

import { AuthProvider } from "../contexts/authcontext";

import { NotyfProvider } from "../contexts/NotyfContext";

export default async function RootLayout({ children }) {
  /* ------------------------------------------------------------------ */
  /* Préférences utilisateur                                            */
  /* ------------------------------------------------------------------ */
  const locale = await getUserLocale(); // ex. “fr” ou “en”
  const userTheme = await getUserTheme(); // ex. “light” / “dark”

  /* RTL pour l’arabe, LTR sinon */
  const dir = locale === "ar" ? "rtl" : "ltr";

  /* ------------------------------------------------------------------ */
  /* Layout HTML                                                        */
  /* ------------------------------------------------------------------ */
  return (
    <html lang={locale} dir={dir} data-theme={userTheme}>
      {/* Provider des traductions */}
      <NextIntlClientProvider locale={locale} dir={dir}>
        {/* Provider d’authentification : tout le site a accès à useAuth */}
        <AuthProvider>
          <body>
            <NotyfProvider>
              {children} {/* pages rendues ici */}
            </NotyfProvider>
          </body>
          {/* Scripts éventuels de ta lib Flyonui */}
          <FlyonuiScript />
        </AuthProvider>
      </NextIntlClientProvider>
    </html>
  );
}
