import { useState, useEffect } from "react";
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

  const { data, isLoading } = useQuery({
    queryKey: ["aboutUs"],
    queryFn: fetchUserLanguage,
  });

  const [translations, setTranslations] = useState(
    getTranslations(data?.language || "en")
  );

  useEffect(() => {
    if (data?.language) {
      setTranslations(getTranslations(data.language));
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {translations.loading || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-wider">
            Hello, Word!
          </h1>
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img
              className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1"
              src={robot}
              alt="robot"
            />
          </div>
          <button
            onClick={() => navigate("/chatarea")}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Back to Chat"
          >
            <BackButtonIcon />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {translations.aboutUs.title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {translations.aboutUs.introDev}
          </p>
        </div>

        {/* App Development Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
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
            {translations.aboutUs.appDevTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {translations.aboutUs.appDev}
          </p>
        </div>

        {/* Technology Stack Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            {translations.aboutUs.usedTechTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {translations.aboutUs.usedTechFrontend}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {translations.aboutUs.usedTechBackend}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {translations.aboutUs.usedTechSocket}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {translations.aboutUs.usedTechClaudinary}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
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
            {translations.aboutUs.featuresTitle}
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            {translations.aboutUs.featuresRegister}
          </p>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {translations.aboutUs.featuresIncludeTitle}
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-5 h-5 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></div>
              <p className="text-gray-700 dark:text-gray-300">
                {translations.aboutUs.featuresUI}
              </p>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-5 h-5 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></div>
              <p className="text-gray-700 dark:text-gray-300">
                {translations.aboutUs.featuresAuth}
              </p>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-5 h-5 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></div>
              <p className="text-gray-700 dark:text-gray-300">
                {translations.aboutUs.featuresUpload}
              </p>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-5 h-5 bg-green-500 rounded-full flex-shrink-0 mt-0.5"></div>
              <p className="text-gray-700 dark:text-gray-300">
                {translations.aboutUs.featuresMessaging}
              </p>
            </div>
          </div>
        </div>

        {/* Project Links Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3">
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
            {translations.aboutUs.projectTitle}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-medium text-gray-900 dark:text-white">
                Live Demo (Olivia):
              </span>
              <a
                href="https://hello-word-6z2bg.ondigitalocean.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
              >
                Hello-Word Olivia
              </a>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-medium text-gray-900 dark:text-white">
                Live Demo (Renat):
              </span>
              <a
                href="https://hello-word.khambazarov.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
              >
                Hello-Word Renat
              </a>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="font-medium text-gray-900 dark:text-white">
                {translations.aboutUs.sourceCode}:
              </span>
              <a
                href="https://github.com/final-project-real-time-chat/realtime-chat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
              >
                GitHub Repo
              </a>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-8 mb-8 shadow-lg text-white">
          <h2 className="text-3xl font-bold text-center mb-8 tracking-wide">
            {translations.aboutUs.ourContacts}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Olivia */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4 tracking-wide">
                Olivia
              </h3>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://olivia-piechowski.netlify.app"
                  title="Website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <img src={Web} alt="Website" className="w-6 h-6" />
                </a>
                <a
                  href="https://github.com/OliviaPiwe"
                  title="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <img src={GitHub} alt="GitHub" className="w-6 h-6" />
                </a>
                <a
                  href="https://linkedin.com/in/olivia-piechowski"
                  title="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <img src={LinkedIn} alt="LinkedIn" className="w-6 h-6" />
                </a>
                <a
                  href="mailto:olivia_piechowski@hotmail.de"
                  title="Email"
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <img src={Email} alt="Email" className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Renat */}
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4 tracking-wide">
                Renat
              </h3>
              <div className="flex justify-center space-x-4">
                <a
                  href="https://khambazarov.dev"
                  title="Website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <img src={Web} alt="Website" className="w-6 h-6" />
                </a>
                <a
                  href="https://github.com/Khambazarov"
                  title="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <img src={GitHub} alt="GitHub" className="w-6 h-6" />
                </a>
                <a
                  href="http://linkedin.com/in/renat-khambazarov"
                  title="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <img src={LinkedIn} alt="LinkedIn" className="w-6 h-6" />
                </a>
                <a
                  href="mailto:contact@khambazarov.dev"
                  title="Email"
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <img src={Email} alt="Email" className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="text-center">
          <h3 className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
            {translations.aboutUs.feedback}
          </h3>
        </div>
      </div>
    </div>
  );
};
