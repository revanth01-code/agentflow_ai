const express = require('express');
const auth = require('../middleware/auth');
const controller = require('../controllers/templateController');

const router = express.Router();

router.use(auth);
router.get('/', controller.list);
router.post('/:id/use', controller.use);

module.exports = router;
