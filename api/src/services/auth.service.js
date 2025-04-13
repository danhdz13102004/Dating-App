'use strict'

const User = require("../models/User")
const { hashPassword } = require("../utils/bcrypt")
const crypto = require('crypto')
const HttpStatus = require("../core/httpStatus")
const { ConflictRequestError, NotFoundError } = require("../core/error.response")

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

  static updateUserHobbies = async ({ userId, hobbies, replace = true }) => {
    if (!Array.isArray(hobbies)) {
      throw new Error('Hobbies must be an array of strings');
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update hobbies based on replace parameter
    if (replace) {
      // Replace all existing hobbies
      user.hobbies = hobbies;
    } else {
      // Append new hobbies without duplicates
      const uniqueHobbies = new Set([...user.hobbies, ...hobbies]);
      user.hobbies = Array.from(uniqueHobbies);
    }

    // Save the updated user
    await user.save();

    return {
      status: 'success',
      message: 'Hobbies updated successfully',
      data: {
        userId: user._id,
        hobbies: user.hobbies
      }
    };
  }


}

module.exports = AuthService