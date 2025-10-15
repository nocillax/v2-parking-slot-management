import models from "#models/index.js";
import { ApiResponse } from "#utils/ApiResponse.js";
import { ApiError } from "#utils/ApiError.js";

export const divisionController = {
  // Get all divisions
  async getDivisions(req, res, next) {
    try {
      const { search, limit = 50, offset = 0 } = req.query;

      let where = {};

      // Search by name
      if (search) {
        where.name = {
          [models.Division.sequelize.Op.iLike]: `%${search}%`,
        };
      }

      const divisions = await models.Division.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["name", "ASC"]],
        attributes: ["id", "name", "code"],
      });

      res.status(200).json(
        new ApiResponse(200, "Divisions retrieved successfully", {
          divisions: divisions.rows,
          total: divisions.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
        })
      );
    } catch (error) {
      next(new ApiError(500, "Failed to retrieve divisions", error.message));
    }
  },

  // Get single division by ID
  async getDivision(req, res, next) {
    try {
      const { divisionId } = req.params;

      const division = await models.Division.findByPk(divisionId);

      if (!division) {
        return next(new ApiError(404, "Division not found"));
      }

      res
        .status(200)
        .json(
          new ApiResponse(200, "Division retrieved successfully", division)
        );
    } catch (error) {
      next(new ApiError(500, "Failed to retrieve division", error.message));
    }
  },
};
