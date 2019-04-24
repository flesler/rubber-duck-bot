const knex = require('knex')
const util = require('../util')
const logger = require('../util/logger')
const config = require('../util/config')

const LOG_LIMIT = 200

let { connection } = config.db
if (!connection.endsWith('?ssl=true')) {
	connection += '?ssl=true'
}

logger.debug('Initializing DB at', connection)

const client = knex({
	client: 'pg',
	pool: { min: 0, max: 3 },
	connection,
})

/**
 * This library does some pretty weird things
 * - client also emits the query events, but `query.sql` is in non-pg version
 * - `query` object is not the same across events, hence must index it by id
 * - `query.sql` is correct in `query` event but the non-pg version on `query-response`
 */
const queries = {}

function id(query) {
	return query.__knexQueryUid
}

client.on('start', (builder) => {
	builder.once('query', (query) => {
		const sql = client.raw(query.sql, query.bindings).toString()
		queries[id(query)] = { start: Date.now(), sql }
	})

	builder.once('query-response', (res, data) => {
		const query = queries[id(data)]
		const elapsed = Date.now() - query.start
		const { rowCount } = data.response
		const sql = util.limitMessage(query.sql, LOG_LIMIT)
		logger.debug(`SQL ${sql} | ${elapsed} ms - ${rowCount} row(s)`)
	})
})

client.on('query-error', (err, data) => {
	const parts = err.message.split(' - ')
	const error = parts.pop()
	let sql = parts.join(' - ')
	// A lot of hacking around to get the real SQL that failed
	const query = queries[id(data)]
	if (query) {
		sql = query.sql
	}
	logger.warn('SQL Error:', util.limitMessage(sql, LOG_LIMIT), '-', error)
})

// Add since they are not built-in

client.dropViewIfExists = viewName => (
	client.schema.raw('DROP VIEW IF EXISTS ??', [viewName])
)

client.createOrReplaceView = (viewName, query) => (
	client.schema.raw(`CREATE OR REPLACE VIEW ?? AS (\n${query(client)}\n)`, [viewName])
)

module.exports = client
