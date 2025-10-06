import "dotenv/config";
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;
const SALT_ROUNDS = 10;

// User model for authentication and profile management
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Optional default vehicle for quick reservations
    default_vehicle_no: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 20],
      },
    },

    role: {
      type: DataTypes.ENUM("admin", "user"),
      defaultValue: "user",
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      // Auto-hash password on user creation
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(SALT_ROUNDS);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Auto-hash password on user update
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(SALT_ROUNDS);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Compare password for login authentication
User.prototype.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token for authenticated sessions
User.prototype.generateJWT = function () {
  return jwt.sign(
    {
      id: this.id,
      email: this.email,
      role: this.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Hide password from JSON responses
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

// Define model relationships
User.associate = (models) => {
  User.hasMany(models.Reservation, {
    foreignKey: "user_id",
    as: "reservations",
  });

  User.hasMany(models.Waitlist, {
    foreignKey: "user_id",
    as: "waitlist_entries",
  });

  User.hasMany(models.Notification, {
    foreignKey: "user_id",
    as: "notifications",
  });

  User.hasMany(models.ParkingLot, {
    foreignKey: "admin_id",
    as: "managed_lots",
  });
};

export default User;
