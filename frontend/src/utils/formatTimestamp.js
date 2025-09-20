export function formatTimestamp(timestamp, language) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  // Circassian Monatsnamen
  const circassianMonths = [
    "ЩӀышылэ",
    "Мазае.",
    "Гъатхэпэ.",
    "Мэлыжьыхь.",
    "Накъыгъэ.",
    "Мэкъуауэгъуэ.",
    "Бадзэуэгъуз.",
    "ШыщхьэӀу.",
    "ФокӀадэ.",
    "Жэпуэгъуэ.",
    "ЩэкӀуэгъуэ.",
    "Дыгъэгъэзэ.",
  ];

  const timeFormatter = new Intl.DateTimeFormat(language, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: language === "en",
  });

  const dateToString = date.toDateString();
  const nowToString = now.toDateString();
  const yesterdayToString = yesterday.toDateString();

  if (dateToString === nowToString) {
    return timeFormatter.format(date);
  }
  if (dateToString === yesterdayToString) {
    let yesterdayText = "Yesterday";
    if (language === "de") yesterdayText = "Gestern";
    if (language === "ru") yesterdayText = "Вчера";
    if (language === "ci") yesterdayText = "Дыгъуасэ";
    return `${yesterdayText} ${timeFormatter.format(date)}`;
  }

  if (language === "ci") {
    const day = date.getDate();
    const month = circassianMonths[date.getMonth()];
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year} г. ${hour}:${minute}`;
  }

  return new Intl.DateTimeFormat(language, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: language === "en",
    timeZone: userTimeZone,
  })
    .format(date)
    .replace(",", "");
}

// export function formatTimestamp(timestamp, language) {
//   const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
//   const date = new Date(timestamp);
//   const now = new Date();
//   const yesterday = new Date(now);
//   yesterday.setDate(now.getDate() - 1);

//   const timeFormatter = new Intl.DateTimeFormat(language, {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: language === "en",
//   });

//   const dateToString = date.toDateString()
//   const nowToString = now.toDateString()
//   const yesterdayToString = yesterday.toDateString();

//   if (dateToString === nowToString) {
//     return timeFormatter.format(date);
//   }
//   if (dateToString === yesterdayToString) {
//     const yesterdayText = language === "de" ? "Gestern" : "Yesterday";
//     return `${yesterdayText} ${timeFormatter.format(date)}`;
//   } else {
//     return new Intl.DateTimeFormat(language, {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: language === "en",
//       timeZone: userTimeZone,
//     })
//       .format(date)
//       .replace(",", "");
//   }
// }
