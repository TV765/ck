const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(helmet());
app.use(express.json());

// ===== Routes =====
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/rooms', require('./src/routes/rooms'));
app.use('/api/bookings', require('./src/routes/bookings'));

// ===== Test root =====
app.get('/', (req, res) => res.send('Server is running!'));

module.exports = app; // chỉ export app, không listen
