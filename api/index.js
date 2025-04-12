'use strict'
const path = require('path')
const envPath = path.resolve(__dirname, '../.env')
console.log('[DEBUG] Env Path:', envPath)
require('dotenv').config({ path: envPath })

const appConfig = require('./src/configs/app.config')
const database = require('./src/databases/connection.db')
const app = require('./src/app')

async function startServer() {
  try {
    await database.connect()

    const server = app.listen(appConfig.PORT, () => {
      console.log(`Server is running on port ${appConfig.PORT}`)
    })

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down...')
      server.close(async () => {
        try {
          await database.close()
          console.log('Server closed')
          process.exit(0)
        } catch (err) {
          console.error('Error closing database:', err)
          process.exit(1)
        }
      })
      setTimeout(() => {
        console.error('Force shutdown due to timeout')
        process.exit(1)
      }, 10000)
    })

    const shutdown = (err) => {
      console.error(err)
      server.close(async () => {
        await database.close()
        process.exit(1)
      })
    };

    process.on('uncaughtException', shutdown)
    process.on('unhandledRejection', shutdown)
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

startServer()