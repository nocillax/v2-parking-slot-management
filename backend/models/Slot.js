import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Slot model for individual parking spaces
const Slot = sequelize.define(
  "Slot",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    // Foreign key to parking lot
    facility_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "facilities",
        key: "id",
      },
    },

    slot_type: {
      type: DataTypes.ENUM("Normal", "VIP", "Handicapped", "Bike"),
      allowNull: false,
      defaultValue: "Normal",
    },

    status: {
      type: DataTypes.ENUM("Free", "Reserved", "Occupied"),
      allowNull: false,
      defaultValue: "Free",
    },

    hourly_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    // Optional location identifier (e.g., "Floor 2, Section A, Slot 15")
    location_tag: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "slots",
    timestamps: true,
    indexes: [
      // Composite index for efficient queries
      {
        fields: ["facility_id", "status"],
      },
      {
        fields: ["slot_type", "status"],
      },
    ],
  }
);

// Check if slot is available for reservation
Slot.prototype.isAvailable = function () {
  return this.status === "Free";
};

// Reserve this slot (change status to Reserved)
Slot.prototype.reserve = async function () {
  if (!this.isAvailable()) {
    throw new Error("Slot is not available for reservation");
  }
  this.status = "Reserved";
  await this.save();
  return this;
};

// Mark slot as occupied (on check-in)
Slot.prototype.occupy = async function () {
  if (this.status !== "Reserved") {
    throw new Error("Slot must be reserved before occupation");
  }
  this.status = "Occupied";
  await this.save();
  return this;
};

// Free the slot (on check-out or reservation expiry)
Slot.prototype.free = async function () {
  this.status = "Free";
  await this.save();
  return this;
};

// Get current reservation for this slot
Slot.prototype.getCurrentReservation = async function () {
  const { Reservation } = sequelize.models;
  return await Reservation.findOne({
    where: {
      slot_id: this.id,
      status: ["Active", "Checked-in"],
    },
    order: [["createdAt", "DESC"]],
  });
};

// Define model relationships
Slot.associate = (models) => {
  Slot.belongsTo(models.Facility, {
    foreignKey: "facility_id",
    as: "facility",
  });

  Slot.hasMany(models.Reservation, {
    foreignKey: "slot_id",
    as: "reservations",
  });
};

export default Slot;
