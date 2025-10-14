import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Facility model for managing parking facilities
const Facility = sequelize.define(
  "Facility",
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
      comment: "Facility GPS latitude",
      validate: {
        min: -90,
        max: 90,
      },
    },

    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      comment: "Facility GPS longitude",
      validate: {
        min: -180,
        max: 180,
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
    tableName: "facilities",
    timestamps: true,
    indexes: [
      {
        fields: ["area_id"],
        name: "facility_area_index",
      },
      {
        fields: ["latitude", "longitude"],
        name: "facility_geolocation_index",
      },
    ],
    getterMethods: {
      // Ensure available_slots from subquery is an integer
      available_slots() {
        const count = this.getDataValue("available_slots");
        // The subquery might return null or a string, so we parse it safely.
        return count ? parseInt(count, 10) : 0;
      },
    },
  }
);

// Get available slots count for this lot
Facility.prototype.getAvailableSlots = async function () {
  const { Slot } = sequelize.models;
  return await Slot.count({
    where: {
      facility_id: this.id,
      status: "Free",
    },
  });
};

// Get full location hierarchy for this Facility
Facility.prototype.getFullLocation = async function () {
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
Facility.prototype.getDistanceFrom = function (latitude, longitude) {
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

Facility.associate = (models) => {
  Facility.belongsTo(models.User, {
    foreignKey: "admin_id",
    as: "admin",
  });

  Facility.hasMany(models.Slot, {
    foreignKey: "facility_id",
    as: "slots",
  });

  Facility.belongsTo(models.Area, {
    foreignKey: "area_id",
    as: "area",
  });
};

export default Facility;
