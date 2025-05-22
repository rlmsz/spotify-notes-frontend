/**
 * Formats milliseconds into a MM:SS string format
 * @param ms - Time in milliseconds
 * @returns Formatted time string (e.g., "3:45")
 */
export const formatTime = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
};
