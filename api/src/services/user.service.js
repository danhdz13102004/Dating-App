"use strict";

const User = require("../models/User");
const HttpStatus = require("../core/httpStatus");
const { ConflictRequestError } = require("../core/error.response");
const Message = require("../models/Message");

class UserService {
  static update = async ({ userId, name, birthday, avatarURL }) => {
    console.log(userId, name, birthday, avatarURL);
    const filter = { _id: userId };

    const options = { upsert: true };

    const updateUser = {
      $set: {
        name: name,
        birthday: birthday,
        avatar: avatarURL,
      },
    };
    const result = await User.updateOne(filter, updateUser, options);

    return {
      status: "success",
      message: "User information updated successfully",
      data: {
        userId: result._id,
      },
    };
  };

  static getUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new ConflictRequestError({
        code: HttpStatus.NOT_FOUND,
        message: "User not found",
      });
    }
    return user;
  };

  static getMessages = async (conversationId) => {
    try {
      const messages = await Message.find({ conversation: conversationId })
        .populate("sender", "name avatar")
        .sort({ createdAt: -1 })
        .exec();

      return messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw new ConflictRequestError("Failed to fetch messages");
    }
  };
}

module.exports = UserService;
