import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Division = sequelize.define(
  "Division",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: "Division name (e.g., Dhaka, Chittagong)",
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      comment: "Short code (e.g., DHA, CTG)",
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Bangladesh",
      comment: "Country name for future expansion",
    },
  },
  {
    tableName: "divisions",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["name"],
      },
      {
        unique: true,
        fields: ["code"],
      },
    ],
  }
);

// Instance methods
Division.prototype.getDistricts = async function () {
  const { District } = sequelize.models;
  return await District.findAll({
    where: { division_id: this.id },
    order: [["name", "ASC"]],
  });
};

Division.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

// Static methods
Division.static = {
  async getAllWithCounts() {
    const { District } = sequelize.models;
    return await Division.findAll({
      attributes: {
        include: [
          [
            sequelize.fn("COUNT", sequelize.col("Districts.id")),
            "district_count",
          ],
        ],
      },
      include: [
        {
          model: District,
          attributes: [],
        },
      ],
      group: ["Division.id"],
      order: [["name", "ASC"]],
    });
  },
};

// Define model relationships
Division.associate = (models) => {
  Division.hasMany(models.District, {
    foreignKey: "division_id",
    as: "districts",
  });
};

export default Division;
