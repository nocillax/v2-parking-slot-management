import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// ParkingLot model for managing parking facilities
const ParkingLot = sequelize.define(
  "ParkingLot",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    // Area-based location (replaces flat address)
    area_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "areas",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      comment: "Foreign key to areas table for location hierarchy",
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Detailed street address within the area",
    },

    // GPS coordinates for map display and distance calculation
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      comment: "Parking lot GPS latitude",
      validate: {
        min: -90,
        max: 90,
      },
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      comment: "Parking lot GPS longitude",
      validate: {
        min: -180,
        max: 180,
      },
    },

    total_slots: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    // Foreign key to admin user who manages this lot
    admin_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "parking_lots",
    timestamps: true,
    indexes: [
      {
        fields: ["area_id"],
        name: "parking_lot_area_index",
      },
      {
        fields: ["latitude", "longitude"],
        name: "parking_lot_geolocation_index",
      },
    ],
  }
);

// Get available slots count for this lot
ParkingLot.prototype.getAvailableSlots = async function () {
  const { Slot } = sequelize.models;
  return await Slot.count({
    where: {
      lot_id: this.id,
      status: "Free",
    },
  });
};

// Get occupancy percentage
ParkingLot.prototype.getOccupancyRate = async function () {
  const availableSlots = await this.getAvailableSlots();
  const occupancyRate =
    ((this.total_slots - availableSlots) / this.total_slots) * 100;
  return Math.round(occupancyRate * 100) / 100; // Round to 2 decimal places
};

// Get full location hierarchy for this parking lot
ParkingLot.prototype.getFullLocation = async function () {
  const { Area, District, Division } = sequelize.models;
  const area = await Area.findByPk(this.area_id, {
    include: [
      {
        model: District,
        include: [Division],
      },
    ],
  });

  if (!area) return null;

  return {
    division: area.District.Division.name,
    district: area.District.name,
    area: area.name,
    address: this.address,
  };
};

// Calculate distance from a given point (in kilometers)
ParkingLot.prototype.getDistanceFrom = function (latitude, longitude) {
  if (!this.latitude || !this.longitude) return null;

  const R = 6371; // Earth's radius in km
  const dLat = ((latitude - this.latitude) * Math.PI) / 180;
  const dLon = ((longitude - this.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((this.latitude * Math.PI) / 180) *
      Math.cos((latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Define model relationships
ParkingLot.associate = (models) => {
  ParkingLot.belongsTo(models.User, {
    foreignKey: "admin_id",
    as: "admin",
  });

  ParkingLot.hasMany(models.Slot, {
    foreignKey: "lot_id",
    as: "slots",
  });

  ParkingLot.belongsTo(models.Area, {
    foreignKey: "area_id",
    as: "area",
  });
};

export default ParkingLot;
