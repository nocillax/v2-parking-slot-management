import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Payment model for handling reservation payments
const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    // Foreign key to reservation
    reservation_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "reservations",
        key: "id",
      },
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    method: {
      type: DataTypes.ENUM(
        "Credit Card",
        "Debit Card",
        "PayPal",
        "Cash",
        "Simulation"
      ),
      allowNull: false,
      defaultValue: "Simulation",
    },

    status: {
      type: DataTypes.ENUM("Pending", "Paid", "Failed", "Refunded"),
      allowNull: false,
      defaultValue: "Pending",
    },

    // Payment gateway transaction ID
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // Additional payment details
    payment_details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
    indexes: [
      {
        fields: ["reservation_id"],
      },
      {
        fields: ["status", "createdAt"],
      },
    ],
  }
);

// Process payment (simulation for MVP)
Payment.prototype.processPayment = async function (options = {}) {
  if (this.status !== "Pending") {
    throw new Error("Payment has already been processed");
  }

  // Simulate payment processing
  const isSuccessful = Math.random() > 0.05; // 95% success rate for simulation

  if (isSuccessful) {
    this.status = "Paid";
    this.transaction_id = `sim_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    this.payment_details = {
      processed_at: new Date(),
      gateway: "simulation",
      success: true,
    };
  } else {
    this.status = "Failed";
    this.payment_details = {
      processed_at: new Date(),
      gateway: "simulation",
      success: false,
      error: "Simulated payment failure",
    };
  }

  await this.save({ transaction: options.transaction });
  return this;
};

// Refund payment
Payment.prototype.refund = async function (refundAmount = null, options = {}) {
  if (this.status !== "Paid") {
    throw new Error("Only paid payments can be refunded");
  }

  const amount = refundAmount || this.amount;

  if (amount > this.amount) {
    throw new Error("Refund amount cannot exceed original payment amount");
  }

  this.status = "Refunded";
  this.payment_details = {
    ...this.payment_details,
    refunded_at: new Date(),
    refund_amount: amount,
  };

  await this.save({ transaction: options.transaction });
  return this;
};

// Check if payment is successful
Payment.prototype.isSuccessful = function () {
  return this.status === "Paid";
};

// Get payment summary for receipts
Payment.prototype.getSummary = function () {
  return {
    id: this.id,
    amount: this.amount,
    method: this.method,
    status: this.status,
    transaction_id: this.transaction_id,
    processed_at: this.createdAt,
  };
};

// Define model relationships
Payment.associate = (models) => {
  Payment.belongsTo(models.Reservation, {
    foreignKey: "reservation_id",
    as: "reservation",
  });
};

export default Payment;
