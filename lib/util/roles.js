// Operators

exports.and = (...roles) => (
	ctx => roles.every(role => role(ctx))
)

exports.or = (...roles) => (
	ctx => roles.some(role => role(ctx))
)

exports.not = role => (
	ctx => !role(ctx)
)

// Roles

exports.publicChat = ctx => (
	ctx.chat.type !== 'private'
)

exports.privateChat = ctx => (
	!exports.publicChat(ctx)
)

exports.anyone = () => true
