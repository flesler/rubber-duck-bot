const Telegraf = require('telegraf')
const config = require('../util/config')

const api = new Telegraf.Telegram(config.telegram.token)
const bot = new Telegraf(config.telegram.token)

// For now just expose the object and let callers use it directly
// Could then wrap its methods if it gets more complex
exports.api = api
exports.bot = bot
// If no token is provided, bot won't run
exports.available = !!config.telegram.token
