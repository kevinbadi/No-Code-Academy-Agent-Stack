export const DATE_RANGES = [
  { label: "Last 7 days", value: "7days" },
  { label: "Last 14 days", value: "14days" },
  { label: "Last 30 days", value: "30days" },
  { label: "This month", value: "thisMonth" },
  { label: "Last month", value: "lastMonth" },
] as const;

export type DateRangeValue = typeof DATE_RANGES[number]['value'];

export function getDateRangeValues(range: DateRangeValue): { startDate: Date, endDate: Date } {
  const endDate = new Date();
  let startDate = new Date();
  
  switch(range) {
    case "7days":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "14days":
      startDate.setDate(endDate.getDate() - 14);
      break;
    case "30days":
      startDate.setDate(endDate.getDate() - 30);
      break;
    case "thisMonth":
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      break;
    case "lastMonth":
      startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
      endDate.setDate(0); // Last day of previous month
      break;
  }
  
  return { startDate, endDate };
}

export function formatDateForDisplay(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  
  if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
  
  return 'just now';
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}
