const db = require('./db')
const util = require('../util')

function table() {
	return db('messages')
}

exports.insert = (msg) => {
	const { text, chat, from } = msg
	let { date } = msg
	if (date * 1000 <= Date.now()) {
		date *= 1000
	}

	const row = util.clean({
		group_id: chat.id,
		message_id: msg.message_id,
		user_id: from.id,
		reply_to_id: msg.reply_to_message && msg.reply_to_message.message_id,
		text: text || null,
		timestamp: util.toISO(date),
	})
	return table().insert(row)
}
