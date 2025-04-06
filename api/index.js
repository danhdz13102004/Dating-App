const app = require('./src/app')
const database = require('./src/databases/connection.db')
const dotenv = require('dotenv')

dotenv.config()

const PORT = process.env.PORT || 3055

async function startServer() {
  let server
  try {
    await database.connect()
    server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
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