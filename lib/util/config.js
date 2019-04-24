const mode = process.env.NODE_ENV || 'development'
const prod = process.env.NODE_ENV === 'production'

// Can be either json or js
const config = require('../../config/' + mode)
config.mode = mode
config.development = !prod
config.production = prod

module.exports = config
