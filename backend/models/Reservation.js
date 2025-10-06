import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Reservation model for parking slot bookings
const Reservation = sequelize.define(
  "Reservation",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    // Foreign keys
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    slot_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "slots",
        key: "id",
      },
    },

    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "Active",
        "Checked-in",
        "Completed",
        "Expired",
        "Overstayed",
        "Cancelled"
      ),
      allowNull: false,
      defaultValue: "Active",
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    payment_status: {
      type: DataTypes.ENUM("Pending", "Paid", "Failed"),
      allowNull: false,
      defaultValue: "Pending",
    },

    // Vehicle number (required at check-in)
    vehicle_no: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    check_in_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    check_out_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "reservations",
    timestamps: true,
    indexes: [
      {
        fields: ["user_id", "status"],
      },
      {
        fields: ["slot_id", "start_time"],
      },
      {
        fields: ["status", "start_time"],
      },
    ],
  }
);

// Check if reservation is expired (past grace period)
Reservation.prototype.isExpired = function () {
  const graceMinutes = 10; // 10 minutes grace period
  const graceTime = new Date(this.start_time.getTime() + graceMinutes * 60000);
  return new Date() > graceTime && this.status === "Active";
};

// Check if reservation is overstayed
Reservation.prototype.isOverstayed = function () {
  return (
    this.check_in_time &&
    new Date() > this.end_time &&
    this.status === "Checked-in"
  );
};

// Mark reservation as checked in
Reservation.prototype.checkIn = async function (vehicleNumber) {
  if (this.status !== "Active") {
    throw new Error("Only active reservations can be checked in");
  }

  this.status = "Checked-in";
  this.vehicle_no = vehicleNumber;
  this.check_in_time = new Date();
  await this.save();

  // Update slot status to occupied
  const slot = await this.getSlot();
  await slot.occupy();

  return this;
};

// Mark reservation as completed (check out)
Reservation.prototype.checkOut = async function () {
  if (this.status !== "Checked-in") {
    throw new Error("Only checked-in reservations can be checked out");
  }

  this.status = "Completed";
  this.check_out_time = new Date();

  // Check for overstay and update amount if needed
  if (this.isOverstayed()) {
    this.status = "Overstayed";
    // Calculate overstay charges (1.5x rate)
    const overstayHours = Math.ceil(
      (new Date() - this.end_time) / (1000 * 60 * 60)
    );
    const slot = await this.getSlot();
    const overstayAmount = overstayHours * slot.hourly_rate * 1.5;
    this.total_amount = parseFloat(this.total_amount) + overstayAmount;
  }

  await this.save();

  // Free the slot
  const slot = await this.getSlot();
  await slot.free();

  return this;
};

// Cancel reservation
Reservation.prototype.cancel = async function () {
  if (!["Active", "Checked-in"].includes(this.status)) {
    throw new Error("Cannot cancel completed or expired reservations");
  }

  this.status = "Cancelled";
  await this.save();

  // Free the slot if it was reserved
  const slot = await this.getSlot();
  if (slot.status !== "Free") {
    await slot.free();
  }

  return this;
};

// Calculate duration in hours
Reservation.prototype.getDurationHours = function () {
  return Math.ceil((this.end_time - this.start_time) / (1000 * 60 * 60));
};

// Define model relationships
Reservation.associate = (models) => {
  Reservation.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });

  Reservation.belongsTo(models.Slot, {
    foreignKey: "slot_id",
    as: "slot",
  });

  Reservation.hasMany(models.Payment, {
    foreignKey: "reservation_id",
    as: "payments",
  });
};

export default Reservation;
