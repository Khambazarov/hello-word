import english from "../languages/english.json";
import german from "../languages/german.json";
import russian from "../languages/russian.json";

const languages = {
  en: english,
  de: german,
  ru: russian,
};

export const getTranslations = (language) => {
  return languages[language] || languages["en"];
};
