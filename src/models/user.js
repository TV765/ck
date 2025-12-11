const sequelize = require('./index'); // import trực tiếp
const { DataTypes } = require('sequelize');


const User = sequelize.define('User', {
id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
fullName: { type: DataTypes.STRING, allowNull: false },
email: { type: DataTypes.STRING, allowNull: false, unique: true },
passwordHash: { type: DataTypes.STRING, allowNull: false },
phone: { type: DataTypes.STRING },
role: { type: DataTypes.ENUM('user','admin'), defaultValue: 'user' }
}, { tableName: 'users' });


module.exports = User;