#!/usr/bin/env node
require('./_preamble')
const db = require('../lib/controllers/db')
const util = require('../lib/util')

const { schema } = db

util.run(async () => {
	// Be careful, this will wipe the whole DB
	if (process.argv[2] === '--drop') {
		await schema.dropTableIfExists('messages')
	}

	await schema.createTable('messages', (table) => {
		table.bigInteger('group_id').notNullable()
		table.bigInteger('message_id').notNullable()
		table.bigInteger('user_id').notNullable()
		table.text('text')
		table.timestamp('timestamp').notNullable()
		table.bigInteger('reply_to_id') // references group_id+message_id

		table.primary(['group_id', 'message_id'])
	})

	process.exit()
})
