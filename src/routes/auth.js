const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate'); // middleware custom xử lý errors
const { register } = require('../controllers/authController');
const { login } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
  ],
  validate, // nếu validation fail sẽ trả về 400
  register  // nếu hợp lệ, gọi controller thực hiện register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  login
);

module.exports = router;
