export function areDatesOnSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function isDateToday(date: Date | null | undefined) {
  if (!date) {
    return false;
  }
  return areDatesOnSameDay(date, new Date());
}

export function isDateYesterday(date: Date | null | undefined) {
  if (!date) {
    return false;
  }
  return areDatesOnSameDay(date, new Date(Date.now() - 24 * 60 * 60 * 1000));
}

type FormatDateOptions = Omit<Intl.DateTimeFormatOptions, "dateStyle"> & {
  dateStyle: Intl.DateTimeFormatOptions["dateStyle"] | "relative";
  relativeDateFallback?: Intl.DateTimeFormatOptions["dateStyle"];
};

export function formatDate(date: Date | null | undefined, options?: FormatDateOptions) {
  if (!date) {
    return null;
  }

  if (options?.dateStyle === "relative") {
    const { dateStyle, relativeDateFallback, ...rest } = options;
    const formattedDate = date.toLocaleString(undefined, { ...rest, dateStyle: "medium" });
    const formattedOnlyDate = date.toLocaleDateString(undefined, { dateStyle: "medium" });

    if (isDateToday(date)) {
      return formattedDate.replace(formattedOnlyDate, "Today");
    } else if (isDateYesterday(date)) {
      return formattedDate.replace(formattedOnlyDate, "Yesterday");
    } else {
      return date.toLocaleString(undefined, { ...options, dateStyle: relativeDateFallback });
    }
  }

  return date.toLocaleString(undefined, { ...options, dateStyle: options?.dateStyle });
}
