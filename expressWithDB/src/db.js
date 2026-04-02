const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
  override: true,
});

const mysql = require('mysql2/promise');
const Sequelize = require('sequelize');

// Fall back to docker-compose credentials if .env is empty or unset.
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = Number(process.env.DB_PORT) || 3306;
const dbUser = process.env.DB_USER || 'appuser';
const dbPassword = process.env.DB_PASSWORD || 'appsecret';
const dbName = process.env.DB_NAME || 'products_db';



const pool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
});

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    decimalNumbers: true,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
});





module.exports = { sequelize, pool };
