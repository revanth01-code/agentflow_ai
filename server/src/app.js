const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { corsMiddleware, helmetMiddleware, rateLimiter } = require('./middleware/security');

const app = express();

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.use('/api', routes);
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
