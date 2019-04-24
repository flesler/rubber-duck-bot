const { env } = process

module.exports = {
	http: {
		port: number(env.PORT),
	},
	log: {
		level: string(env.LOG_LEVEL, 'info'),
		format: 'combined',
	},
	db: {
		connection: string(env.DATABASE_URL),
	},
	telegram: {
		botEnabled: true,
		token: string(env.BOT_TOKEN),
	},
}

function string(str, def) {
	if (str) {
		return str
	}
	if (!def) {
		throw new Error('Missing env var')
	}
	return def
}

function number(str, def) {
	return parseFloat(string(str, def))
}
