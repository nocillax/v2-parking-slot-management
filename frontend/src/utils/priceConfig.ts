// Price configuration for different slot types
// This should match the backend configuration
export const SLOT_PRICES = {
  Normal: 25,
  VIP: 50,
  Handicapped: 25,
  Bike: 15,
} as const;

export const getSlotPrice = (slotType: keyof typeof SLOT_PRICES): number => {
  return SLOT_PRICES[slotType] || 25; // Default to 25 if type not found
};

export const getAllSlotPrices = () => {
  return SLOT_PRICES;
};

export type SlotType = keyof typeof SLOT_PRICES;
