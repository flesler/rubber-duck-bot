const logger = require('../lib/util/logger')

process.on('unhandledRejection', (err) => {
	logger.error('Unhandled rejection:', err.stack)
	process.exit(1)
})
