const { deepFreeze } = require("../utils/object");

const databaseConfig = Object.freeze({
  MONGO_HOST: process.env.MONGO_HOST || 'localhost',
  MONGO_PORT: process.env.MONGO_PORT || 27017,
  MONGO_DB: process.env.MONGO_DB || 'dating-app',
  MONGO_URI: process.env.MONGO_URI || null,
})

module.exports = databaseConfig