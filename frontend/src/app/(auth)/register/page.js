"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/contexts/authcontext";
import { useNotyf } from "@/contexts/NotyfContext";

export default function RegisterForm() {
  const t = useTranslations("Auth");

  const { register } = useAuth();
  const notyf = useNotyf();

  const [username, setUsername] = useState("");
  const [usernameValid, setUsernameValid] = useState(true);
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordsRequirements, setPasswordsRequirements] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
    try {
      await register(email, username, password);
      router.push(searchParams.get("from") || "/home");
    } catch (error) {
      setError(error.message || "auth failed");
    } finally {
      setLoading(false);
    }
  };

  // Vérification nom d'utilisateur en temps réel
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameValid(/^[a-zA-Z0-9_]{3,}$/.test(value) || value.length === 0);
    // Vous pouvez ajouter une vérification asynchrone ici pour vérifier si le nom d'utilisateur est déjà pris
  };

  // Vérification email en temps réel
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.length === 0
    );
  };

  // Vérification mot de passe en temps réel
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordsMatch(
      value === confirmPassword || confirmPassword.length === 0
    );

    // Check if the min-length rule element has the class 'strong-password-active:text-success'
    const minLengthEl = document.querySelector(
      '[data-pw-strength-rule="min-length"]'
    );
    const lowercaseEl = document.querySelector(
      '[data-pw-strength-rule="lowercase"]'
    );
    if (
      minLengthEl &&
      minLengthEl.classList.contains("active") &&
      lowercaseEl &&
      lowercaseEl.classList.contains("active")
    ) {
      setPasswordsRequirements(true);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordsMatch(password === value || value.length === 0);
  };

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

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
              {t("registerTitle")}
            </h3>
            <p className="text-base-content/80">{t("registerDescription")}</p>
          </div>
          <div className="space-y-4">
            <form className="mb-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="label-text" htmlFor="userName">
                  {t("username")}*
                </label>
                <input
                  type="text"
                  placeholder={t("usernamePlaceholder")}
                  className={`input ${!usernameValid ? "input-error" : ""}`}
                  value={username}
                  onChange={handleUsernameChange}
                  id="userName"
                  required
                />
                {!usernameValid && (
                  <span className="text-error text-sm">
                    {t("usernameError")}
                  </span>
                )}
              </div>
              <div>
                <label className="label-text" htmlFor="userEmail">
                  {t("email")}*
                </label>
                <input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className={`input ${!emailValid ? "input-error" : ""}`}
                  id="userEmail"
                  value={email}
                  onChange={handleEmailChange}
                  required
                />
                {!emailValid && (
                  <span className="text-error text-sm">{t("emailError")}</span>
                )}
              </div>
              <div>
                <div className="flex mb-2">
                  <div className="flex-1">
                    <input
                      type="password"
                      id="password-hints"
                      className="input w-full"
                      placeholder={t("password")}
                      value={password}
                      onChange={handlePasswordChange}
                    />
                    <div
                      data-strong-password='{
                        "target": "#password-hints",
                        "hints": "#password-hints-content",
                        "stripClasses": "strong-password:bg-primary strong-password-accepted:bg-teal-500 h-1.5 flex-auto bg-neutral/20"
                      }'
                      className="rounded-full overflow-hidden mt-2 flex gap-0.5"
                    ></div>
                  </div>
                </div>
                <div id="password-hints-content" className="mb-3">
                  <div>
                    <span className="text-sm text-base-content">
                      {t("passwordLevel")}
                    </span>{" "}
                    <span
                      data-pw-strength-hint={JSON.stringify(
                        t.raw("passwordLevels")
                      )}
                      className="text-base-content text-sm font-semibold"
                    />
                  </div>
                  <h6 className="my-2 text-base font-semibold text-base-content">
                    {t("passwordRequirements")}
                  </h6>
                  <ul className="text-base-content/80 space-y-1 text-sm">
                    <li
                      data-pw-strength-rule="min-length"
                      className="strong-password-active:text-success flex items-center gap-x-2"
                    >
                      <span
                        className="icon-[tabler--circle-check] hidden size-5 shrink-0"
                        data-check
                      ></span>
                      <span
                        className="icon-[tabler--circle-x] hidden size-5 shrink-0"
                        data-uncheck
                      ></span>
                      {t.raw("passwordRequirementsList")["min-length"]}
                    </li>
                    <li
                      data-pw-strength-rule="lowercase"
                      className="strong-password-active:text-success flex items-center gap-x-2"
                    >
                      <span
                        className="icon-[tabler--circle-check] hidden size-5 shrink-0"
                        data-check
                      ></span>
                      <span
                        className="icon-[tabler--circle-x] hidden size-5 shrink-0"
                        data-uncheck
                      ></span>
                      {t.raw("passwordRequirementsList")["lowercase"]}
                    </li>
                    <h6 className="my-2 text-base font-semibold text-base-content">
                      {t("passwordRecommendations")}
                    </h6>
                    <li
                      data-pw-strength-rule="uppercase"
                      className="strong-password-active:text-success flex items-center gap-x-2"
                    >
                      <span
                        className="icon-[tabler--circle-check] hidden size-5 shrink-0"
                        data-check
                      ></span>
                      <span
                        className="icon-[tabler--circle-x] hidden size-5 shrink-0"
                        data-uncheck
                      ></span>
                      {t.raw("passwordRequirementsList")["uppercase"]}
                    </li>
                    <li
                      data-pw-strength-rule="numbers"
                      className="strong-password-active:text-success flex items-center gap-x-2"
                    >
                      <span
                        className="icon-[tabler--circle-check] hidden size-5 shrink-0"
                        data-check
                      ></span>
                      <span
                        className="icon-[tabler--circle-x] hidden size-5 shrink-0"
                        data-uncheck
                      ></span>
                      {t.raw("passwordRequirementsList")["numbers"]}
                    </li>
                    <li
                      data-pw-strength-rule="special-characters"
                      className="strong-password-active:text-success flex items-center gap-x-2"
                    >
                      <span
                        className="icon-[tabler--circle-check] hidden size-5 shrink-0"
                        data-check
                      ></span>
                      <span
                        className="icon-[tabler--circle-x] hidden size-5 shrink-0"
                        data-uncheck
                      ></span>
                      {t.raw("passwordRequirementsList")["special-characters"]}
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <label className="label-text" htmlFor="userConfirmPassword">
                  {t("passwordConfirmation")}*
                </label>
                <div className="input">
                  <input
                    id="userConfirmPassword"
                    type="password"
                    placeholder="············"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    className={!passwordsMatch ? "input-error" : ""}
                    required
                  />
                </div>
                {!passwordsMatch && (
                  <span className="text-error text-sm">
                    {t("passwordsDoNotMatch")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  id="policyagreement"
                  checked={termsAccepted}
                  onChange={handleTermsChange}
                />
                <label
                  className="label-text text-base-content/80 p-0 text-base"
                  htmlFor="policyagreement"
                >
                  {t("acceptTermsText")}{" "}
                  <a
                    href="/register/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-animated link-primary font-normal"
                  >
                    {t("acceptTermsLink")}
                  </a>
                </label>
              </div>
              <button
                type="submit"
                disabled={
                  !(
                    usernameValid &&
                    username != "" &&
                    emailValid &&
                    email != "" &&
                    confirmPassword != "" &&
                    passwordsMatch &&
                    passwordsRequirements &&
                    termsAccepted
                  ) || loading
                }
                className="btn btn-lg btn-primary btn-gradient btn-block"
              >
                {loading ? (
                  <span className="loading loading-dots"></span>
                ) : (
                  t("registerButton")
                )}
              </button>
            </form>
            <div className="divider">{t("alreadyHaveAccount")}</div>
            <p className="text-base-content/80 mb-4 text-center">
              <a
                href="/"
                className="btn btn-lg btn-primary btn-gradient btn-block"
              >
                {t("loginTitle")}
              </a>
            </p>
            <div className="divider">{t("or")}</div>
            <button
              className="btn btn-text btn-block"
              onClick={() =>
                notyf.open({
                  type: "warning",
                  message: "Fonctionnalité en cours de développement",
                })
              }
            >
              <img
                src="https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/brand-logo/google-icon.png"
                alt="google icon"
                className="size-5 object-cover"
              />
              {t("registerwithGoogle")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function refreshAccessToken(userId) {
  const response = await apiClient.post(
    "/refresh-token",
    { userId },
    { withCredentials: true }
  );
  return response.data.accessToken;
}
