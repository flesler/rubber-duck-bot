const util = require('../util')

const DEFAULT_THROTTLE = 5 * util.MINUTE

exports.description = 'adds in-memory session support'
exports.order = 20

exports.handler = (ctx) => {
	const { chat, user } = ctx
	// Session is for each combination of chat+user (including private chats)
	ctx.session = exports.get(`${chat.id}:${user.id}`)
	ctx.chat.session = exports.get(chat.id)
	ctx.user.session = exports.get(user.id)
}

const sessions = {}

// In case another module wants to use some too
exports.get = (id) => {
	if (!sessions[id]) {
		sessions[id] = new Session(id)
	}
	return sessions[id]
}

// Internal Session class

class Session {
	constructor(id) {
		this.id = id
		this.state = {}
	}

	// Basic methods

	has(key) {
		return key in this.state
	}

	get(key, def = null) {
		return this.has(key) ? this.state[key] : def
	}

	del(key) {
		delete this.state[key]
	}

	set(key, value) {
		this.state[key] = value
		return value
	}

	// Useful abstractions

	inc(key, by = 1) {
		return this.set(key, this.get(key, 0) + by)
	}

	first(key) {
		return this.inc(key) === 1
	}

	throttle(key, time = DEFAULT_THROTTLE) {
		if (this.since(key) < time) {
			return false
		}
		this.now(key)
		return true
	}

	since(key) {
		return Date.now() - this.get(key, 0)
	}

	now(key, offset = 0) {
		return this.set(key, Date.now() + offset)
	}
}

