export const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${secs.toString().padStart(2, "0")}s`);

  return parts.join(" ");
};

export const secondsToHoursRounded = (seconds: number): number => {
  const safeSeconds = Math.max(0, seconds);
  return Math.round(safeSeconds / 3600);
};
