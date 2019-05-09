require('dotenv').config();
const express = require('express');
const Sentry = require('@sentry/node');
const { button } = require('./middleware/slackComponents/slackButton');
button(358250058);

const middleware = require('./middleware/config');
const authenticate = require('./middleware/authenticate');
const errorMiddleware = require('./middleware/errorReporting');

const authController = require('./controllers/auth');
const userController = require('./controllers/users');
const reportController = require('./controllers/reports');
const responseController = require('./controllers/responses');
const slackController = require('./controllers/slack');

// initializations
const server = express();
Sentry.init({
	dsn: process.env.SENTRY_DSN
});

// middleware
middleware(server);

// controllers

server.use('/api/auth', authController);
server.use('/api/users', authenticate, userController);
server.use('/api/reports', authenticate, reportController);
server.use('/api/responses', authenticate, responseController);
// Changes authentication to handle requests from slack
server.use('/api/slack', slackController);

// error reporting middleware (Must be after all requests)
errorMiddleware(server);

server.get('/', (req, res) => {
	res.status(200).json({ message: 'Sanity check' });
});

if (require.main == module) {
	server.listen(process.env.PORT, () => {
		console.log(
			`🚀 Server is running at http://localhost:${process.env.PORT}/`
		);
	});
} else {
	module.exports = server;
}
