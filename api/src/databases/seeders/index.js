const mongoose = require('mongoose')
const bcrypt = require('../../utils/bcrypt')
const User = require('../../models/User')
const Post = require('../../models/Post')
const Conversation = require('../../models/Conversation')
const Message = require('../../models/Message')
const Notification = require('../../models/Notification')

async function seedUsers() {
  try {
    console.log('Seeding users...')
    
    await User.deleteMany({})
    
    const hashedPassword = await bcrypt.hashPassword('password123')
    
    const users = [
      {
        name: 'Puck luv Perfume',
        email: 'nguyenhuuphuc@gmail.com',
        password: hashedPassword,
        birthday: new Date('2004-05-22'),
        location: {
          type: 'Point',
          coordinates: [105.8342, 21.0278]
        },
        hobbies: ['đọc sách', 'du lịch', 'chơi game'],
        avatar: '',
        profileImgs: [],
        description: 'Tôi là 1 lập trình viên biết sử dụng chat GPT.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 30,
          minAge: 20,
          maxAge: 30
        }
      },
      {
        name: 'Cupid Arrow',
        email: 'cupidarrow@gmail.com',
        password: hashedPassword,
        birthday: new Date('2004-08-22'),
        location: {
          type: 'Point',
          coordinates: [105.8342, 21.0278]
        },
        hobbies: ['nấu ăn', 'yoga', 'xem phim'],
        avatar: '',
        profileImgs: [],
        description: 'Yêu thiên nhiên và động vật.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 25,
          minAge: 22,
          maxAge: 35
        }
      },
      {
        name: 'Ngô Văn Danh',
        email: 'zzdanhdz@gmail.com',
        password: hashedPassword,
        birthday: new Date('2004-10-22'),
        location: {
          type: 'Point',
          coordinates: [105.8342, 21.0278]
        },
        hobbies: ['đá bóng', 'xem phim'],
        avatar: '',
        profileImgs: [],
        description: 'Yêu thiên nhiên và động vật.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 25,
          minAge: 22,
          maxAge: 35
        }
      }
    ]
    
    await User.insertMany(users)
    
    console.log('Users seeded successfully')
    return await User.find()
  } catch (error) {
    console.error('User seeding failed:', error)
    throw error
  }
}

async function seedPosts(users) {
  try {
    console.log('Seeding posts...')
    
    await Post.deleteMany({})
    
    const posts = [
      {
        title: 'Chuyến du lịch Đà Lạt',
        user_id: users[0]._id,
        images: [],
        reactions: [users[1]._id]
      },
      {
        title: 'Món ăn ngon cuối tuần',
        user_id: users[1]._id,
        images: [],
        reactions: [users[0]._id, users[2]._id]
      },
      {
        title: 'Buổi tối ở Sài Gòn',
        user_id: users[2]._id,
        images: [],
        reactions: [users[1]._id]
      }
    ]
    
    await Post.insertMany(posts)
    
    console.log('Posts seeded successfully')
    return await Post.find()
  } catch (error) {
    console.error('Post seeding failed:', error)
    throw error
  }
}

async function seedConversations(users) {
  try {
    console.log('Seeding conversations...')
    
    await Conversation.deleteMany({})
    
    const conversations = [
      {
        sender: users[0]._id,
        receiver: users[1]._id,
        status: 'active',
        last_message: 'Em ăn cơm chưa?'
      },
      {
        sender: users[1]._id,
        receiver: users[2]._id,
        status: 'active',
        last_message: 'Chào bạn, rất vui được làm quen.'
      }
    ]
    
    await Conversation.insertMany(conversations)
    
    console.log('Conversations seeded successfully')
    return await Conversation.find()
  } catch (error) {
    console.error('Conversation seeding failed:', error)
    throw error
  }
}

async function seedMessages(users, conversations) {
  try {
    console.log('Seeding messages...')
    
    await Message.deleteMany({})
    
    const messages = [
      {
        conversation: conversations[0]._id,
        sender: users[0]._id,
        content: 'Chào bạn, mình thấy bạn có vẻ thú vị.',
        status: 'read'
      },
      {
        conversation: conversations[0]._id,
        sender: users[1]._id,
        content: 'Cảm ơn bạn. Mình cũng thấy bạn có nhiều sở thích hay.',
        status: 'read'
      },
      {
        conversation: conversations[0]._id,
        sender: users[0]._id,
        content: 'Bạn đang làm gì thế?',
        status: 'delivered'
      },
      {
        conversation: conversations[1]._id,
        sender: users[1]._id,
        content: 'Chào bạn, rất vui được làm quen.',
        status: 'sent'
      }
    ]
    
    await Message.insertMany(messages)
    
    console.log('Messages seeded successfully')
    return await Message.find()
  } catch (error) {
    console.error('Message seeding failed:', error)
    throw error
  }
}

async function seedNotifications(users, conversations, posts) {
  try {
    console.log('Seeding notifications...')
    
    await Notification.deleteMany({})
    
    const notifications = [
      {
        content: 'Bạn có tin nhắn mới',
        id_conversation: conversations[0]._id,
        is_read: false
      },
      {
        content: 'Có user đã thích bài viết của bạn',
        id_post: posts[1]._id,
        is_read: true
      }
    ]
    
    await Notification.insertMany(notifications)
    
    console.log('Notifications seeded successfully')
  } catch (error) {
    console.error('Notification seeding failed:', error)
    throw error
  }
}

async function seedAll() {
  try {
    console.log('Running all seeders...')
    const users = await seedUsers()
    const posts = await seedPosts(users)
    const conversations = await seedConversations(users)
    await seedMessages(users, conversations)
    await seedNotifications(users, conversations, posts)
    console.log('All data seeded successfully')
    return true
  } catch (error) {
    console.error('Seeding failed:', error)
    return false
  }
}

module.exports = {
  seedAll
}