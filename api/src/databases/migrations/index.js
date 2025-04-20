const mongoose = require('mongoose')
const User = require('../../models/User')
const Post = require('../../models/Post')
const Conversation = require('../../models/Conversation')
const Message = require('../../models/Message')
const Notification = require('../../models/Notification')

async function createIndexes() {
  console.log('Creating indexes...')

  await User.collection.createIndex({ email: 1 }, { unique: true })
  await User.collection.createIndex({ location: '2dsphere' })
  
  await Message.collection.createIndex({ conversation: 1 })
  await Message.collection.createIndex({ sender: 1 })
  
  await Conversation.collection.createIndex({ sender: 1, receiver: 1 })
  
  await Notification.collection.createIndex({ id_conversation: 1 })
  await Notification.collection.createIndex({ id_post: 1 })
  await Notification.collection.createIndex({ id_user: 1 })
  
  await Post.collection.createIndex({ user_id: 1 })
  
  console.log('Indexes created successfully')
}

// Chạy migrate
async function migrate() {
  try {
    console.log('Running migrations...')
    await createIndexes();
    console.log('All migrations completed successfully')
    return true
  } catch (error) {
    console.error('Migration failed:', error)
    return false
  }
}

module.exports = {
  migrate
};