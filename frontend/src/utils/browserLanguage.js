export const fetchBrowserLanguage = () => {
  let browserLanguage = navigator.language.split("-")[0];

  if (browserLanguage === "de") {
    return (browserLanguage = "de");
  }
  if (browserLanguage === "ru") {
    return (browserLanguage = "ru");
  } else {
    return (browserLanguage = "en");
  }
};
