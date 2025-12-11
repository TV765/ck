const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'mysql';

let sequelize;

if (process.env.DB_URL) {
  // Nếu dùng DATABASE_URL (ví dụ deploy Heroku)
  sequelize = new Sequelize(process.env.DB_URL, {
    dialect,
    logging: false,
  });
} else {
  // Cấu hình riêng lẻ
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, // để cùng tên với skeleton
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect,
      logging: false,
    }
  );
}

module.exports = sequelize;
