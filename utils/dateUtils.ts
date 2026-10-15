/**
 * Date utility functions for handling timezone-independent date/time storage and display
 *
 * The key issue: When storing datetime in MySQL DATETIME column, we store as local time strings.
 * When reading back, Drizzle/mysql2 returns Date objects that interpret the time as UTC.
 *
 * Solution:
 * 1. When saving: Convert Date to local string 'YYYY-MM-DD HH:mm:ss' before sending to server
 * 2. When displaying: For Date objects from DB, use UTC getters (which actually hold the local time)
 */

/**
 * Converts a Date object to a local datetime string (YYYY-MM-DD HH:mm:ss)
 * This preserves the exact local time without timezone conversion
 */
export function dateToLocalString(
  date: Date | null | undefined
): string | null {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Converts a local datetime string back to a Date object
 * The string is in format YYYY-MM-DD HH:mm:ss or YYYY-MM-DDTHH:mm:ss
 */
export function localStringToDate(
  dateString: string | null | undefined
): Date | null {
  if (!dateString) return null;

  // Handle both 'YYYY-MM-DD HH:mm:ss' and ISO format
  const normalized = dateString.replace("T", " ").split(".")[0]; // Remove milliseconds and T
  const [datePart, timePart] = normalized.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes, seconds] = (timePart || "00:00:00")
    .split(":")
    .map(Number);

  return new Date(year, month - 1, day, hours, minutes, seconds || 0);
}

/**
 * Converts step3 dates to local strings for API submission
 */
export function convertStep3DatesToStrings(step3: {
  tender_release_date: Date | string | null;
  tender_query_deadline: Date | string | null;
  tender_query_response_date: Date | string | null;
  tender_bid_submission_deadline: Date | string | null;
  tender_technical_bid_opening: Date | string | null;
  tender_financial_bid_opening: Date | string | null;
}) {
  const convertDate = (value: Date | string | null): string | null => {
    if (!value) return null;
    if (typeof value === "string") return value; // Already a string
    return dateToLocalString(value);
  };

  return {
    tender_release_date: convertDate(step3.tender_release_date),
    tender_query_deadline: convertDate(step3.tender_query_deadline),
    tender_query_response_date: convertDate(step3.tender_query_response_date),
    tender_bid_submission_deadline: convertDate(
      step3.tender_bid_submission_deadline
    ),
    tender_technical_bid_opening: convertDate(
      step3.tender_technical_bid_opening
    ),
    tender_financial_bid_opening: convertDate(
      step3.tender_financial_bid_opening
    ),
  };
}

/**
 * Converts step3 dates loaded from the database into local Dates for the form.
 * Used as is, the form reads the stored wall-clock time as UTC, so each date
 * shows shifted by the browser's offset and is saved back shifted.
 */
export function normalizeStep3Dates(step3: {
  tender_release_date: Date | string | null;
  tender_query_deadline: Date | string | null;
  tender_query_response_date: Date | string | null;
  tender_bid_submission_deadline: Date | string | null;
  tender_technical_bid_opening: Date | string | null;
  tender_financial_bid_opening: Date | string | null;
}) {
  return {
    tender_release_date: normalizeDbDate(step3.tender_release_date),
    tender_query_deadline: normalizeDbDate(step3.tender_query_deadline),
    tender_query_response_date: normalizeDbDate(
      step3.tender_query_response_date
    ),
    tender_bid_submission_deadline: normalizeDbDate(
      step3.tender_bid_submission_deadline
    ),
    tender_technical_bid_opening: normalizeDbDate(
      step3.tender_technical_bid_opening
    ),
    tender_financial_bid_opening: normalizeDbDate(
      step3.tender_financial_bid_opening
    ),
  };
}

// ==================== Display Formatting Functions ====================

/**
 * Converts a database Date object or string to a "normalized" Date for display.
 *
 * IMPORTANT: When Drizzle reads DATETIME from MySQL, it creates a Date object
 * where the UTC components match the stored local time (e.g., stored "11:15:00"
 * becomes Date with getUTCHours() = 11). To display correctly, we need to use
 * the UTC getters and create a new Date with those values as local time.
 */
function normalizeDbDate(
  dateInput: Date | string | null | undefined
): Date | null {
  if (!dateInput) return null;

  if (typeof dateInput === "string") {
    // String input - parse as local time
    return localStringToDate(dateInput);
  }

  // Date object from database - the UTC components are the actual local time values
  // because MySQL DATETIME was interpreted as UTC by the driver
  // We need to create a new Date using UTC values as local values
  const year = dateInput.getUTCFullYear();
  const month = dateInput.getUTCMonth();
  const day = dateInput.getUTCDate();
  const hours = dateInput.getUTCHours();
  const minutes = dateInput.getUTCMinutes();
  const seconds = dateInput.getUTCSeconds();

  return new Date(year, month, day, hours, minutes, seconds);
}

/**
 * Format a date for display (date only, no time)
 * Handles both Date objects and string dates correctly
 */
export function formatDisplayDate(
  dateInput: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  if (!dateInput) return "N/A";

  const date = normalizeDbDate(dateInput);
  if (!date || isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-IN", options).format(date);
}

/**
 * Format a date for display with weekday
 */
export function formatDisplayDateWithWeekday(
  dateInput: Date | string | null | undefined
): string {
  return formatDisplayDate(dateInput, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format time for display (24-hour format)
 */
export function formatDisplayTime24(
  dateInput: Date | string | null | undefined
): string {
  if (!dateInput) return "N/A";

  const date = normalizeDbDate(dateInput);
  if (!date || isNaN(date.getTime())) return "N/A";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

/**
 * Format time for display (12-hour format with AM/PM)
 */
export function formatDisplayTime12(
  dateInput: Date | string | null | undefined
): string {
  if (!dateInput) return "N/A";

  const date = normalizeDbDate(dateInput);
  if (!date || isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Format date and time for display
 */
export function formatDisplayDateTime(
  dateInput: Date | string | null | undefined,
  use24Hour: boolean = false
): string {
  if (!dateInput) return "N/A";

  const datePart = formatDisplayDate(dateInput);
  const timePart = use24Hour
    ? formatDisplayTime24(dateInput)
    : formatDisplayTime12(dateInput);

  return `${datePart} at ${timePart}`;
}

/**
 * Get separate date and time parts for display
 */
export function getDateTimeParts(dateInput: Date | string | null | undefined): {
  date: string;
  time: string;
} {
  if (!dateInput) return { date: "N/A", time: "N/A" };

  return {
    date: formatDisplayDate(dateInput),
    time: formatDisplayTime24(dateInput),
  };
}

/**
 * Whole calendar days from today until the given date.
 *
 * Uses the same normalizeDbDate() handling as formatDisplayDate() so the
 * countdown never disagrees with the date rendered beside it. Both sides are
 * collapsed to local midnight, so the result counts date boundaries rather
 * than 24-hour blocks: 0 means "closes today", negative means already past.
 *
 * Returns null for missing/unparseable input.
 */
export function getDaysUntil(
  dateInput: Date | string | null | undefined
): number | null {
  if (!dateInput) return null;

  const date = normalizeDbDate(dateInput);
  if (!date || isNaN(date.getTime())) return null;

  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();

  return Math.round((target - today) / 86_400_000);
}
