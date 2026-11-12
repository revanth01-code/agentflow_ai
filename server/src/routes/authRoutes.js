const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/authController');

const router = express.Router();

router.post('/register', [
  body('name').isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
], validate, controller.register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], validate, controller.login);

router.get('/google', controller.google);
router.get('/google/callback', controller.googleCallback);
router.get('/me', auth, controller.me);
router.put('/ai-keys', auth, [
  body('geminiApiKey').optional().isString(),
  body('openrouterApiKey').optional().isString()
], validate, controller.updateAiKeys);

module.exports = router;
