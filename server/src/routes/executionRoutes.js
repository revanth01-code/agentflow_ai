const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/executionController');

const router = express.Router();

router.use(auth);
router.get('/', controller.list);
router.get('/:id', controller.get);
router.get('/:id/timeline', controller.timeline);
router.post('/:id/pause', controller.pause);
router.post('/:id/resume', controller.resume);
router.post('/:id/cancel', controller.cancel);

module.exports = router;
