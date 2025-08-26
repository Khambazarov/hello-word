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
      <div className="flex justify-center items-center h-screen">
        <p>{translations.loading || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-gray-300 dark:text-white dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      <header className="xl:h-25 z-10 h-16 flex justify-between  items-center pl-2 sticky top-0 bg-gray-700">
        <h1 className="flex items-center tracking-widest text-sm md:text-base xl:text-3xl ml-2 text-gray-100">
          Hello, Word!
        </h1>
        <img
          className="h-12 absolute left-1/2 transform -translate-x-1/2 xl:h-16"
          src={robot}
          alt="robot"
        />
        <button
          onClick={() => navigate("/chatarea")}
          className="cursor-pointer pr-4"
        >
          <BackButtonIcon />
        </button>
      </header>
      <div className="max-w-3xl mx-auto px-4 flex flex-col items-center text-center tracking-wide">
        <h1 className="text-3xl font-bold mt-12">
          {translations.aboutUs.title}
        </h1>
        <p className="text-balance mt-4">{translations.aboutUs.introDev}</p>
        <h2 className="text-2xl font-semibold mt-8">
          {translations.aboutUs.appDevTitle}
        </h2>
        <p className="text-balance mt-4">{translations.aboutUs.appDev}</p>
        <h2 className="text-2xl font-semibold mt-8">
          {translations.aboutUs.usedTechTitle}
        </h2>
        <ul className="list-disc list-inside mt-4 space-y-4">
          <li className="text-balance">
            {translations.aboutUs.usedTechFrontend}
          </li>
          <li className="text-balance">
            {translations.aboutUs.usedTechBackend}
          </li>
          <li className="text-balance">
            {translations.aboutUs.usedTechSocket}
          </li>
          <li className="text-balance">
            {translations.aboutUs.usedTechClaudinary}
          </li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8">
          {translations.aboutUs.featuresTitle}
        </h2>
        <p className="text-balance text-xl mt-4">
          {translations.aboutUs.featuresRegister}
        </p>
        <h3 className="my-4 text-xl">
          {translations.aboutUs.featuresIncludeTitle}
        </h3>
        <ul className="list-disc list-inside space-y-4">
          <li className="text-balance">{translations.aboutUs.featuresUI}</li>
          <li className="text-balance">{translations.aboutUs.featuresAuth}</li>
          <li className="text-balance">
            {translations.aboutUs.featuresUpload}
          </li>
          <li className="text-balance">
            {translations.aboutUs.featuresMessaging}
          </li>
        </ul>
        <h2 className="text-2xl font-semibold mt-8">
          {translations.aboutUs.projectTitle}
        </h2>
        <ul className="list-inside mt-4 space-y-4">
          <li>
            Live Demo:
            <a
              href="https://hello-word-6z2bg.ondigitalocean.app/"
              className="dark:text-blue-400 text-blue-700 dark:hover:text-blue-200 hover:text-blue-500 duration-200 underline pl-2"
            >
              Hello-Word Olivia
            </a>
          </li>
          <li>
            Live Demo:
            <a
              href="https://hello-word.khambazarov.dev/"
              className="dark:text-blue-400 text-blue-700 dark:hover:text-blue-200 hover:text-blue-500 duration-200 underline pl-2"
            >
              Hello-Word Renat
            </a>
          </li>
          <li>
            {translations.aboutUs.sourceCode}
            <a
              href="https://github.com/final-project-real-time-chat/realtime-chat"
              className="dark:text-blue-400 text-blue-700 dark:hover:text-blue-200 hover:text-blue-500 duration-200 underline pl-2"
            >
              GitHub Repo
            </a>
          </li>
        </ul>
        <div className="border-2 border-gray-100 shadow-gray-600 bg-gray-700 shadow-2xl mt-8 p-8 rounded-3xl">
          <h2 className="text-3xl font-semibold tracking-widest text-gray-100">
            {translations.aboutUs.ourContacts}
          </h2>
          <h2 className="text-2xl font-semibold mt-6 mb-2 tracking-widest text-gray-100">
            Olivia
          </h2>
          <ul className="flex justify-between">
            <li>
              <a
                href="https://olivia-piechowski.netlify.app"
                title="https://olivia-piechowski.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={Web}
                  alt="Web Icon"
                  className="w-8 bg-gray-300 rounded hover:scale-120 duration-300"
                />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/OliviaPiwe"
                title="github.com/OliviaPiwe"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={GitHub}
                  alt="GitHub Icon"
                  className="w-8 hover:scale-120 duration-300"
                />
              </a>
            </li>
            <li>
              <a
                href="https://linkedin.com/in/olivia-piechowski"
                title="linkedin.com/in/olivia-piechowski"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={LinkedIn}
                  alt="LinkedIn Icon"
                  className="w-8 hover:scale-120 duration-300"
                />
              </a>
            </li>
            <li>
              <a
                href="mailto:olivia_piechowski@hotmail.de"
                title="olivia_piechowski@hotmail.de"
              >
                <img
                  src={Email}
                  alt="Email Icon"
                  className="w-8 hover:scale-120 duration-300"
                />
              </a>
            </li>
          </ul>
          <h2 className="text-2xl font-semibold mt-6 mb-2 tracking-widest text-gray-100">
            Renat
          </h2>
          <ul className="flex justify-between">
            <li>
              <a
                href="https://khambazarov.dev"
                title="https://khambazarov.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={Web}
                  alt="Web Icon"
                  className="w-8 bg-gray-300 rounded hover:scale-120 duration-300"
                />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/Khambazarov"
                title="github.com/Khambazarov"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={GitHub}
                  alt="GitHub Icon"
                  className="w-8 hover:scale-120 duration-300"
                />
              </a>
            </li>
            <li>
              <a
                href="http://linkedin.com/in/renat-khambazarov"
                title="linkedin.com/in/renat-khambazarov"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={LinkedIn}
                  alt="LinkedIn Icon"
                  className="w-8 hover:scale-120 duration-300"
                />
              </a>
            </li>
            <li>
              <a
                href="mailto:contact@khambazarov.dev"
                title="contact@khambazarov.dev"
              >
                <img
                  src={Email}
                  alt="Email Icon"
                  className="w-8 hover:scale-120 duration-300"
                />
              </a>
            </li>
          </ul>
        </div>
        <h3 className="text-xl text-center text-balance my-16">
          {translations.aboutUs.feedback}
        </h3>
      </div>
    </div>
  );
};
