const http = require('http')
const pkg = require('../package.json')
const { bot, available } = require('./integrations/telegram')
const util = require('./util')
const logger = require('./util/logger')
const config = require('./util/config')

process.on('unhandledRejection', (err) => {
	const msg = config.production ? err.stack.replace(/\n/g, '\\n') : err.stack
	logger.error('Unhandled rejection:', msg)
})

util.catch(bot)

// Middlewares
for (const middleware of util.getModules('middlewares')) {
	bot.use((ctx, next) => {
		const ret = middleware.handler(ctx, next)
		if (middleware.handler.length < 2) {
			// Implicit next in async function
			if (ret && ret.then) {
				ret.then(() => next())
			} else {
				next()
			}
		}
	})
}

(async () => {
	if (!available) {
		return logger.warn('Telegram Bot is unavailable because no token was provided')
	}

	if (!config.telegram.botEnabled) {
		return
	}

	const info = await bot.telegram.getMe()
	util.extendUser(info)
	util.copy(bot.options, info)

	const secretPath = '/' + config.telegram.token
	// Heroku requires an HTTP server or it will crash the process
	if (config.http.port) {
		http.createServer(bot.webhookCallback(secretPath)).listen(config.http.port)
	}

	if (config.http.host) {
		bot.telegram.setWebhook(config.http.host + secretPath)
	} else {
		await bot.telegram.deleteWebhook()
		bot.startPolling()
	}

	logger.info(`${bot.options.display} version ${pkg.version} initialized in ${config.mode} mode`)
})()
