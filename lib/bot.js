const pkg = require('../package.json')
const { bot, available } = require('./integrations/telegram')
const util = require('./util')
const logger = require('./util/logger')
const config = require('./util/config')

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

// Commands
if (!available) {
	logger.warn('Telegram Bot is unavailable because no token was provided')
} else if (config.telegram.botEnabled) {
	bot.telegram.getMe().then((info) => {
		util.extendUser(info)
		util.copy(bot.options, info)
		bot.startPolling()
		logger.info(`${bot.options.display} version ${pkg.version} initialized and polling in ${config.mode} mode`)
	})
}
