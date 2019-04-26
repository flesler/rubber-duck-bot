const messages = require('../controllers/messages')

exports.description = 'stores all messages'
exports.order = 30

exports.handler = (ctx) => {
	const { msg } = ctx
	ctx.info('User said:', msg.text)
	return messages.insert(msg)
}
