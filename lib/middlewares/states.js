const states = require('../../config/states.json')
const reply = require('../actions/reply')
const roles = require('../util/roles')

exports.description = 'handles the state changes and replies'
exports.order = 40

const options = {}

exports.handler = (ctx) => {
	const { msg: { text }, user: { session } } = ctx

	// First check if text takes to any state globally
	const curr = states[session.get('state', '#')]
	const next = curr.options && curr.options[text] || options[text] || curr.default
	const state = states[next]
	const keys = state.options ? Object.keys(state.options).map(key => [{ text: key }]) : null
	session.set('state', next)

	const response = state.replies[0]
	// Rotate replies, it's not perfect since it's shared but better than random
	state.replies.push(state.replies.shift())
	return reply(ctx, response, { withTyping: true, asReply: roles.publicChat(ctx), keys })
}

Object.values(states).forEach((state) => {
	for (const text in state.options) {
		options[text] = state.options[text]
	}
})
