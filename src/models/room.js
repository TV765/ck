const { DataTypes } = require('sequelize');
const sequelize = require('./index');


const Room = sequelize.define('Room', {
id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
code: { type: DataTypes.STRING, allowNull: false, unique: true },
type: { type: DataTypes.STRING, allowNull: false },
price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
capacity: { type: DataTypes.INTEGER, defaultValue: 1 },
description: { type: DataTypes.TEXT }
}, { tableName: 'rooms' });


module.exports = Room;