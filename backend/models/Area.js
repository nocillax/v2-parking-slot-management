import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Area = sequelize.define(
  "Area",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    district_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "districts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      comment: "Foreign key to districts table",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "Area/locality name (e.g., Uttara, Gulshan, Dhanmondi)",
    },
    type: {
      type: DataTypes.ENUM("Residential", "Commercial", "Mixed", "Industrial"),
      allowNull: false,
      defaultValue: "Mixed",
      comment: "Type of area for categorization",
    },
    popular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "Flag for popular areas (show first in dropdowns)",
    },
    center_latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      comment: "Center point latitude for auto-detection",
      validate: {
        min: -90,
        max: 90,
      },
    },
    center_longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      comment: "Center point longitude for auto-detection",
      validate: {
        min: -180,
        max: 180,
      },
    },
  },
  {
    tableName: "areas",
    timestamps: true,
    indexes: [
      {
        fields: ["district_id"],
      },
      {
        fields: ["popular", "name"],
        name: "popular_areas_index",
      },
      {
        unique: true,
        fields: ["district_id", "name"],
        name: "unique_area_per_district",
      },
      {
        fields: ["center_latitude", "center_longitude"],
        name: "geolocation_index",
      },
    ],
  }
);

// Instance methods
Area.prototype.getParkingLots = async function () {
  const { Facility } = sequelize.models;
  return await Facility.findAll({
    where: { area_id: this.id },
    order: [["name", "ASC"]],
  });
};

Area.prototype.getDistrict = async function () {
  const { District } = sequelize.models;
  return await District.findByPk(this.district_id);
};

Area.prototype.getFullLocation = async function () {
  const { District, Division } = sequelize.models;
  const district = await District.findByPk(this.district_id, {
    include: [{ model: Division, as: "division" }], // Explicitly use the 'division' alias
  });

  if (!district || !district.division) {
    // This check is now more reliable
    return null;
  }

  return {
    area: this.name,
    district: district.name,
    division: district.division.name, // FIX: Use the correct alias 'division' (lowercase)
  };
};

Area.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

// Static methods
Area.static = {
  async getByDistrict(districtId, popularFirst = true) {
    const order = popularFirst
      ? [
          ["popular", "DESC"],
          ["name", "ASC"],
        ]
      : [["name", "ASC"]];

    return await Area.findAll({
      where: { district_id: districtId },
      order,
    });
  },

  async getPopularAreas(limit = 10) {
    return await Area.findAll({
      where: { popular: true },
      limit,
      order: [["name", "ASC"]],
    });
  },

  async findNearestArea(latitude, longitude) {
    // Haversine formula for distance calculation
    const areas = await Area.findAll({
      where: {
        center_latitude: { [sequelize.Sequelize.Op.ne]: null },
        center_longitude: { [sequelize.Sequelize.Op.ne]: null },
      },
      attributes: {
        include: [
          [
            sequelize.literal(`
              6371 * acos(
                cos(radians(${latitude})) * 
                cos(radians(center_latitude)) * 
                cos(radians(center_longitude) - radians(${longitude})) + 
                sin(radians(${latitude})) * 
                sin(radians(center_latitude))
              )
            `),
            "distance",
          ],
        ],
      },
      order: sequelize.literal("distance ASC"),
      limit: 1,
    });

    return areas[0] || null;
  },

  async getWithParkingLotCounts(districtId) {
    const { Facility } = sequelize.models;
    const where = districtId ? { district_id: districtId } : {};

    return await Area.findAll({
      where,
      attributes: {
        include: [
          [
            sequelize.fn("COUNT", sequelize.col("facilities.id")),
            "facility_count",
          ],
        ],
      },
      include: [
        {
          model: Facility,
          attributes: [],
        },
      ],
      group: ["Area.id"],
      order: [
        ["popular", "DESC"],
        ["name", "ASC"],
      ],
    });
  },
};

// Define model relationships
Area.associate = (models) => {
  Area.belongsTo(models.District, {
    foreignKey: "district_id",
    as: "district",
  });
  Area.hasMany(models.Facility, {
    foreignKey: "area_id",
    as: "facilities",
  });
};

export default Area;
