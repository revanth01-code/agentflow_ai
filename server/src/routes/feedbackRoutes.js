const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/feedbackController');

const router = express.Router();

router.post('/', auth, [
  body('message').isString().trim().isLength({ min: 1, max: 5000 })
], validate, controller.sendFeedback);

module.exports = router;
