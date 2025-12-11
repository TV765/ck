const bcrypt = require('bcrypt');
const { User } = require('../models'); // model User Sequelize

// Register user
const register = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // Kiểm tra email đã tồn tại chưa
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Tạo user mới
    const user = await User.create({ fullName, email, password: hashed });

    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, fullName: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register };
