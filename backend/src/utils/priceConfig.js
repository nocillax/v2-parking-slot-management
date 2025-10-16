// Price configuration for different slot types
// This can be moved to database later for admin management
const SLOT_PRICES = {
  Normal: 25,
  VIP: 50,
  Handicapped: 25,
  Bike: 15,
};

const getSlotPrice = (slotType) => {
  return SLOT_PRICES[slotType] || 25; // Default to 25 if type not found
};

const getAllSlotPrices = () => {
  return SLOT_PRICES;
};

export { SLOT_PRICES, getSlotPrice, getAllSlotPrices };
