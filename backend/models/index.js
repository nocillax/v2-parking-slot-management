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

// A new function to handle the hybrid synchronization strategy
export const syncApplicationModels = async () => {
  try {
    // Pre-create ENUM types to avoid sync issues with `alter: true`.
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."enum_areas_type" AS ENUM('Residential', 'Commercial', 'Mixed', 'Industrial');
        CREATE TYPE "public"."enum_users_role" AS ENUM('user', 'admin');
        CREATE TYPE "public"."enum_slots_slot_type" AS ENUM('Normal', 'VIP', 'Handicapped', 'Bike');
        CREATE TYPE "public"."enum_slots_status" AS ENUM('Free', 'Reserved', 'Occupied');
        CREATE TYPE "public"."enum_reservations_status" AS ENUM('Active', 'Checked-in', 'Completed', 'Expired', 'Overstayed', 'Cancelled');
        CREATE TYPE "public"."enum_reservations_payment_status" AS ENUM('Pending', 'Paid', 'Failed');
        CREATE TYPE "public"."enum_payments_method" AS ENUM('Credit Card', 'Debit Card', 'PayPal', 'Cash', 'Simulation');
        CREATE TYPE "public"."enum_payments_status" AS ENUM('Pending', 'Paid', 'Failed', 'Refunded');
        CREATE TYPE "public"."enum_waitlist_status" AS ENUM('Active', 'Notified', 'Fulfilled', 'Expired', 'Cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Sync all non-location models.
    const modelsToSkip = ["Division", "District", "Area"];
    for (const modelName in models) {
      if (!modelsToSkip.includes(modelName)) {
        await models[modelName].sync({ alter: true });
      }
    }
    console.log("✅ Application models were synchronized successfully.");
  } catch (error) {
    console.error("❌ Error synchronizing application models:", error);
    process.exit(1);
  }
};

export { sequelize };
export default models;
