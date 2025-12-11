const Booking = require('../models/booking');
const Room = require('../models/room');
const { Op } = require('sequelize');


const createBooking = async (req, res, next) => {
try {
const userId = req.user.id;
const { roomId, checkIn, checkOut, guests } = req.body;
if (new Date(checkIn) >= new Date(checkOut)) return res.status(400).json({ message: 'Invalid dates' });


const room = await Room.findByPk(roomId);
if (!room) return res.status(404).json({ message: 'Room not found' });


const conflict = await Booking.findOne({
where: {
roomId,
[Op.not]: [
{
[Op.or]: [
{ checkOut: { [Op.lte]: checkIn } },
{ checkIn: { [Op.gte]: checkOut } }
]
}
]
}
});
if (conflict) return res.status(400).json({ message: 'Room already booked for selected dates' });


const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000*60*60*24)));
const totalPrice = parseFloat(room.price) * nights;


const booking = await Booking.create({ userId, roomId, checkIn, checkOut, guests: guests || 1, totalPrice });
res.status(201).json(booking);
} catch (err) { next(err); }
};


const cancelBooking = async (req, res, next) => {
try {
const userId = req.user.id;
const { id } = req.params;
const booking = await Booking.findByPk(id);
if (!booking) return res.status(404).json({ message: 'Booking not found' });
if (booking.userId !== userId && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
booking.status = 'cancelled';
await booking.save();
res.json({ message: 'Cancelled', booking });
} catch (err) { next(err); }
};


const listUserBookings = async (req, res, next) => {
try {
const userId = req.user.id;
const bookings = await Booking.findAll({ where: { userId }, include: [{ model: Room }] });
res.json(bookings);
} catch (err) { next(err); }
};


module.exports = { createBooking, cancelBooking, listUserBookings };