import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchUserLanguage } from "../utils/api.js";

import { BackButtonIcon } from "./_AllSVGs";
import robot from "../assets/robot.png";

import GitHub from "../assets/github.svg";
import LinkedIn from "../assets/linkedin.svg";
import Email from "../assets/email.svg";
import Web from "../assets/web.svg";

export const AboutUs = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", "language"],
    queryFn: fetchUserLanguage,
    staleTime: 5 * 60 * 1000,
  });

  const lang = data?.language || "en";
  const translations = useMemo(() => getTranslations(lang), [lang]);
  const t = translations?.content?.aboutUs ?? {};

  // const projectLinks = [
  //   {
  //     label: "Live Demo:",
  //     href: "https://hello-word-6z2bg.ondigitalocean.app/",
  //     text: "Hello-Word – Olivia",
  //   },
  //   {
  //     label: `${t.sourceCode || "Source Code"}:`,
  //     href: "https://github.com/final-project-real-time-chat/realtime-chat",
  //     text: "GitHub Repo",
  //   },
  //   {
  //     label: "Live Demo:",
  //     href: "https://hello-word.khambazarov.dev/",
  //     text: "Hello-Word – Renat",
  //   },
  //   {
  //     label: `${t.sourceCode || "Source Code"}:`,
  //     href: "https://github.com/Khambazarov/hello-word",
  //     text: "GitHub Repo",
  //   },
  // ];

  const projectCards = [
    {
      title: "Hello, Word! — Olivia",
      demoHref: "https://hello-word-6z2bg.ondigitalocean.app/",
      repoHref: "https://github.com/final-project-real-time-chat/realtime-chat",
    },
    {
      title: "Hello, Word! — Renat",
      demoHref: "https://hello-word.khambazarov.dev/",
      repoHref: "https://github.com/Khambazarov/hello-word",
    },
  ];

  const contacts = [
    {
      name: "Olivia",
      links: [
        {
          href: "https://olivia-piechowski.netlify.app",
          icon: Web,
          label: "Olivia – Website",
        },
        {
          href: "https://github.com/OliviaPiwe",
          icon: GitHub,
          label: "Olivia – GitHub",
        },
        {
          href: "https://linkedin.com/in/olivia-piechowski",
          icon: LinkedIn,
          label: "Olivia – LinkedIn",
        },
        {
          href: "mailto:olivia_piechowski@hotmail.de",
          icon: Email,
          label: "Olivia – Email",
        },
      ],
    },
    {
      name: "Renat",
      links: [
        {
          href: "https://khambazarov.dev",
          icon: Web,
          label: "Renat – Website",
        },
        {
          href: "https://github.com/Khambazarov",
          icon: GitHub,
          label: "Renat – GitHub",
        },
        {
          href: "https://linkedin.com/in/khambazarov",
          icon: LinkedIn,
          label: "Renat – LinkedIn",
        },
        {
          href: "mailto:contact@khambazarov.dev",
          icon: Email,
          label: "Renat – Email",
        },
      ],
    },
  ];

  const features = [
    t.featuresUI,
    t.featuresAuth,
    t.featuresUpload,
    t.featuresMessaging,
  ].filter(Boolean);

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
            {translations?.loading || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <p className="text-gray-700 dark:text-gray-300">
          {t.error ||
            "Could not load your language preference. Please try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 max-w-6xl mx-auto gap-3">
          <img
            className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1"
            src={robot}
            alt="Project mascot robot"
            loading="lazy"
            decoding="async"
          />
          <div
            className="text-xl font-bold text-gray-900 dark:text-white tracking-wider"
            aria-hidden="true"
          >
            {t.branding || "Hello, Word!"}
          </div>

          <button
            type="button"
            onClick={() => navigate("/chatarea")}
            className="p-2 sm:p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Back to Chat"
            aria-label="Back to Chat"
          >
            <BackButtonIcon />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {t.title ?? "About Us"}
          </h1>
          <div className="w-48 md:w-72 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 rounded-full" />
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {t.introDev ||
              "We are Olivia and Renat, passionate developers united by a shared vision: to create Hello, Word!, a modern real-time chat application that combines reliability, ease of use, and an engaging design."}
          </p>
        </section>

        {/* App Development Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <div
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
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {t.appDevTitle || "Development Approach"}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {t.appDev ||
              "From concept to implementation, we focused on reliability, performance, and a clean user experience."}
          </p>
        </section>

        {/* Technology Stack Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <div
              className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3"
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            {t.usedTechTitle || "Technology Stack"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {t.usedTechFrontend ||
                    "Frontend: React, Tailwind, React Router, React Query"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {t.usedTechBackend || "Backend: Node.js, Express, REST API"}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {t.usedTechSocket || "Real-time: Socket.io"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {t.usedTechCloudinary ||
                    "Media & Storage: Cloudinary for image/file uploads."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <div
              className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3"
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {t.featuresTitle || "Key Features"}
          </h2>

          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            {t.featuresRegister ||
              "Create your account and start chatting in seconds."}
          </p>

          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t.featuresIncludeTitle || "Highlights:"}
          </h3>

          <div className="grid md:grid-cols-2 gap-3">
            {features.length ? (
              features.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full
              bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0L3.293 9.207a1 1 0 011.414-1.414l3.043 3.043 6.543-6.543a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>

                  <p className="text-gray-700 dark:text-gray-300">{item}</p>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full
                  bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0L3.293 9.207a1 1 0 011.414-1.414l3.043 3.043 6.543-6.543a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Clean and responsive UI
                  </p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full
                  bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0L3.293 9.207a1 1 0 011.414-1.414l3.043 3.043 6.543-6.543a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Secure authentication
                  </p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full
                  bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0L3.293 9.207a1 1 0 011.414-1.414l3.043 3.043 6.543-6.543a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Media uploads
                  </p>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full
                  bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0L3.293 9.207a1 1 0 011.414-1.414l3.043 3.043 6.543-6.543a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <p className="text-gray-700 dark:text-gray-300">
                    Real-time messaging
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Project Links Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <div
              className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3"
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {t.projectTitle || "Project Links"}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {projectCards.map(({ title, demoHref, repoHref }) => (
              <div
                key={title}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 p-5 transition-transform duration-200 ease-out hover:-translate-y-1 focus-within:-translate-y-1 transform-gpu motion-reduce:transform-none motion-reduce:transition-none"
              >
                <h3 className="text-balance text-center text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <a
                    href={demoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white  hover:from-blue-700 hover:to-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800"
                  >
                    <span>{t.liveDemo || "Live Demo"}</span>
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L14 5.414V13a1 1 0 11-2 0V5.414L9.707 7.707A1 1 0 018.293 6.293l4-4z" />
                    </svg>
                  </a>
                  <a
                    href={repoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800"
                  >
                    <span>{t.sourceCode || "Source Code"}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center mb-2 tracking-wide text-gray-900 dark:text-white">
            {t.ourContacts || "Team & Contact"}
          </h2>
          <div className="w-48 md:w-72 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-8 rounded-full" />

          <div className="grid md:grid-cols-2 gap-6">
            {contacts.map((person) => (
              <div key={person.name} className="text-center">
                <h3 className="text-2xl font-semibold mb-4 tracking-wide text-gray-900 dark:text-white">
                  {person.name}
                </h3>
                <div className="flex justify-center gap-3 sm:gap-4">
                  {person.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      title={l.label}
                      aria-label={l.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 w-11 sm:h-12 sm:w-12 inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 duration-200 transform hover:-translate-y-1 transition-transform ease-out transform-gpu focus-visible:-translate-y-1"
                    >
                      <img
                        src={l.icon}
                        alt=""
                        aria-hidden="true"
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feedback Section */}
        <section className="text-center">
          <h3 className="text-balance text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            {t.thanks ||
              "Thank you for exploring Hello, Word! with us. We hope you enjoy using the app as much as we enjoyed building it."}
          </h3>
          <div className="w-48 md:w-72 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto my-8 rounded-full" />
          <h3 className="text-balance text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            {t.feedback ||
              "We welcome feedback and contributions — your input directly informs our roadmap. Feel free to reach out via the links above."}
          </h3>
        </section>
      </main>
    </div>
  );
};
