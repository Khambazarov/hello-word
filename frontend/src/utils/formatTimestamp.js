export function formatTimestamp(timestamp, language) {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const date = new Date(timestamp);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const timeFormatter = new Intl.DateTimeFormat(language, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: language === "en",
  });

  const dateToString = date.toDateString()
  const nowToString = now.toDateString()
  const yesterdayToString = yesterday.toDateString();
  
  if (dateToString === nowToString) {
    return timeFormatter.format(date);
  }
  if (dateToString === yesterdayToString) {
    const yesterdayText = language === "de" ? "Gestern" : "Yesterday";
    return `${yesterdayText} ${timeFormatter.format(date)}`;
  } else {
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
}
