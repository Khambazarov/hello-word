import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchUserLanguage } from "../utils/api.js";
import { formatTimestamp } from "../utils/formatTimestamp";

import robot from "../assets/robot.png";
import { BackButtonIcon } from "./_AllSVGs";

export const Profile = () => {
  const navigate = useNavigate();

  const { data, isLoading: isProfileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchUserLanguage,
  });

  const [language, setLanguage] = useState(data?.language || "en");
  const [translations, setTranslations] = useState(
    getTranslations(data?.language || "en")
  );

  useEffect(() => {
    if (data?.language) {
      setLanguage(data.language);
      setTranslations(getTranslations(data.language));
    }
  }, [data]);

  const username = data?.username;
  const usermail = data?.usermail;
  const dateOfRegistration = data?.dateOfRegistration;

  const userRegisteredAt = dateOfRegistration
    ? formatTimestamp(dateOfRegistration, language)
    : translations.profile.dateNotAvailable || "Date not available";

  if (isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{translations.profile.loading || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      <header className="xl:h-25 z-10 h-16 flex justify-between items-center pl-2 sticky top-0 bg-gray-700">
        <h1 className="flex text-white items-center tracking-widest text-sm md:text-base xl:text-3xl ml-2">
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
      <main className="flex flex-col justify-center mt-5 mx-auto max-w-80 dark:bg-gray-700 bg-gray-200 shadow-lg shadow-blue-900/30 backdrop-blur-md rounded-xl border border-white/20">
        <img
          src={username ? `https://robohash.org/${username}` : robot}
          alt=""
          className="m-auto mb-4"
        />
        <p className="mx-auto font-bold">{translations.profile.username}</p>
        <p className="mx-auto pb-3">{username}</p>
        <p className="mx-auto font-bold">{translations.profile.email}:</p>
        <p className="mx-auto pb-3">{usermail}</p>

        <p className="mx-auto font-bold">
          {translations.profile.registered || "Registriert"}:
        </p>
        <p className="mx-auto pb-8">{userRegisteredAt}</p>
      </main>
    </div>
  );
};
