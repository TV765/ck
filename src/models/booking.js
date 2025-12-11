const { DataTypes } = require('sequelize');
const  sequelize  = require('./index');
const User = require('./user');
const Room = require('./room');


const Booking = sequelize.define('Booking', {
id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
checkIn: { type: DataTypes.DATEONLY, allowNull: false },
checkOut: { type: DataTypes.DATEONLY, allowNull: false },
guests: { type: DataTypes.INTEGER, defaultValue: 1 },
totalPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
status: { type: DataTypes.ENUM('booked','cancelled','completed'), defaultValue: 'booked' }
}, { tableName: 'bookings' });


User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });


Room.hasMany(Booking, { foreignKey: 'roomId' });
Booking.belongsTo(Room, { foreignKey: 'roomId' });


module.exports = Booking;