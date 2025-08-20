"use server";

import { cookies } from "next/headers";
const COOKIE_NAME = "BREEZY_THEME";

export async function getUserTheme() {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function setUserTheme(theme) {
  (await cookies()).set(COOKIE_NAME, theme);
}
