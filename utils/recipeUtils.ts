export const getDifficultyText = (difficulty: string): string => {
  switch (difficulty) {
    case "EASY":
      return "Dễ";
    case "MEDIUM":
      return "Trung bình";
    case "HARD":
      return "Khó";
    default:
      return difficulty;
  }
};

/**
 * Formats large numbers with K/M suffix
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Formats cooking time to readable format
 */
export const formatCookTime = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}p` : `${hours}h`;
  }
  return `${minutes}p`;
};

/**
 * Gets difficulty color based on level
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case "EASY":
      return "#10b981"; // green
    case "MEDIUM":
      return "#f59e0b"; // orange
    case "HARD":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};

export const getOptimalLoadThreshold = (isHorizontal: boolean): number => {
  return isHorizontal ? 0.3 : 0.2;
};
