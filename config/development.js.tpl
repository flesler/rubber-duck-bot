module.exports = {
	http: {
		port: 0,
	},
	log: {
		level: 'debug',
		format: 'dev',
	},
	db: {
		connection: 'postgres://user:pass@host/db',
	},
	telegram: {
		botEnabled: true,
		token: '...',
	},
}
