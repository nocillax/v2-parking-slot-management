import models from "#models/index.js";
import { ApiResponse } from "#utils/ApiResponse.js";
import { ApiError } from "#utils/ApiError.js";

export const districtController = {
  // Get all districts with optional filtering
  async getDistricts(req, res, next) {
    try {
      const { division_id, search, limit = 50, offset = 0 } = req.query;

      let where = {};

      // Filter by division
      if (division_id) {
        where.division_id = division_id;
      }

      // Search by name
      if (search) {
        where.name = {
          [models.District.sequelize.Op.iLike]: `%${search}%`,
        };
      }

      const districts = await models.District.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["name", "ASC"]],
        attributes: ["id", "name", "code"],
      });

      res.status(200).json(
        new ApiResponse(200, "Districts retrieved successfully", {
          districts: districts.rows,
          total: districts.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
        })
      );
    } catch (error) {
      next(new ApiError(500, "Failed to retrieve districts", error.message));
    }
  },

  // Get single district by ID
  async getDistrict(req, res, next) {
    try {
      const { districtId } = req.params;

      const district = await models.District.findByPk(districtId, {
        include: [models.Division],
      });

      if (!district) {
        return next(new ApiError(404, "District not found"));
      }

      res
        .status(200)
        .json(
          new ApiResponse(200, "District retrieved successfully", district)
        );
    } catch (error) {
      next(new ApiError(500, "Failed to retrieve district", error.message));
    }
  },
};
