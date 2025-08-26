import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import { getTranslations } from "../utils/languageHelper.js";
import { fetchBrowserLanguage } from "../utils/browserLanguage.js";

import robot from "../assets/robot.png";
import { EmailIcon, KeyIcon } from "./_AllSVGs";

const browserLanguage = fetchBrowserLanguage();

export const RegisterVerify = () => {
  const navigate = useNavigate();
  const [translations, setTranslations] = useState(
    getTranslations(browserLanguage)
  );

  async function handleVerify(e) {
    e.preventDefault();
    toast.loading(translations.toast.verify.loading);

    const email = e.target.email.value.toLowerCase().trim();
    const key = e.target.key.value.trim();

    const response = await fetch("/api/users/register/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, key }),
    });
    const user = await response.json();
    toast.dismiss();

    if (user.isVerified) {
      toast.success(translations.toast.verify.success);
      setTimeout(() => navigate("/"), 2000);
    } else if (response.status === 400) {
      toast.error(translations.toast.verify.errorAlreadyVerified);
    } else if (response.status === 409) {
      toast.error(translations.toast.verify.errorNoMatch);
    } else {
      toast.error(translations.toast.verify.errorServer);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  p-6 dark:bg-[#1D232A] dark:bg-none bg-gradient-to-r  from-amber-200 to-blue-300">
      <header className="flex items-center justify-between w-full max-w-md bg-gray-700 text-white p-4 rounded-lg shadow-lg">
        <h1 className="text-xl font-bold tracking-wide">Hello, Word!</h1>
        <img className="h-12" src={robot} alt="robot" />
      </header>
      <Toaster />

      <form
        onSubmit={handleVerify}
        className="mt-[2%] mx-auto w-full max-w-md bg-white/25 shadow-lg shadow-blue-900/30 backdrop-blur-md rounded-xl border border-white/20 p-6"
      >
        <h1 className="text-2xl font-bold text-center mb-4 dark:text-white text-black">
          {translations.verify.titel}
        </h1>
        <p className="dark:text-white text-gray-600 text-center mb-4">
          {translations.verify.description}
        </p>

        <label
          htmlFor="email"
          className="block dark:text-gray-300 text-gray-600 font-semibold"
        >
          {translations.verify.emailTitle}
        </label>
        <div className="relative mb-4">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <EmailIcon />
          </div>
          <input
            type="email"
            name="email"
            id="email"
            placeholder={translations.verify.emailPlaceholder}
            className="bg-white/10 dark:text-white text-gray-600 border border-gray-500 rounded-lg w-full p-2 ps-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            required
            autoFocus
          />
        </div>

        <label
          htmlFor="key"
          className="block dark:text-gray-300 text-gray-600 font-semibold"
        >
          {translations.verify.key}
        </label>
        <div className="relative mb-4">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            <KeyIcon />
          </div>
          <input
            type="tel"
            name="key"
            id="key"
            placeholder="XXXXXX"
            minLength={6}
            maxLength={6}
            className="bg-white/10 dark:text-white text-gray-600 border border-gray-500 rounded-lg w-full p-2 ps-10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            required
          />
        </div>

        <button
          type="submit"
          className="cursor-pointer w-full bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-600 transition duration-300"
        >
          {translations.verify.submitBtn}
        </button>
      </form>

      <div className="flex items-center gap-2 mt-4">
        <Link
          to="/"
          className="dark:text-white text-gray-600 text-sm  tracking-wider border-b hover:border-b-neutral transition duration-500"
        >
          {translations.verify.backToLogin}
        </Link>
      </div>
    </div>
  );
};
