import { useState, useEffect } from "react";
import { fetchUserLanguage } from "../utils/api.js";
import { getTranslations } from "../utils/languageHelper.js";
import { fetchBrowserLanguage } from "../utils/browserLanguage.js";

export const Privacy = () => {
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const userData = await fetchUserLanguage();
        const userLanguage = userData?.language || fetchBrowserLanguage();
        setTranslations(getTranslations(userLanguage));
      } catch (error) {
        console.error("Failed to fetch user language:", error);
        const browserLanguage = fetchBrowserLanguage();
        setTranslations(getTranslations(browserLanguage));
      } finally {
        setLoading(false);
      }
    };

    loadLanguage();
  }, []);

  if (loading) {
    return (
      <p className="text-white text-center">{translations.privacy?.loading}</p>
    );
  }

  return (
    <div className="flex flex-col items-center text-white">
      <div className="xl:w-[50%] w-[90%]">
        <header>
          <h1 className="text-3xl font-semibold mb-8 underline text-center">
            {translations.privacy.title}
          </h1>
        </header>
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {translations.privacy.dataController}
          </h2>
          <p>{translations.privacy.dataDescription}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {translations.privacy.dataTypes}
          </h2>
          <p className="mb-4">{translations.privacy.dataTypesDescription}</p>
          <ul className="list-disc list-inside space-y-2">
            {translations.privacy.dataTypesList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {translations.privacy.purpose}
          </h2>
          <p>{translations.privacy.purposeDescription}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {translations.privacy.security}
          </h2>
          <p>{translations.privacy.securityDescription}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {translations.privacy.userRights}
          </h2>
          <p className="mb-4">{translations.privacy.userRightsDescription}</p>
          <ul className="list-disc list-inside space-y-2">
            {translations.privacy.userRightsList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {translations.privacy.disclaimer}
          </h2>
          <p>{translations.privacy.disclaimerDescription}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {translations.privacy.contact}
          </h2>
          <p>{translations.privacy.contactDescription}</p>
        </section>

        <footer className="text-center my-8">
          <p>
            <strong>{translations.privacy.lastUpdated}</strong>
          </p>
        </footer>
      </div>
    </div>
  );
};
