const util = require('../util')
const logger = require('../util/logger')

const LOG_LEVELS = ['debug', 'info', 'warn', 'error']

exports.description = 'provides utility functions for logging'
exports.order = 10

const methods = {}

for (const level of LOG_LEVELS) {
	methods[level] = function (...args) {
		const msg = args.join(' ').replace(/\s+/g, ' ')
		logger[level](this.chat.display, '>', this.user.display, '>', msg)
	}
}

exports.handler = (ctx) => {
	util.copy(ctx, methods)
}

