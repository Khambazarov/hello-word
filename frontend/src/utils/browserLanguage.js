export const fetchBrowserLanguage = () => {
  let browserLanguage = navigator.language.split("-")[0];

  if (browserLanguage === "de") {
    return (browserLanguage = "de");
  } else {
    return (browserLanguage = "en");
  }
};

/** REFACTORING */
// export const fetchBrowserLanguage = () => {
//   const language = navigator.language || navigator.userLanguage;
//   return language.startsWith("de") ? "de" : "en";
// };
