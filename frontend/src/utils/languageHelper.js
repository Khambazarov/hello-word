import english from "../languages/english.json";
import german from "../languages/german.json";
import russian from "../languages/russian.json";
import circassian from "../languages/circassian.json";

const languages = {
  en: english,
  de: german,
  ru: russian,
  ci: circassian,
};

export const getTranslations = (language) => {
  return languages[language] || languages["en"];
};
