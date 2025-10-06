import sequelize from "../config/database.js";
import User from "./User.js";
import ParkingLot from "./ParkingLot.js";
import Slot from "./Slot.js";
import Reservation from "./Reservation.js";
import Payment from "./Payment.js";
import Waitlist from "./Waitlist.js";
import Notification from "./Notification.js";

const models = {
  User,
  ParkingLot,
  Slot,
  Reservation,
  Payment,
  Waitlist,
  Notification,
};

// Set up all associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize };
export default models;
