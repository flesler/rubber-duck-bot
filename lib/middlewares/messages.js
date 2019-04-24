const messages = require('../controllers/messages')

exports.description = 'stores all messages'
exports.order = 30

exports.handler = ctx => (
	messages.insert(ctx.msg)
)
