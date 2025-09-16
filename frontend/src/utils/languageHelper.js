import english from "../languages/english.json";
import german from "../languages/german.json";

const languages = {
  en: english,
  de: german,
};

export const getTranslations = (language) => {
  return languages[language] || languages["en"];
};
