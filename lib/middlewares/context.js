const util = require('../util')
const { MessageType } = require('../util/enum')

exports.description = 'extends the built-in Telegraf context'
exports.order = 1

exports.handler = (ctx, next) => {
	// Ignore editions
	if (ctx.updateType === 'edited_message') {
		return
	}

	const msg = ctx.update.message
	// Some messages like channel_post don't have message, ignore them
	if (!msg) {
		return
	}
	// ctx.chat is a getter, will reflect ctx.update.message.chat
	util.extendChat(msg.chat)
	msg.type = getType(msg)
	msg.text = getText(msg)
	// Switch it to milliseconds
	msg.date *= 1000

	ctx.bot = msg.bot = ctx.options
	ctx.msg = ctx.update.message = msg

	ctx.users = getUsers(msg).map(util.extendUser)
	ctx.user = msg.user = ctx.users[0]
	// Remember who invited if not the same as user in question
	ctx.by = util.extendUser(msg.from)
	return next()
}

function getType(msg) {
	if (msg.new_chat_members || msg.group_chat_created || msg.migrate_to_chat_id) {
		return MessageType.JOIN
	}
	if (msg.left_chat_member) {
		return MessageType.LEAVE
	}
	return MessageType.MESSAGE
}

function getUsers(msg) {
	switch (msg.type) {
		case MessageType.LEAVE:
			return [msg.left_chat_member]
		case MessageType.JOIN:
			// When a chat is created or migrated, implies the bot was added
			return msg.new_chat_members || [msg.bot]
		default:
			return [msg.from]
	}
}

function getText(msg) {
	// Try to find texts when there's technically none
	return msg.text || msg.caption ||
		msg.sticker && msg.sticker.emoji ||
		msg.document && `<${msg.document.file_name}>` ||
		msg.photo && '<photo>' ||
		msg.audio && '<audio>' ||
		msg.voice && '<voice>'
}
