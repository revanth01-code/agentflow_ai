const express = require('express');
const { health } = require('../controllers/healthController');
const authRoutes = require('./authRoutes');
const workflowRoutes = require('./workflowRoutes');
const executionRoutes = require('./executionRoutes');
const integrationRoutes = require('./integrationRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

router.get('/health', health);
router.use('/auth', authRoutes);
router.use('/workflows', workflowRoutes);
router.use('/executions', executionRoutes);
router.use('/integrations', integrationRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
