const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'appuser',
  password: 'appsecret',
  database: 'products_db',
  port: 3306,
});

module.exports = pool;
