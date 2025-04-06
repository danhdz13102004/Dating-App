const database = require('./connection.db')
const { migrate } = require('./migrations')
const { seedAll } = require('./seeders')

async function initializeDatabase() {
  try {
    console.log('Initializing database...')
    
    await database.connect()
    
    // Chạy migrations
    const migrationResult = await migrate()
    if (!migrationResult) {
      throw new Error('Migration failed')
    }
    
    // Chạy seeders
    const seedingResult = await seedAll()
    if (!seedingResult) {
      throw new Error('Seeding failed')
    }
    
    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Database initialization failed:', error)
    return false
  } finally {
    await database.close()
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(result => {
      if (result) {
        console.log('Database setup completed successfully')
        process.exit(0)
      } else {
        console.error('Database setup failed')
        process.exit(1)
      }
    })
    .catch(err => {
      console.error('Unhandled error during database setup:', err)
      process.exit(1)
    })
}

module.exports = {
  initializeDatabase
};