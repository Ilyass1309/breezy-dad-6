"use server";

import { cookies } from "next/headers";
import { getLocale, setRequestLocale } from "next-intl/server";

const COOKIE_NAME = "BREEZY_LOCALE";

export async function getUserLocale() {
  return getLocale() || (await cookies()).get(COOKIE_NAME)?.value || "en";
}

export async function setUserLocale(locale) {
  setRequestLocale(locale);
  (await cookies()).set(COOKIE_NAME, locale);
}
