import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchUserLanguage } from "../utils/api.js";
import { getTranslations } from "../utils/languageHelper.js";
import { fetchBrowserLanguage } from "../utils/browserLanguage.js";

export const Privacy = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", "language"],
    queryFn: fetchUserLanguage,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const lang = data?.language || fetchBrowserLanguage();

  const translations = useMemo(() => getTranslations(lang), [lang]);
  const p = translations?.content?.privacy ?? {};

  const fallback = {
    loading: "Loading...",
    title: "Privacy Policy",
    dataController: "Data Controller",
    dataDescription:
      "Hello, Word! processes only the data necessary to deliver a reliable, secure and user-friendly chat experience. We do not sell your data.",
    dataTypes: "Data We Process",
    dataTypesDescription:
      "We process different categories of data to operate the service, improve performance and ensure security:",
    dataTypesList: [
      "Account data (name, email, profile information).",
      "Usage data (messages metadata, interactions, timestamps).",
      "Content you share (messages, media uploads) for delivery/storage.",
      "Technical data (IP address, device, browser, cookies).",
    ],
    purpose: "Purpose & Legal Basis",
    purposeDescription:
      "We use your data to provide core features, secure the platform, prevent abuse, and improve the product. Processing is based on contract performance, legitimate interests and, where applicable, your consent.",
    security: "Security",
    securityDescription:
      "We apply industry-standard safeguards including encryption in transit (HTTPS), access controls, monitoring and regular reviews to protect your data.",
    userRights: "Your Rights",
    userRightsDescription:
      "Depending on your jurisdiction, you may have the following rights regarding your personal data:",
    userRightsList: [
      "Access and obtain a copy of your personal data.",
      "Rectification of inaccurate or incomplete data.",
      "Erasure (“right to be forgotten”) where applicable.",
      "Restriction of processing in certain circumstances.",
      "Data portability (structured, commonly used format).",
      "Object to processing based on legitimate interests.",
      "Withdraw consent at any time (if processing is based on consent).",
      "Lodge a complaint with a supervisory authority.",
    ],
    disclaimer: "Retention & International Transfers",
    disclaimerDescription:
      "We retain data only as long as necessary for the purposes described or as required by law. Where data is processed outside your jurisdiction, we use appropriate safeguards.",
    contact: "Contact",
    contactDescription:
      "For privacy inquiries, requests or complaints, please contact us via the channels listed on the About page or within the app.",
    lastUpdatedPrefix: "Last updated:",
    errorFetchLang:
      "We could not load your saved language. Falling back to your browser language.",
  };

  const dataTypesList =
    Array.isArray(p.dataTypesList) && p.dataTypesList.length
      ? p.dataTypesList
      : fallback.dataTypesList;

  const userRightsList =
    Array.isArray(p.userRightsList) && p.userRightsList.length
      ? p.userRightsList
      : fallback.userRightsList;

  const lastUpdated =
    p.lastUpdated ||
    `${fallback.lastUpdatedPrefix} ${new Date().toLocaleDateString(lang, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div
            role="status"
            aria-live="polite"
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"
          />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {p.loading || fallback.loading}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-8">
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="text-xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 break-words leading-tight">
              {p.title || fallback.title}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
          </header>

          {/* Non-blocking Error Banner */}
          {isError && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200 p-4"
            >
              {p.errorFetchLang || fallback.errorFetchLang}
            </div>
          )}

          {/* TOC Navigation */}
          <nav
            aria-label="Privacy Table of Contents"
            className="mb-6 sm:mb-8 flex flex-col gap-1 sm:gap-2"
          >
            {[
              {
                href: "#controller",
                label: p.dataController || fallback.dataController,
              },
              { href: "#types", label: p.dataTypes || fallback.dataTypes },
              { href: "#purpose", label: p.purpose || fallback.purpose },
              { href: "#security", label: p.security || fallback.security },
              { href: "#rights", label: p.userRights || fallback.userRights },
              {
                href: "#disclaimer",
                label: p.disclaimer || fallback.disclaimer,
              },
              { href: "#contact", label: p.contact || fallback.contact },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="w-full sm:w-auto text-left px-3 py-2 min-h-[44px] rounded-xl sm:rounded-full whitespace-normal break-words leading-snug text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Content */}
          <div className="space-y-6 sm:space-y-8 text-gray-700 dark:text-gray-300">
            {/* Data Controller */}
            <section
              id="controller"
              className="scroll-mt-20 sm:scroll-mt-24"
              aria-labelledby="heading-controller"
            >
              <h2
                id="heading-controller"
                className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-start leading-snug break-words"
              >
                <span
                  className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3"
                  aria-hidden="true"
                >
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 8a6 6 0 01-7.743 5.743L10 14l-2 1-1 1H4v-1l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {p.dataController || fallback.dataController}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="leading-relaxed">
                  {p.dataDescription || fallback.dataDescription}
                </p>
              </div>
            </section>

            {/* Data Types */}
            <section
              id="types"
              className="scroll-mt-20 sm:scroll-mt-24"
              aria-labelledby="heading-types"
            >
              <h2
                id="heading-types"
                className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-start leading-snug break-words"
              >
                <span
                  className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3"
                  aria-hidden="true"
                >
                  <svg
                    className="w-5 h-5 text-purple-600 dark:text-purple-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </span>
                {p.dataTypes || fallback.dataTypes}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="mb-4 leading-relaxed">
                  {p.dataTypesDescription || fallback.dataTypesDescription}
                </p>
                <ul className="space-y-2 list-none">
                  {dataTypesList.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span
                        className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Purpose & Legal Basis */}
            <section
              id="purpose"
              className="scroll-mt-20 sm:scroll-mt-24"
              aria-labelledby="heading-purpose"
            >
              <h2
                id="heading-purpose"
                className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-start leading-snug break-words"
              >
                <span
                  className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3"
                  aria-hidden="true"
                >
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                {p.purpose || fallback.purpose}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="leading-relaxed">
                  {p.purposeDescription || fallback.purposeDescription}
                </p>
              </div>
            </section>

            {/* Security */}
            <section
              id="security"
              className="scroll-mt-20 sm:scroll-mt-24"
              aria-labelledby="heading-security"
            >
              <h2
                id="heading-security"
                className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-start leading-snug break-words"
              >
                <span
                  className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3"
                  aria-hidden="true"
                >
                  <svg
                    className="w-5 h-5 text-orange-600 dark:text-orange-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {p.security || fallback.security}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="leading-relaxed">
                  {p.securityDescription || fallback.securityDescription}
                </p>
              </div>
            </section>

            {/* Rights */}
            <section
              id="rights"
              className="scroll-mt-20 sm:scroll-mt-24"
              aria-labelledby="heading-rights"
            >
              <h2
                id="heading-rights"
                className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-start leading-snug break-words"
              >
                <span
                  className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3"
                  aria-hidden="true"
                >
                  <svg
                    className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </span>
                {p.userRights || fallback.userRights}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="mb-4 leading-relaxed">
                  {p.userRightsDescription || fallback.userRightsDescription}
                </p>
                <ul className="space-y-2 list-none">
                  {userRightsList.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span
                        className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Disclaimer */}
            <section
              id="disclaimer"
              className="scroll-mt-20 sm:scroll-mt-24"
              aria-labelledby="heading-disclaimer"
            >
              <h2
                id="heading-disclaimer"
                className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-start leading-snug break-words"
              >
                <span
                  className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-3"
                  aria-hidden="true"
                >
                  <svg
                    className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {p.disclaimer || fallback.disclaimer}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="leading-relaxed">
                  {p.disclaimerDescription || fallback.disclaimerDescription}
                </p>
              </div>
            </section>

            {/* Contact */}
            <section
              id="contact"
              className="scroll-mt-20 sm:scroll-mt-24"
              aria-labelledby="heading-contact"
            >
              <h2
                id="heading-contact"
                className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-start leading-snug break-words"
              >
                <span
                  className="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mr-3"
                  aria-hidden="true"
                >
                  <svg
                    className="w-5 h-5 text-pink-600 dark:text-pink-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                {p.contact || fallback.contact}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="leading-relaxed">
                  {p.contactDescription || fallback.contactDescription}
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                <strong>{lastUpdated}</strong>
              </p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};
