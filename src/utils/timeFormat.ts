/**
 * Converts a 24-hour time string (e.g. "18:49") to a 12-hour formatted string (e.g. "6:49 م" or "6:49 PM").
 */
export function formatTime12h(time24h: string, isAr: boolean = true): string {
  if (!time24h) return "";
  const parts = time24h.split(":");
  if (parts.length < 2) return time24h;
  
  let h = Number(parts[0]);
  const m = parts[1];
  if (isNaN(h)) return time24h;
  
  const ampm = h >= 12 ? (isAr ? "م" : "PM") : (isAr ? "ص" : "AM");
  h = h % 12;
  if (h === 0) h = 12;
  
  return `${h}:${m} ${ampm}`;
}
