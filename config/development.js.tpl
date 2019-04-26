module.exports = {
	http: {
		port: 0,
		host: null,
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
