"use strict";
// This file configures sequelize-cli to use environment variables
// It ensures that migrations run against the same database as the application.
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = process.env;

const commonConfig = {
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
};

module.exports = {
  development: commonConfig,
  test: commonConfig,
  production: commonConfig,
};
