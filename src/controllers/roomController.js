const { Op } = require('sequelize');
const Room = require('../models/room');
const Booking = require('../models/booking');


const searchAvailable = async (req, res, next) => {
try {
const { checkIn, checkOut, type } = req.query;
if (!checkIn || !checkOut) return res.status(400).json({ message: 'checkIn and checkOut required' });


// find bookings that overlap with requested interval
const conflicts = await Booking.findAll({
where: {
[Op.not]: [
{
[Op.or]: [
{ checkOut: { [Op.lte]: checkIn } },
{ checkIn: { [Op.gte]: checkOut } }
]
}
]
},
attributes: ['roomId'],
group: ['roomId']
});


const conflictedRoomIds = conflicts.map(b => b.roomId);
const where = {};
if (type) where.type = type;
if (conflictedRoomIds.length) where.id = { [Op.notIn]: conflictedRoomIds };


const available = await Room.findAll({ where });
res.json(available);
} catch (err) { next(err); }
};


// Admin CRUD
const createRoom = async (req, res, next) => {
try {
const room = await Room.create(req.body);
res.status(201).json(room);
} catch (err) { next(err); }
};


const listRooms = async (req, res, next) => {
try {
const rooms = await Room.findAll();
res.json(rooms);
} catch (err) { next(err); }
};


module.exports = { searchAvailable, createRoom, listRooms };