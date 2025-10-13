import Joi from "joi";

const getNotifications = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    unreadOnly: Joi.boolean(),
    priority: Joi.string().valid("low", "medium", "high", "urgent"),
  }),
};

export const notificationValidator = {
  getNotifications,
};
