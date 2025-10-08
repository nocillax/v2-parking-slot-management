import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const District = sequelize.define(
  "District",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    division_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "divisions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
      comment: "Foreign key to divisions table",
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "District name (e.g., Dhaka, Gazipur)",
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: "Short code (e.g., DHA, GAZ)",
    },
  },
  {
    tableName: "districts",
    timestamps: true,
    indexes: [
      {
        fields: ["division_id"],
      },
      {
        unique: true,
        fields: ["division_id", "name"],
        name: "unique_district_per_division",
      },
      {
        unique: true,
        fields: ["division_id", "code"],
        name: "unique_code_per_division",
      },
    ],
  }
);

// Instance methods
District.prototype.getAreas = async function () {
  const { Area } = sequelize.models;
  return await Area.findAll({
    where: { district_id: this.id },
    order: [
      ["popular", "DESC"],
      ["name", "ASC"],
    ],
  });
};

District.prototype.getDivision = async function () {
  const { Division } = sequelize.models;
  return await Division.findByPk(this.division_id);
};

District.prototype.toJSON = function () {
  const values = { ...this.get() };
  return values;
};

// Static methods
District.static = {
  async getByDivision(divisionId) {
    return await District.findAll({
      where: { division_id: divisionId },
      order: [["name", "ASC"]],
    });
  },

  async getWithAreaCounts(divisionId) {
    const { Area } = sequelize.models;
    const where = divisionId ? { division_id: divisionId } : {};

    return await District.findAll({
      where,
      attributes: {
        include: [
          [sequelize.fn("COUNT", sequelize.col("Areas.id")), "area_count"],
        ],
      },
      include: [
        {
          model: Area,
          attributes: [],
        },
      ],
      group: ["District.id"],
      order: [["name", "ASC"]],
    });
  },
};

export default District;
