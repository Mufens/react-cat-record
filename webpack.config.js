const path = require('path')
const env = process.env.NODE_ENV

if (env === 'development') {
  module.exports = require('./webpack/webpack.dev.js')
} else {
  module.exports = require('./webpack/webpack.prod.js')
}
