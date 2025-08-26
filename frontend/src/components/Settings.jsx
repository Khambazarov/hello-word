import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";

import { fetchUserLanguage, updateUserLanguage } from "../utils/api.js";
import { getTranslations } from "../utils/languageHelper.js";

import robot from "../assets/robot.png";
import {
  BackButtonIcon,
  EyeClosedIcon,
  EyeOpenedIcon,
  PasswordIcon,
  UkFlag,
  GermanFlag,
} from "./_AllSVGs";

export const Settings = () => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [volume, setVolume] = useState(null);
  const queryClient = useQueryClient();

  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState(getTranslations("en"));

  function changePassword(e) {
    e.preventDefault();
    const oldPassword = e.target.oldPassword.value.trim();
    const newPassword = e.target.newPassword.value.trim();
    newPasswordMutation.mutate({ oldPassword, newPassword });
    e.target.oldPassword.value = "";
    e.target.newPassword.value = "";
  }

  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["userSettings"],
    queryFn: fetchUserLanguage,
    onSuccess: (data) => {
      setVolume(data.volume || "middle");
      setLanguage(data.language || "en");
      setTranslations(getTranslations(data.language || "en"));
    },
  });

  useEffect(() => {
    if (userSettings && userSettings.volume) {
      setVolume(userSettings.volume);
    }
  }, [userSettings]);

  useEffect(() => {
    if (userSettings && userSettings.language) {
      setLanguage(userSettings.language);
    }
  }, [userSettings]);

  useEffect(() => {
    if (language) {
      const loadedTranslations = getTranslations(language);
      setTranslations(loadedTranslations);
    }
  }, [language]);

  const handleAudioVolume = useMutation({
    mutationFn: async (newVolume) => {
      const response = await fetch(`/api/users/volume`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ volume: newVolume }),
      });
      if (!response.ok) throw new Error("Failed to change volume.");
      return response.json();
    },
    onSuccess: (data) => {
      setVolume(data.volume || "middle");
      toast.success(translations.toast.settings.successUpdate);
      queryClient.invalidateQueries(["userSettings"]);
    },
    onError: () => {
      toast.error(translations.toast.settings.errorFailedChange);
    },
  });

  const handleVolumeChange = (newVolume) => {
    handleAudioVolume.mutate(newVolume);
  };

  const handleLanguageChange = useMutation({
    mutationFn: updateUserLanguage,
    onSuccess: (data) => {
      setLanguage(data.language || "en");
      setTranslations(getTranslations(data.language || "en"));
      queryClient.invalidateQueries(["userSettings"]);
      toast.success(
        getTranslations(data.language || "en").toast.settings.successUpdate
      );
    },
    onError: (data) => {
      toast.error(
        getTranslations(data.language || "en").toast.settings.errorFailedChange
      );
    },
  });

  const handleLanguageSelection = (newLanguage) => {
    handleLanguageChange.mutate(newLanguage);
  };

  const newPasswordMutation = useMutation({
    mutationFn: async ({ oldPassword, newPassword }) => {
      const response = await fetch(`/api/users/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!response.ok) throw new Error("Failed to change password.");
      return response.json();
    },
    onSuccess: () => {
      toast.success(translations.toast.settings.successUpdate);
    },
    onError: () => {
      toast.error(translations.toast.settings.errorFailedChange);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/delete`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete account");
      return response.json();
    },
    onSuccess: () => {
      toast.success(translations.toast.settings.successAccountDelete);
      setShow(false);
      navigate("/");
    },
    onError: () => {
      toast.error(translations.toast.settings.errorAccountDelete);
    },
  });

  if (
    isLoading ||
    volume === null ||
    language === null ||
    translations === null
  ) {
    return (
      <p>{translations.settings.loadingSettings || "Loading settings..."}</p>
    );
  }

  return (
    <div className="min-h-svh flex flex-col dark:bg-base-100 dark:bg-none bg-gradient-to-r from-amber-100 to-blue-300">
      <header className="xl:h-25 z-10 h-16 flex justify-between  items-center pl-2 sticky top-0 bg-gray-700">
        <h1 className=" flex text-white items-center tracking-widest text-sm md:text-base xl:text-3xl ml-2">
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
      <main>
        <h1 className="text-center text-4xl mt-5">
          {translations.settings.selectLangTitle}
        </h1>
        <form className="mt-[2%] mx-auto w-full max-w-md bg-white/25 shadow-lg shadow-blue-900/30 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div>
            <h1 className="text-2xl font-bold text-center mb-4 text-black dark:text-white text-nowrap">
              {translations.settings.lang[language]}
            </h1>
            <div className="flex justify-evenly">
              <div className="flex gap-2 text-center">
                <input
                  type="radio"
                  id="en"
                  name="language"
                  value="en"
                  checked={language === "en"}
                  onChange={(e) => handleLanguageSelection(e.target.value)}
                />
                <label htmlFor="en">
                  {translations.settings.lang.en} <UkFlag />
                </label>
              </div>
              <div className="flex gap-2 text-center">
                <input
                  type="radio"
                  id="de"
                  name="language"
                  value="de"
                  checked={language === "de"}
                  onChange={(e) => handleLanguageSelection(e.target.value)}
                />
                <label htmlFor="de">
                  {translations.settings.lang.de} <GermanFlag />
                </label>
              </div>
            </div>
          </div>
        </form>
        <form className="mt-[2%] mx-auto w-full max-w-md bg-white/25 shadow-lg shadow-blue-900/30 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div>
            <h1 className="text-2xl font-bold text-center mb-4 text-black dark:text-white text-nowrap">
              {translations.settings.volumeTitle}
            </h1>
            <div className="flex justify-evenly">
              <div className="flex flex-col items-center">
                <input
                  type="radio"
                  id="silent"
                  name="audioVolume"
                  value="silent"
                  checked={volume === "silent"}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                />
                <label htmlFor="silent">
                  {translations.settings.volume.silent}
                </label>
              </div>
              <div className="flex flex-col items-center">
                <input
                  type="radio"
                  id="middle"
                  name="audioVolume"
                  value="middle"
                  checked={volume === "middle"}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                />
                <label htmlFor="middle">
                  {translations.settings.volume.middle}
                </label>
              </div>
              <div className="flex flex-col items-center">
                <input
                  type="radio"
                  id="full"
                  name="audioVolume"
                  value="full"
                  checked={volume === "full"}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                />
                <label htmlFor="full">
                  {translations.settings.volume.loud}
                </label>
              </div>
            </div>
          </div>
        </form>
        <form
          onSubmit={changePassword}
          className="mt-[2%] mx-auto w-full max-w-md bg-white/25 shadow-lg shadow-blue-900/30 backdrop-blur-md rounded-xl border border-white/20 p-6"
        >
          <h1 className="text-2xl font-bold text-center mb-4 text-black dark:text-white">
            {translations.settings.changePwTitle}
          </h1>
          <label
            htmlFor="oldPassword"
            className="block text-gray-600 dark:text-gray-300 font-semibold text-nowrap"
          >
            {translations.settings.currentPwTitle}
          </label>
          <div className="relative mb-4">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <PasswordIcon />
            </div>

            <input
              type={showPassword ? "text" : "password"}
              name="oldPassword"
              id="oldPassword"
              placeholder={translations.settings.currentPwPlaceholder}
              minLength={6}
              className="bg-white/10 text-gray-500 dark:text-white border border-gray-500 rounded-lg w-full p-2 ps-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              required
              autoFocus
            />

            <div
              className="absolute inset-y-0 end-0 flex items-center pe-3.5 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOpenedIcon /> : <EyeClosedIcon />}
            </div>
          </div>
          <label
            htmlFor="newPassword"
            className="block text-gray-600 dark:text-gray-300 font-semibold text-nowrap"
          >
            {translations.settings.newPwTitle}
          </label>
          <div className="relative mb-4">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
              <PasswordIcon />
            </div>

            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              id="newPassword"
              placeholder={translations.settings.newPwPlaceholder}
              minLength={6}
              className="bg-white/10 text-gray-500 dark:text-white border border-gray-500 rounded-lg w-full p-2 ps-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              required
            />

            <div
              className="absolute inset-y-0 end-0 flex items-center pe-3.5 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOpenedIcon /> : <EyeClosedIcon />}
            </div>
          </div>
          <button
            type="submit"
            className="mt-5 cursor-pointer w-full bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700 text-nowrap"
          >
            {translations.settings.changePwBtn}
          </button>
        </form>
        <form className="mt-[7%] mx-auto w-full max-w-md bg-white/25 shadow-lg shadow-blue-900/30 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <div>
            <h1 className="text-2xl font-bold text-center mb-4 text-red-600 text-nowrap">
              {translations.settings.deleteAccountTitle}
            </h1>
            <button
              type="button"
              onClick={() => setShow(true)}
              className="cursor-pointer w-full bg-red-600 text-white p-2 rounded-lg font-bold hover:bg-red-700"
            >
              {translations.settings.deleteBtn}
            </button>
          </div>
        </form>
        <Toaster />
      </main>

      {show && (
        <div className="min-w-80 fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex flex-col gap-2 text-center xl:top-25">
          <span className="text-nowrap">
            {translations.settings.prompt.title}?
          </span>
          <button
            onClick={() => deleteAccountMutation.mutate()}
            className="bg-gray-200 hover:bg-gray-50 text-red-600 px-2 py-1 rounded duration-300"
          >
            {translations.settings.prompt.deleteBtn}
          </button>
          <button
            onClick={() => setShow(false)}
            className="bg-gray-900 hover:bg-gray-800 px-2 py-1 rounded text-white"
          >
            {translations.settings.prompt.cancelBtn}
          </button>
        </div>
      )}
    </div>
  );
};
