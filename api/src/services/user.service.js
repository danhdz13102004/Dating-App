'use strict'

const User = require("../models/User")
const HttpStatus = require("../core/httpStatus")
const { ConflictRequestError } = require("../core/error.response")

class UserService {
  static update = async ({ userId, name, birthday, avatarURL }) => {
    console.log(userId, name, birthday, avatarURL )
    const filter = { _id: userId };
    
    const options = { upsert: true };

    const updateUser = {
        $set: {
          name: name,
          birthday: birthday,
          avatar:avatarURL
        },
    };
    const result = await User.updateOne(filter, updateUser, options)
    

    return {
      status: 'success',
      message: 'User information updated successfully',
      data: {
        userId: result._id,
      }
    }
  }
}

module.exports = UserService