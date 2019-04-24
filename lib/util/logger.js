const winston = require('winston')
const { log } = require('../util/config')

const logger = new winston.Logger({
	level: log.level,
	transports: [
		new (winston.transports.Console)({
			colorize: true,
		}),
	],
})

module.exports = logger
