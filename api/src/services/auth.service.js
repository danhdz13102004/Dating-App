'use strict'

const User = require("../models/User")
const { hashPassword } = require("../utils/bcrypt")
const crypto = require('crypto')
const HttpStatus = require("../core/httpStatus")
const { ConflictRequestError } = require("../core/error.response")

class AuthService {
  static register = async ({ name, email, password }) => {
    // Check email exists
    const emailExists = await User.findOne({ email }).lean()
    if (emailExists) {
      throw new ConflictRequestError('Email already exists')
    }

    // Creteate User & Add to database
    const hashedPassword = await hashPassword(password)
    const newUser = await User.create({ name, email, password: hashedPassword, birthday: new Date('2004-01-01') })

    // if (newUser) {
    //   const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    //     modulusLength: 4096,
    //   })
    //   console.log('publicKey', publicKey.export({ type: 'spki', format: 'pem' }))
    //   console.log('privateKey', privateKey.export({ type: 'pkcs8', format: 'pem' }))
    // }

    return {
      status: 'success',
      message: 'User registered successfully',
      data: {
        userId: newUser._id,
      }
    }
  }
}

module.exports = AuthService