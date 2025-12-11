const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: "Bookings API OK" });
});

module.exports = router;
