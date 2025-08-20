import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const userCookies = await cookies();
  const locale =
    userCookies.get("BREEZY_LOCALE")?.value ||
    "en";
  return {
    locale,
    messages: (await import(`/messages/${locale}.json`)).default,
  };
});
