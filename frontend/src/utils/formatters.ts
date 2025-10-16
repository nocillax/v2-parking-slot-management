/**
 * Formats a slot type string from lowercase to the format expected by the API.
 * (e.g., "vip" -> "VIP", "normal" -> "Normal").
 * @param slotType The lowercase slot type string.
 * @returns The formatted slot type string.
 */
export const formatSlotTypeForAPI = (slotType: string): string => {
  const lowerType = slotType.toLowerCase();
  if (lowerType === "vip") {
    return "VIP";
  }
  if (lowerType === "all") {
    return "Normal"; // Default to 'Normal' if 'all' is selected for reservation
  }
  // Capitalize the first letter for other types like "Normal", "Handicapped", "Bike"
  return lowerType.charAt(0).toUpperCase() + lowerType.slice(1);
};
