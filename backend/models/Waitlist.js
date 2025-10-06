import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Waitlist model for managing slot availability queues
const Waitlist = sequelize.define(
  "Waitlist",
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

    // Foreign key to parking lot
    lot_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "parking_lots",
        key: "id",
      },
    },

    // Preferred slot type
    slot_type_pref: {
      type: DataTypes.ENUM("Normal", "VIP", "Handicapped"),
      allowNull: false,
      defaultValue: "Normal",
    },

    // Desired reservation time
    desired_start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    desired_end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "Active",
        "Notified",
        "Fulfilled",
        "Expired",
        "Cancelled"
      ),
      allowNull: false,
      defaultValue: "Active",
    },

    // When user was notified about slot availability
    notified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    // Notification expires after X minutes
    notification_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Higher number = higher priority
    },
  },
  {
    tableName: "waitlist",
    timestamps: true,
    indexes: [
      {
        fields: ["lot_id", "slot_type_pref", "status", "priority"],
      },
      {
        fields: ["user_id", "status"],
      },
      {
        fields: ["status", "desired_start_time"],
      },
    ],
  }
);

// Check if waitlist entry has expired
Waitlist.prototype.isExpired = function () {
  const maxWaitHours = 24; // Waitlist entries expire after 24 hours
  const expiryTime = new Date(
    this.createdAt.getTime() + maxWaitHours * 60 * 60 * 1000
  );
  return new Date() > expiryTime && this.status === "Active";
};

// Check if notification has expired
Waitlist.prototype.isNotificationExpired = function () {
  return (
    this.notification_expires_at && new Date() > this.notification_expires_at
  );
};

// Notify user about slot availability
Waitlist.prototype.notifyUser = async function (availableSlot) {
  if (this.status !== "Active") {
    throw new Error("Can only notify active waitlist entries");
  }

  const notificationMinutes = 5; // User has 5 minutes to respond
  this.status = "Notified";
  this.notified_at = new Date();
  this.notification_expires_at = new Date(
    Date.now() + notificationMinutes * 60 * 1000
  );

  await this.save();

  // Here you would typically send actual notification (email, push, etc.)
  // For now, we'll create a notification record
  const { Notification } = sequelize.models;
  await Notification.create({
    user_id: this.user_id,
    type: "waitlist_slot_available",
    title: "Parking Slot Available!",
    message: `A ${this.slot_type_pref} parking slot is now available at your requested time. You have ${notificationMinutes} minutes to reserve it.`,
    metadata: {
      waitlist_id: this.id,
      slot_id: availableSlot.id,
      expires_at: this.notification_expires_at,
    },
  });

  return this;
};

// Mark waitlist entry as fulfilled (user reserved the slot)
Waitlist.prototype.fulfill = async function () {
  if (this.status !== "Notified") {
    throw new Error("Can only fulfill notified waitlist entries");
  }

  this.status = "Fulfilled";
  await this.save();
  return this;
};

// Cancel waitlist entry
Waitlist.prototype.cancel = async function () {
  if (!["Active", "Notified"].includes(this.status)) {
    throw new Error("Cannot cancel completed or expired waitlist entries");
  }

  this.status = "Cancelled";
  await this.save();
  return this;
};

// Get position in queue
Waitlist.prototype.getQueuePosition = async function () {
  const count = await Waitlist.count({
    where: {
      lot_id: this.lot_id,
      slot_type_pref: this.slot_type_pref,
      status: "Active",
      priority: {
        [sequelize.Sequelize.Op.gte]: this.priority,
      },
      createdAt: {
        [sequelize.Sequelize.Op.lt]: this.createdAt,
      },
    },
  });
  return count + 1;
};

// Define model relationships
Waitlist.associate = (models) => {
  Waitlist.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });

  Waitlist.belongsTo(models.ParkingLot, {
    foreignKey: "lot_id",
    as: "parking_lot",
  });
};

export default Waitlist;
