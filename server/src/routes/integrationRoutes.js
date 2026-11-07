const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/integrationController');

const router = express.Router();

router.get('/oauth/:provider/callback', controller.oauthCallback);
router.get('/oauth/error', controller.oauthError);

router.use(auth);
router.get('/', controller.list);
router.get('/status', controller.status);
router.get('/oauth/:provider/start', controller.startOAuth);
router.post('/', body('provider').notEmpty(), validate, controller.upsert);

module.exports = router;
