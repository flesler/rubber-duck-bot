const Telegraf = require('telegraf')
const config = require('../util/config')

const bot = new Telegraf(config.telegram.token, { telegram: { webhookReply: false } })

// For now just expose the object and let callers use it directly
// Could then wrap its methods if it gets more complex
exports.bot = bot
exports.api = bot.telegram
// If no token is provided, bot won't run
exports.available = !!config.telegram.token
