const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/workflowController');

const router = express.Router();

router.use(auth);
router.get('/dashboard', controller.dashboard);
router.get('/', controller.list);
router.post('/', body('name').optional().isString(), validate, controller.create);
router.post('/generate', body('prompt').isLength({ min: 8 }), validate, controller.generate);
router.get('/:id', controller.get);
router.put('/:id', controller.update);
router.post('/:id/duplicate', controller.duplicate);
router.post('/:id/execute', controller.execute);
router.delete('/:id', controller.remove);

module.exports = router;
