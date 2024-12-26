export function formatEventDescription(duration: number) {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  const minutesString = `${minutes} ${minutes > 1 ? "mins" : "min"}`;
  const hoursString = `${hours} ${hours > 1 ? "hrs" : "hr"}`;
  if (hours === 0) return minutesString;
  if (minutes === 0) return hoursString;
  return `${hoursString} ${minutesString}`;
}

export const formatTimeZoneOffset = (tz: string) => {
  return Intl.DateTimeFormat(undefined, { timeZone: tz, timeZoneName: "shortOffset" })
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value;
};
