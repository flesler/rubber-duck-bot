const fs = require('fs')

exports.SECOND = 1000
exports.MINUTE = 60 * exports.SECOND
exports.HOUR = 60 * exports.MINUTE
exports.DAY = 24 * exports.HOUR
exports.YEAR = 365 * exports.DAY

/* Functions */
exports.run = fn => (
	fn()
)

exports.noop = () => {
}

/* Numbers */

exports.isNumber = num => (
	typeof num === 'number' && !Number.isNaN(num)
)

exports.isNumberString = str => (
	/^-?\d+(\.\d+)?$/.test(str)
)

exports.numerify = (obj) => {
	for (const key in obj) {
		if (exports.isNumberString(obj[key])) {
			obj[key] = parseFloat(obj[key])
		}
	}
	return obj
}

exports.int = num => (
	// This can be safely passed as arguments without fear of unexpected arguments
	parseInt(num)
)

exports.round = (num, decimals = 2) => (
	Math.round(num * (10 ** decimals)) / (10 ** decimals)
)

const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

exports.toBase = (num, chars = BASE62) => {
	const base = chars.length
	let str = ''
	while (num > 0) {
		const mod = num % base
		str = chars[mod] + str
		num = Math.floor(num / base)
	}
	return str
}

exports.fromBase = (str, chars = BASE62) => {
	const base = chars.length
	let num = 0
	for (let i = 0; i < str.length; i++) {
		num = (num * base) + chars.indexOf(str[i])
	}
	return num
}

/* Strings */

exports.icompare = (str, str2) => (
	str.toLowerCase() === str2.toLowerCase()
)

exports.truncate = (str, len) => (
	str.length <= len ? str : str.slice(0, len - 3) + '...'
)

exports.limitMessage = (str, len = 150) => (
	exports.truncate((str || '').replace(/\s+/g, ' '), len)
)

exports.errorMessage = err => (
	// Not perfect but remove the tech stuff when showing logs to people
	err.message.split(':').pop().trim()
)

exports.pad = (str, len, fill = '0') => {
	str += ''
	while (str.length < len) {
		str = fill + str
	}
	return str
}

exports.stringToBool = (state, def = false) => {
	switch (String(state).toLowerCase()) {
		case 'on':
		case 'true':
		case 'yes':
		case 'enable':
		case 'enabled':
		case 'allow':
		case 'allowed':
			return true
		case 'off':
		case 'false':
		case 'no':
		case 'disable':
		case 'disabled':
			return false
		default:
			return def
	}
}

/* Entities */

exports.display = item => (
	item ? `${item.name}(${item.username ? '@' + item.username : item.id})` : '-'
)

exports.minDisplay = item => (
	item ? `${item.username ? '@' + item.username : item.name}` : '-'
)

exports.extendUser = (user) => {
	// ChatMember item given, not a User
	if (user.user) {
		// Copy the status
		user.user.status = user.status
		user = user.user
	}
	// To avoid conflicts (since they are stored as bigint) we make all ids string
	user.id += ''
	// Make it consistent and DB friendly
	if (user.username === undefined) {
		user.username = null
	}
	user.name = user.name || user.first_name + (user.last_name ? ' ' + user.last_name : '')
	user.display = exports.display(user)
	return user
}

exports.extendChat = (chat) => {
	if ('first_name' in chat) {
		// Handle PMs, where the "chat" is the user
		return exports.extendUser(chat)
	}
	chat.id += ''
	// Make it consistent and DB friendly
	if (chat.username === undefined) {
		chat.username = null
	}
	chat.name = chat.name || chat.title || chat.username
	chat.display = exports.display(chat)
	return chat
}

exports.isChatId = id => (
	id < 0
)

exports.canonicalUsername = username => (
	username && username.replace('@', '').toLowerCase()
)

/* Promises */

exports.catch = promise => (
	promise && promise.catch((err) => {
		console.warn('Telegram bot> Warn:', err.message)
	})
)

exports.handle = fn => (
	(...args) => (
		exports.catch(fn(...args))
	)
)

exports.delay = ms => (
	// Like BlueBird delay(), Promise-based setTimeout
	new Promise((resolve) => {
		setTimeout(resolve, ms)
	})
)

exports.promise = () => {
	let methods = null
	// A method-based Promise instead of callback-based
	const promise = new Promise((resolve, reject) => {
		methods = { resolve, reject }
	})
	exports.copy(promise, methods)
	return promise
}

/* Objects */

exports.get = (scope, ...props) => {
	for (const prop of props) {
		if (!scope) {
			break
		}
		scope = scope[prop]
	}
	return scope
}

exports.set = (scope, ...props) => {
	const value = props.pop()
	while (props.length > 1) {
		const prop = props.shift()
		scope = scope[prop] = scope[prop] || {}
	}
	scope[props[0]] = value
}

exports.clean = (map) => {
	for (const key in map) {
		if (map[key] == null) {
			delete map[key]
		}
	}
	return map
}

exports.each = (map, fn) => {
	for (const key in map) {
		fn(map[key], key)
	}
	return map
}

exports.copy = (dest, src) => {
	for (const key in src) {
		dest[key] = src[key]
	}
	return dest
}

exports.empty = (obj) => {
	for (const key in obj) {
		return false
	}
	return true
}

exports.clone = src => (
	exports.copy({}, src)
)

exports.deepClone = src => (
	JSON.parse(JSON.stringify(src))
)

/* Arrays */

exports.displayList = (arr, numeric = false) => (
	arr
		.filter(item => !!item)
		.map((item, i) => `${numeric ? (i + 1) + '.' : '-'} ${item}`)
		.join('\n')
)

exports.unique = arr => (
	arr.filter((item, i) => arr.indexOf(item) === i)
)

exports.remove = (arr, item) => {
	const index = arr.indexOf(item)
	if (index !== -1) {
		arr.splice(index, 1)
	}
}

exports.pick = arr => (
	arr[Math.floor(Math.random() * arr.length)]
)

exports.flatten = arr => (
	arr.concat.apply([], arr)
)

exports.append = (arr, values) => {
	// This could be done with arr.push(...values) but breaks with 100K's values
	let i = arr.length
	for (const val of values) {
		arr[i++] = val
	}
}

exports.toArray = val => (
	val instanceof Array ? val : [val]
)

// Like lodash's pluck
exports.pluck = (arr, attr) => (
	arr.map(data => data[attr])
)

exports.mapify = (arr, attr = 'id') => {
	const map = {}
	for (const item of arr) {
		map[item[attr]] = item
	}
	return map
}

/* Dates */

exports.toISO = ts => (
	new Date(ts).toISOString()
)

/* Modules */

const modulesCache = {}

exports.getModules = (dir) => {
	if (!modulesCache[dir]) {
		modulesCache[dir] =	fs.readdirSync(`lib/${dir}`)
			.map((file) => {
				const mod = require(`../${dir}/${file}`)
				mod.id = file.replace('.js', '')
				if (!mod.order) {
					mod.order = Infinity
				}
				return mod
			})
			.sort((m1, m2) => (
				m1.order - m2.order
			))
	}
	return modulesCache[dir]
}
