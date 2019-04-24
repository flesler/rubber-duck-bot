const typing = require('./typing')
const messages = require('../controllers/messages')
const util = require('../util')

// Telegram doesn't allow messages longer than 4096 chacters, make it a little shorter just in case
const MAX_CHARS = 4000
const MAX_TYPING_DELAY = 5000
const MAX_TYPING_LENGTH = 150

async function reply(ctx, text, { asReply = false, mention = false, markdown = false, withTyping = false, keys = undefined } = {}) {
	const { user, bot, msg } = ctx
	// Silently ignore self-mentions
	if (mention && user.id !== bot.id) {
		text = `${util.minDisplay(user)}: ${text}`
	}
	ctx.info('I said:', text)

	if (withTyping) {
		// To make it look better, show a typing indicator and a short delay before sending
		const start = Date.now()
		await typing(ctx)
		// Delay is larger the more text it includes
		// typing() is an actual request that takes time, aim to adhere to the desired delay
		const elapsed = Date.now() - start
		const len = Math.min(MAX_TYPING_LENGTH, text.length)
		const delay = Math.floor((len / MAX_TYPING_LENGTH) * MAX_TYPING_DELAY) - elapsed
		if (delay > 0) {
			await util.delay(delay)
		}
	}

	for (const chunk of split(text)) {
		const replyMsg = await ctx.reply(chunk, {
			disable_notification: true,
			disable_web_page_preview: true,
			reply_to_message_id: asReply ? msg.message_id : '',
			parse_mode: markdown ? 'Markdown' : undefined,
			reply_markup: keys === undefined ? keys :
				// Pass null to remove any previous keyboard
				keys ? { keyboard: keys, one_time_keyboard: true } : { remove_keyboard: true },
		})
		await util.catch(messages.insert(replyMsg))
	}
}

// Just a shortcut
reply.user = (ctx, text, opts = {}) => (
	reply(ctx, text, { ...opts, asReply: true, mention: true })
)

function split(text) {
	const chunks = []
	let buffer = ''
	for (const chunk of text.split('\n')) {
		if (buffer.length + chunk.length < MAX_CHARS) {
			if (buffer) {
				buffer += '\n'
			}
			buffer += chunk
		} else {
			chunks.push(buffer)
			buffer = chunk
			while (buffer.length >= MAX_CHARS) {
				chunks.push(buffer.slice(0, MAX_CHARS))
				buffer = buffer.slice(MAX_CHARS)
			}
		}
	}
	chunks.push(buffer)
	return chunks.filter(chunk => !!chunk)
}

module.exports = reply
