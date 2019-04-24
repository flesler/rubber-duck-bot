module.exports = (ctx, chat = ctx.chat) => (
	ctx.telegram.sendChatAction(
		typeof chat === 'string' ? chat : chat.id,
		'typing',
	)
)
