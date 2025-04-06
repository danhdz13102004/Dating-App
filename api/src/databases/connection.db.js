'use strict';
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

class Database {
  constructor() {
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/dating-app'
    this.connection = null
  }

  async connect() {
    if (this.connection && mongoose.connection.readyState === 1) {
      return this.connection
    }

    try {
      await mongoose.connect(this.connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 30,
      })

      this.connection = mongoose.connection

      this.connection.on('disconnected', () => {
        console.warn('Database disconnected, attempting to reconnect...');
        this.connect()
      })

      this.connection.on('error', (err) => {
        console.error('Database connection error:', err)
      });

      console.log('Database connection successful')
      return this.connection;
    } catch (err) {
      console.error('Failed to connect to database:', err)
      setTimeout(() => this.connect(), 5000)
      throw err
    }
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  async close() {
    if (this.connection) {
      await this.connection.close()
      console.log('Database connection closed')
      this.connection = null
    }
  }

  countConnections() {
    return mongoose.connections.length
  }

  getConnection() {
    return this.connection
  }
}

module.exports = Database.getInstance()