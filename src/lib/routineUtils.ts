export const DAY_ORDER = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const;

// Days that are always shown; Saturday and Friday appear only when they have periods
export const CORE_DAYS: string[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
];

// Days an admin or teacher can pick when adding a period
export const FORM_DAYS: string[] = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
];

export const DAY_LABEL: Record<string, { bn: string; en: string }> = {
  SATURDAY: { bn: "শনিবার", en: "Saturday" },
  SUNDAY: { bn: "রবিবার", en: "Sunday" },
  MONDAY: { bn: "সোমবার", en: "Monday" },
  TUESDAY: { bn: "মঙ্গলবার", en: "Tuesday" },
  WEDNESDAY: { bn: "বুধবার", en: "Wednesday" },
  THURSDAY: { bn: "বৃহস্পতিবার", en: "Thursday" },
  FRIDAY: { bn: "শুক্রবার", en: "Friday" },
};

export const normalizeDay = (day?: string): string =>
  (day || "").trim().toUpperCase();

export const todayKey = (): string =>
  [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ][new Date().getDay()];

// "09:00 AM", "1:30 PM" or "13:30" to minutes since midnight
export const toMinutes = (value?: string): number => {
  const match = /^\s*(\d{1,2}):(\d{2})\s*([AaPp][Mm])?\s*$/.exec(value || "");
  if (!match) return Number.MAX_SAFE_INTEGER;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// "14:30" (time input) to "02:30 PM" (stored format)
export const to12h = (value24: string): string => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value24.trim());
  if (!match) return value24;

  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${String(hour12).padStart(2, "0")}:${match[2]} ${suffix}`;
};

// "02:30 PM" (stored format) to "14:30" (time input)
export const to24h = (value?: string): string => {
  const total = toMinutes(value);
  if (total === Number.MAX_SAFE_INTEGER) return "";

  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};