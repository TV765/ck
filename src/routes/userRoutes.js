const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate'); 
const userController = require('../controllers/userController');

const router = express.Router();

// POST /api/users/register
router.post(
  '/register',
  [
    body('fullName').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars')
  ],
  validate,
  userController.register
);

module.exports = router;
