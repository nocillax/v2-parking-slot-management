import "dotenv/config";
import { Sequelize } from "sequelize";

// Destructure environment variables
const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, NODE_ENV } =
  process.env;

// Database configuration - using destructured variables
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: false, // Use camelCase instead of snake_case
    freezeTableName: true, // Don't pluralize table names
  },
});

// Initialize database and create tables
export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Use { alter: true } during development to apply schema changes.
    // This will add the 'Bike' ENUM value without dropping the tables.
    // WARNING: This is not recommended for production. Use migrations instead.
    // await sequelize.models.Slot.sync({ alter: true });
    // await sequelize.models.Reservation.sync({ alter: true });
    // console.log("✅ Slot and Waitlist models were synchronized successfully.");

    // The full sync is commented out to avoid the 'divisions' table error for now.
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1); // Exit if database connection fails
  }
};

export default sequelize;
