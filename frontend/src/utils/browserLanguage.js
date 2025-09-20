export const fetchBrowserLanguage = () => {
  let browserLanguage = navigator.language.split("-")[0];

  if (browserLanguage === "de") {
    return (browserLanguage = "de");
  }
  if (browserLanguage === "ru") {
    return (browserLanguage = "ru");
  }
  if (browserLanguage === "en") {
    return (browserLanguage = "en");
  }
  else {
    return (browserLanguage = "ci");
  }
};
