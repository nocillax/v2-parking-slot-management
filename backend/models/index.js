import sequelize from "../config/database.js";
import User from "./User.js";
import Division from "./Division.js";
import District from "./District.js";
import Area from "./Area.js";
import Facility from "./Facility.js";
import Slot from "./Slot.js";
import Reservation from "./Reservation.js";
import Payment from "./Payment.js";
import Waitlist from "./Waitlist.js";
import Notification from "./Notification.js";

const models = {
  User,
  Division,
  District,
  Area,
  Facility,
  Slot,
  Reservation,
  Payment,
  Waitlist,
  Notification,
};

// Set up location hierarchy associations
Division.hasMany(District, {
  foreignKey: "division_id",
  as: "districts",
});

District.belongsTo(Division, {
  foreignKey: "division_id",
  as: "division",
});

District.hasMany(Area, {
  foreignKey: "district_id",
  as: "areas",
});

Area.belongsTo(District, {
  foreignKey: "district_id",
  as: "district",
});

Area.hasMany(Facility, {
  foreignKey: "area_id",
  as: "facilities",
});

// Set up all other model associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

export { sequelize };
export default models;
