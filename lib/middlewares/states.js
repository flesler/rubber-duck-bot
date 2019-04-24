const states = require('../../config/states.json')
const reply = require('../actions/reply')
const roles = require('../util/roles')

exports.description = 'handles the state changes and replies'
exports.order = 40

const answers = {}

exports.handler = (ctx) => {
	const { msg: { text }, user: { session } } = ctx

	// First check if text takes to any state globally
	const curr = states[session.get('state', '#')]
	const next = curr.answers && curr.answers[text] || answers[text] || curr.default
	const state = states[next]
	const keys = state.answers ? Object.keys(state.answers).map(key => [{ text: key }]) : null
	session.set('state', next)

	return reply(ctx, state.reply, { withTyping: true, asReply: roles.publicChat(ctx), keys })
}

Object.values(states).forEach((state) => {
	for (const text in state.answers) {
		answers[text] = state.answers[text]
	}
})
