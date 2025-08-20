"use client";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/authcontext";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useNotyf } from "@/contexts/NotyfContext";

export default function LoginForm() {
  const t = useTranslations("Auth");

  const notyf = useNotyf();

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState("");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

    try {
      await login(identifier, password, rememberMe);
      router.push(searchParams.get("from") || "/home");
    } catch (error) {
      setError(error.message || "auth failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => setError("");

  return (
    <div className="bg-base-100 flex h-auto min-h-screen items-center justify-center overflow-x-hidden py-10">
      <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-base-100 shadow-base-300/20 z-1 w-full space-y-6 rounded-xl p-6 shadow-md sm:min-w-md lg:p-8">
          <div className="flex items-center gap-3">
            {/* <img
              src="https://cdn.flyonui.com/fy-assets//logo/logo.png"
              className="size-8"
              alt="brand-logo"
            /> */}
            <h2 className="text-base-content text-xl font-bold">Breezy</h2>
          </div>
          <div>
            <h3 className="text-base-content mb-1.5 text-2xl font-semibold">
              {t("loginTitle")}
            </h3>
            <p className="text-base-content/80">{t("loginDescription")}</p>
          </div>
          {/* Affichage de l'alerte en cas d'erreur */}
          {error && (
            <div
              className="alert alert-soft alert-error removing:translate-x-5 removing:opacity-0 flex items-center gap-4 transition duration-300 ease-in-out"
              role="alert"
              id="dismiss-alert1"
            >
              {error}
              <button
                className="ms-auto cursor-pointer leading-none"
                data-remove-element="#dismiss-alert1"
                aria-label="Close Button"
                onClick={handleCloseAlert}
                type="button"
              >
                <span className="icon-[tabler--x] size-5"></span>
              </button>
            </div>
          )}
          <div className="space-y-4">
            <form className="mb-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="label-text" htmlFor="userIdentifier">
                  {t("identifier")}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t("identifierPlaceholder")}
                  className="input"
                  id="userIdentifier"
                  required
                />
              </div>
              <div>
                <label className="label-text" htmlFor="userPassword">
                  {t("password")}
                </label>
                <div className="input">
                  <input
                    id="userPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="············"
                    required
                  />
                  <button
                    type="button"
                    data-toggle-password='{ "target": "#userPassword" }'
                    className="block cursor-pointer"
                    aria-label="userPassword"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-y-2 flex-col md:flex-row">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label
                    className="label-text text-base-content/80 p-0 text-base"
                    htmlFor="rememberMe"
                  >
                    {t("rememberMe")}
                  </label>
                </div>
                <Link
                  href="#"
                  className="link link-animated link-primary font-normal"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <button
                className={`btn btn-large btn-primary btn-gradient btn-block ${
                  loading ? "btn-disabled cursor-not-allowed" : ""
                }`}
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-dots"></span>
                ) : (
                  t("loginButton")
                )}
              </button>
            </form>
            <div className="divider">{t("noAccount")}</div>
            <div className="flex items-center justify-between gap-y-2 flex-col md:flex-row mb-4 text-base-content/80 text-center md:text-left">
              {/* <span>{t("noAccount")}</span> */}
              <Link
                href="/register"
                // className="link link-animated link-primary font-normal"
                className="btn btn-lg btn-primary btn-gradient btn-block"
              >
                {t("createAccount")}
              </Link>
            </div>
            <div className="divider">{t("or")}</div>
            <button
              className="btn btn-text btn-block"
              onClick={() =>
                notyf.open({type: "warning", message:"Fonctionnalité en cours de développement"})
              }
            >
              <img
                src="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/brand-logo/google-icon.png"
                alt="google icon"
                className="size-5 object-cover"
              />
              <span className="ml-2">{t("loginWithGoogle")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
