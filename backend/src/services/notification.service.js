import {
  notificationTemplates,
  processTemplate,
} from "#config/notificationTemplates.js";
import models from "#models/index.js";
import { Op } from "sequelize";

const { Notification } = models;

// Notification service for creating and sending notifications
export const notificationService = {
  // Create notification using template
  async create(userId, templateId, templateData = {}, options = {}) {
    // Get template
    const template = notificationTemplates[templateId];
    if (!template) {
      throw new Error(`Notification template '${templateId}' not found`);
    }

    // Process template with data
    const processed = processTemplate(template, templateData);

    // Create notification
    const notification = await Notification.create({
      user_id: userId,
      template_id: templateId,
      template_data: templateData,
      title: processed.title,
      message: processed.message,
      priority: options.priority || template.priority,
      expires_at: options.expires_at || null,
      metadata: options.metadata || {},
    });

    return notification;
  },

  // Create and optionally send email
  async createAndSend(userId, templateId, templateData = {}, options = {}) {
    const notification = await notificationService.create(
      userId,
      templateId,
      templateData,
      options
    );

    if (options.sendEmail) {
      await notification.sendEmail();
    }

    return notification;
  },

  // Send notification to multiple users (bulk)
  async createBulk(userIds, templateId, templateData = {}, options = {}) {
    const notifications = [];

    for (const userId of userIds) {
      const notification = await notificationService.create(
        userId,
        templateId,
        templateData,
        options
      );
      notifications.push(notification);
    }

    return notifications;
  },

  // Quick methods for common notifications
  async reservationConfirmed(userId, reservationData, sendEmail = false) {
    return await notificationService.createAndSend(
      userId,
      "reservation_confirmed",
      reservationData,
      {
        sendEmail,
        metadata: { reservation_id: reservationData.reservation_id },
      }
    );
  },

  async reservationReminder(userId, reservationData, sendEmail = true) {
    return await notificationService.createAndSend(
      userId,
      "reservation_reminder",
      reservationData,
      {
        sendEmail,
        priority: "high",
        metadata: { reservation_id: reservationData.reservation_id },
      }
    );
  },

  async overstayWarning(userId, overstayData, sendEmail = true) {
    return await notificationService.createAndSend(
      userId,
      "overstay_warning",
      overstayData,
      {
        sendEmail,
        priority: "urgent",
        metadata: { reservation_id: overstayData.reservation_id },
      }
    );
  },

  async paymentReceipt(userId, paymentData, sendEmail = false) {
    return await notificationService.createAndSend(
      userId,
      "payment_receipt",
      paymentData,
      {
        sendEmail,
        metadata: {
          payment_id: paymentData.payment_id,
          reservation_id: paymentData.reservation_id,
        },
      }
    );
  },

  async waitlistSlotAvailable(userId, waitlistData, sendEmail = true) {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    return await notificationService.createAndSend(
      userId,
      "waitlist_slot_available",
      waitlistData,
      {
        sendEmail,
        priority: "urgent",
        expires_at: expiresAt,
        metadata: {
          waitlist_id: waitlistData.waitlist_id,
          slot_id: waitlistData.slot_id,
        },
      }
    );
  },

  // Get user notifications with pagination
  async getUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      priority = null,
    } = options;

    const where = { user_id: userId };

    if (unreadOnly) {
      where.read = false;
    }

    if (priority) {
      where.priority = priority;
    }

    return await Notification.findAndCountAll({
      where,
      order: [
        ["priority", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit,
      offset: (page - 1) * limit,
    });
  },

  // Mark notifications as read
  async markAsRead(notificationIds, userId) {
    return await Notification.update(
      { read: true },
      { where: { id: notificationIds, user_id: userId } }
    );
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    return await Notification.markAllAsRead(userId);
  },

  // Delete a single notification for a user
  async deleteNotification(notificationId, userId) {
    return await Notification.destroy({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });
  },

  // Get unread count for user
  async getUnreadCount(userId) {
    return await Notification.count({
      where: { user_id: userId, read: false },
    });
  },

  // Clean up expired notifications
  async cleanupExpired() {
    const expiredCount = await Notification.destroy({
      where: {
        expires_at: {
          [Op.lt]: new Date(),
        },
      },
    });

    console.log(`🧹 Cleaned up ${expiredCount} expired notifications`);
    return expiredCount;
  },
};
