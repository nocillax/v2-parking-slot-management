import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Notification model for system messages to users
const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    // Foreign key to user
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    // Template-based approach
    template_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    // Data used to populate template
    template_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    // Generated title and message (from template)
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    // Additional metadata (reservation_id, payment_id, etc.)
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    // For email notifications
    email_sent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    email_sent_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Priority level for sorting/display
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      allowNull: false,
      defaultValue: "medium",
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    indexes: [
      {
        fields: ["user_id", "read", "createdAt"],
      },
      {
        fields: ["template_id", "createdAt"],
      },
      {
        fields: ["priority", "createdAt"],
      },
    ],
  }
);

// Mark notification as read
Notification.prototype.markAsRead = async function () {
  if (this.read) {
    return this; // Already read
  }

  this.read = true;
  await this.save();
  return this;
};

// Check if notification has expired
Notification.prototype.isExpired = function () {
  return this.expires_at && new Date() > this.expires_at;
};

// Send email notification (simulation for MVP)
Notification.prototype.sendEmail = async function () {
  if (this.email_sent) {
    throw new Error("Email already sent for this notification");
  }

  // Simulate email sending (in real app, use nodemailer)
  const emailSuccess = Math.random() > 0.02; // 98% success rate

  if (emailSuccess) {
    this.email_sent = true;
    this.email_sent_at = new Date();
    await this.save();

    console.log(`Email sent to user ${this.user_id}: ${this.title}`);
    return { success: true, message: "Email sent successfully" };
  } else {
    console.error(
      `Failed to send email to user ${this.user_id}: ${this.title}`
    );
    return { success: false, message: "Email delivery failed" };
  }
};

// Get notification summary for API responses
Notification.prototype.getSummary = function () {
  return {
    id: this.id,
    template_id: this.template_id,
    title: this.title,
    message: this.message,
    read: this.read,
    priority: this.priority,
    created_at: this.createdAt,
    expires_at: this.expires_at,
    metadata: this.metadata,
  };
};

// Static method to create and optionally send notification
Notification.createAndSend = async function (
  notificationData,
  sendEmail = false
) {
  const notification = await this.create(notificationData);

  if (sendEmail) {
    await notification.sendEmail();
  }

  return notification;
};

// Static method to get unread count for user
Notification.getUnreadCount = async function (userId) {
  return await this.count({
    where: {
      user_id: userId,
      read: false,
    },
  });
};

// Static method to mark all notifications as read for user
Notification.markAllAsRead = async function (userId) {
  return await this.update(
    { read: true },
    {
      where: {
        user_id: userId,
        read: false,
      },
    }
  );
};

// Define model relationships
Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
};

export default Notification;
