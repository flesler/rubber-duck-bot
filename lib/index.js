const http = require('http')
const config = require('./util/config')
const logger = require('./util/logger')

process.on('unhandledRejection', (err) => {
	const msg = config.production ? err.stack.replace(/\n/g, '\\n') : err.stack
	logger.error('Unhandled rejection:', msg)
})

if (config.production) {
	// Try to catch anything that will kill the process and flush changes before it does
	for (const event of ['SIGTERM', 'SIGINT', 'beforeExit', 'exit', 'uncaughtException']) {
		process.on(event, () => {
			setTimeout(() => process.exit(), 1000)
		})
	}
}

// Heroku requires an HTTP server or it will crash the process
if (config.http.port) {
	http.createServer((req, res) => {
		res.writeHead(200)
		res.end()
	}).listen(config.http.port)
}

require('./bot')
