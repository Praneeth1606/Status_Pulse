import {
  formatDistanceToNow,
  format,
  formatDistance,
  parseISO,
} from "date-fns";

export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "MMM d, yyyy h:mm a");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

export const formatTimeAgo = (dateString: string): string => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch (error) {
    console.error("Error formatting time ago:", error);
    return "some time ago";
  }
};

export const formatDateRange = (start: string, end: string): string => {
  try {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    const startFormatted = format(startDate, "MMM d, h:mm a");
    const endFormatted = format(endDate, "MMM d, h:mm a");

    return `${startFormatted} - ${endFormatted}`;
  } catch (error) {
    console.error("Error formatting date range:", error);
    return "Invalid date range";
  }
};

export const formatDateForInput = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error("Error formatting date for input:", error);
    return "";
  }
};

export const formatDuration = (start: string, end: string): string => {
  try {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    return formatDistance(startDate, endDate);
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "unknown duration";
  }
};
