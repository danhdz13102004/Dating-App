const { deepFreeze } = require("../utils/object");

const appConfig = Object.freeze({
  NAME: process.env.APP_NAME || 'Cupid Arrow',
  VERSION: process.env.APP_VERSION || '1.0.0',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_PREFIX: process.env.API_PREFIX || '/v1/api',
})

module.exports = appConfig