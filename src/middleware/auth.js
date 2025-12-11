const jwt = require('jsonwebtoken');
require('dotenv').config();


const authenticate = (req, res, next) => {
try {
const hdr = req.headers.authorization;
if (!hdr) return res.status(401).json({ message: 'No token' });
const token = hdr.split(' ')[1];
const payload = jwt.verify(token, process.env.JWT_SECRET);
req.user = { id: payload.id, role: payload.role };
next();
} catch (err) {
return res.status(401).json({ message: 'Invalid token' });
}
};


const requireAdmin = (req, res, next) => {
if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
next();
};


module.exports = { authenticate, requireAdmin };