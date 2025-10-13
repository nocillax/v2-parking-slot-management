import Joi from "joi";

const getNotifications = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    unreadOnly: Joi.boolean(),
    priority: Joi.string().valid("low", "medium", "high", "urgent"),
  }),
};

const markAsRead = {
  params: Joi.object().keys({
    notificationId: Joi.string().uuid().required(),
  }),
};

const deleteNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().uuid().required(),
  }),
};

export const notificationValidator = {
  getNotifications,
  markAsRead,
  deleteNotification,
};
