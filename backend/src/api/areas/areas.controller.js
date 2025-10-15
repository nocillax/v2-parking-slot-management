import models from "#models/index.js";
import { ApiResponse } from "#utils/ApiResponse.js";
import { ApiError } from "#utils/ApiError.js";

export const areaController = {
  // Get all areas with optional filtering
  async getAreas(req, res, next) {
    try {
      const {
        district_id,
        division_id,
        search,
        popular,
        limit = 50,
        offset = 0,
      } = req.query;

      let where = {};
      let include = [];

      // Filter by district
      if (district_id) {
        where.district_id = district_id;
      }

      // Filter by division (through district)
      if (division_id) {
        include.push({
          model: models.District,
          where: { division_id },
          attributes: [],
        });
      }

      // Search by name
      if (search) {
        where.name = {
          [models.Area.sequelize.Op.iLike]: `%${search}%`,
        };
      }

      // Filter popular areas
      if (popular === "true") {
        where.popular = true;
      }

      const areas = await models.Area.findAndCountAll({
        where,
        include,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [["name", "ASC"]],
        attributes: ["id", "name", "type", "popular"],
      });

      res.status(200).json(
        new ApiResponse(200, "Areas retrieved successfully", {
          areas: areas.rows,
          total: areas.count,
          limit: parseInt(limit),
          offset: parseInt(offset),
        })
      );
    } catch (error) {
      next(new ApiError(500, "Failed to retrieve areas", error.message));
    }
  },

  // Get single area by ID
  async getArea(req, res, next) {
    try {
      const { areaId } = req.params;

      const area = await models.Area.findByPk(areaId, {
        include: [
          {
            model: models.District,
            include: [models.Division],
          },
        ],
      });

      if (!area) {
        return next(new ApiError(404, "Area not found"));
      }

      res
        .status(200)
        .json(new ApiResponse(200, "Area retrieved successfully", area));
    } catch (error) {
      next(new ApiError(500, "Failed to retrieve area", error.message));
    }
  },
};
