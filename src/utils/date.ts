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

type FormatDateOptions =
  | Intl.DateTimeFormatOptions
  | (Omit<Intl.DateTimeFormatOptions, "dateStyle"> & {
      dateStyle: "relative";
      relativeDateStyleFallback: Intl.DateTimeFormatOptions["dateStyle"];
    });

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatDate(date: Date | null | undefined, options?: FormatDateOptions) {
  if (!date) {
    return null;
  }

  switch (options?.dateStyle) {
    case "relative": {
      const { dateStyle: _, relativeDateStyleFallback, ...rest } = options;

      const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
      const formattedDate = date.toLocaleString(undefined, { ...rest, dateStyle: "medium" });
      const formattedOnlyDate = date.toLocaleDateString(undefined, { dateStyle: "medium" });

      if (isDateToday(date)) {
        const todayString = rtf.format(0, "day");
        return formattedDate.replace(formattedOnlyDate, capitalizeFirstLetter(todayString));
      } else if (isDateYesterday(date)) {
        const yesterdayString = rtf.format(-1, "day");
        return formattedDate.replace(formattedOnlyDate, capitalizeFirstLetter(yesterdayString));
      } else {
        return date.toLocaleString(undefined, { ...rest, dateStyle: relativeDateStyleFallback });
      }
    }
    default: {
      return date.toLocaleString(undefined, { ...options, dateStyle: options?.dateStyle });
    }
  }
}
