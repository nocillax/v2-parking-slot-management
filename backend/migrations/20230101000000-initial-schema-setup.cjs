"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Create all ENUM types
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."enum_areas_type" AS ENUM('Residential', 'Commercial', 'Mixed', 'Industrial');
        CREATE TYPE "public"."enum_users_role" AS ENUM('user', 'admin');
        CREATE TYPE "public"."enum_slots_slot_type" AS ENUM('Normal', 'VIP', 'Handicapped', 'Bike');
        CREATE TYPE "public"."enum_slots_status" AS ENUM('Free', 'Reserved', 'Occupied');
        CREATE TYPE "public"."enum_reservations_status" AS ENUM('Active', 'Checked-in', 'Completed', 'Expired', 'Overstayed', 'Cancelled');
        CREATE TYPE "public"."enum_reservations_payment_status" AS ENUM('Pending', 'Paid', 'Failed');
        CREATE TYPE "public"."enum_payments_status" AS ENUM('Pending', 'Paid', 'Failed');
        CREATE TYPE "public"."enum_waitlist_status" AS ENUM('Active', 'Notified', 'Fulfilled', 'Expired', 'Cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Step 2: Create tables in order of dependency
    await queryInterface.createTable("divisions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      code: { type: Sequelize.STRING(10), allowNull: false, unique: true },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: "Bangladesh",
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable("districts", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      division_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "divisions", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      code: { type: Sequelize.STRING(10), allowNull: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable("areas", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      district_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "districts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      type: {
        type: Sequelize.ENUM(
          "Residential",
          "Commercial",
          "Mixed",
          "Industrial"
        ),
        allowNull: false,
        defaultValue: "Mixed",
      },
      popular: { type: Sequelize.BOOLEAN, defaultValue: false },
      center_latitude: { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      center_longitude: { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      refresh_token: { type: Sequelize.STRING(500), allowNull: true }, // This was missing
      role: { type: Sequelize.ENUM("user", "admin"), defaultValue: "user" },
      default_vehicle_no: { type: Sequelize.STRING, allowNull: true },
      default_division_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "divisions", key: "id" },
      },
      default_district_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "districts", key: "id" },
      },
      default_area_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "areas", key: "id" },
      },
      latitude: { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      longitude: { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable("facilities", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      area_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "areas", key: "id" },
      },
      address: { type: Sequelize.STRING(500), allowNull: false },
      latitude: { type: Sequelize.DECIMAL(10, 8), allowNull: true },
      longitude: { type: Sequelize.DECIMAL(11, 8), allowNull: true },
      total_slots: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      admin_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable("slots", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      facility_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "facilities", key: "id" },
      },
      slot_type: {
        type: Sequelize.ENUM("Normal", "VIP", "Handicapped", "Bike"),
        defaultValue: "Normal",
      },
      status: {
        type: Sequelize.ENUM("Free", "Reserved", "Occupied"),
        defaultValue: "Free",
      },
      hourly_rate: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      location_tag: { type: Sequelize.STRING, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable("reservations", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      slot_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "slots", key: "id" },
      },
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE, allowNull: false },
      status: {
        type: Sequelize.ENUM(
          "Active",
          "Checked-in",
          "Completed",
          "Expired",
          "Overstayed",
          "Cancelled"
        ),
        defaultValue: "Active",
      },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_status: {
        type: Sequelize.ENUM("Pending", "Paid", "Failed"),
        defaultValue: "Pending",
      },
      vehicle_no: { type: Sequelize.STRING, allowNull: true },
      check_in_time: { type: Sequelize.DATE, allowNull: true },
      check_out_time: { type: Sequelize.DATE, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      reservation_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "reservations", key: "id" },
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      method: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "System",
      },
      status: {
        type: Sequelize.ENUM("Pending", "Paid", "Failed"),
        defaultValue: "Pending",
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable("waitlist", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      facility_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "facilities", key: "id" },
      },
      slot_type_pref: {
        type: Sequelize.ENUM("Normal", "VIP", "Handicapped", "Bike"),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          "Active",
          "Notified",
          "Fulfilled",
          "Expired",
          "Cancelled"
        ),
        defaultValue: "Active",
      },
      priority: { type: Sequelize.INTEGER, allowNull: true },
      // Fields required for reservation creation and notification logic
      desired_start_time: { type: Sequelize.DATE, allowNull: false },
      desired_end_time: { type: Sequelize.DATE, allowNull: false },
      notified_at: { type: Sequelize.DATE, allowNull: true },
      notification_expires_at: { type: Sequelize.DATE, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable("notifications", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
      },
      message: { type: Sequelize.TEXT, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: true },
      metadata: { type: Sequelize.JSONB, allowNull: true }, // Add metadata column
      read: { type: Sequelize.BOOLEAN, defaultValue: false },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    // Step 3: Add unique constraints and indexes that were defined in models
    await queryInterface.addConstraint("districts", {
      fields: ["division_id", "name"],
      type: "unique",
      name: "unique_district_per_division",
    });

    await queryInterface.addConstraint("areas", {
      fields: ["district_id", "name"],
      type: "unique",
      name: "unique_area_per_district",
    });

    // Step 4: Add performance indexes from models
    await queryInterface.addIndex("reservations", ["user_id", "status"], {
      name: "reservations_user_id_status_idx",
    });
    await queryInterface.addIndex(
      "reservations",
      ["slot_id", "start_time", "end_time"],
      {
        name: "reservations_slot_time_idx",
      }
    );
    await queryInterface.addIndex("reservations", ["status", "start_time"], {
      name: "reservations_status_start_time_idx",
    });

    await queryInterface.addIndex("slots", ["facility_id", "status"], {
      name: "slots_facility_id_status_idx",
    });

    await queryInterface.addIndex("waitlist", ["facility_id", "status"], {
      name: "waitlist_facility_id_status_idx",
    });

    await queryInterface.addIndex("notifications", ["user_id", "read"], {
      name: "notifications_user_id_read_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop indexes first (optional, but good practice)
    // Note: Dropping tables automatically drops their indexes.
    // This section is for completeness if you ever need to reverse only indexes.

    // Drop tables in reverse order of creation
    await queryInterface.dropTable("notifications");
    await queryInterface.dropTable("waitlist");
    await queryInterface.dropTable("payments");
    await queryInterface.dropTable("reservations");
    await queryInterface.dropTable("slots");
    await queryInterface.dropTable("facilities");
    await queryInterface.dropTable("users");
    await queryInterface.dropTable("areas");
    await queryInterface.dropTable("districts");
    await queryInterface.dropTable("divisions");

    // Drop all ENUM types
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "public"."enum_areas_type";
      DROP TYPE IF EXISTS "public"."enum_users_role";
      DROP TYPE IF EXISTS "public"."enum_slots_slot_type";
      DROP TYPE IF EXISTS "public"."enum_slots_status";
      DROP TYPE IF EXISTS "public"."enum_reservations_status";
      DROP TYPE IF EXISTS "public"."enum_reservations_payment_status";
      DROP TYPE IF EXISTS "public"."enum_payments_status";
      DROP TYPE IF EXISTS "public"."enum_waitlist_status";
    `);
  },
};
