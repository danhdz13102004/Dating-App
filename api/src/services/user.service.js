'use strict'

const User = require("../models/User")
const HttpStatus = require("../core/httpStatus")
const { ConflictRequestError } = require("../core/error.response")

class UserService {
  static update = async ({ userId, name, birthday, avaURL }) => {
    
    const filter = { email: email };
    
    const options = { upsert: true };

    const updateUser = {
        $set: {
            userId: userId,
            name: name,
            birthday: birthday,
            avatar:avaURL
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

module.exports = AuthService