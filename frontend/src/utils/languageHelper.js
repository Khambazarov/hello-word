import english from "../settings/english.json";
import german from "../settings/german.json";

const languages = {
  en: english,
  de: german,
};

export const getTranslations = (language) => {
  return languages[language] || languages["en"];
};
