"use strict";

const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const crypto = require("crypto");
const HttpStatus = require("../core/httpStatus");
const jwt = require("jsonwebtoken");

const {
  ConflictRequestError,
  NotFoundError,
} = require("../core/error.response");

class AuthService {
  static register = async ({ name, email, password }) => {
    // Check email exists
    const emailExists = await User.findOne({ email }).lean();
    if (emailExists) {
      throw new ConflictRequestError("Email already exists");
    }

    // Creteate User & Add to database
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      birthday: new Date("2004-01-01"),
    });

    // if (newUser) {
    //   const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    //     modulusLength: 4096,
    //   })
    //   console.log('publicKey', publicKey.export({ type: 'spki', format: 'pem' }))
    //   console.log('privateKey', privateKey.export({ type: 'pkcs8', format: 'pem' }))
    // }

    return {
      status: "success",
      message: "User registered successfully",
      data: {
        userId: newUser._id,
      },
    };
  };
  static login = async ({ email, password }) => {
    // Kiểm tra email có tồn tại trong cơ sở dữ liệu hay không
    const user = await User.findOne({ email }).lean();
    if (!user) {
      console.log("Email không tồn tại");
      throw new UnauthorizedError("Email không tồn tại");
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log("Mật khẩu không đúng");
      throw new UnauthorizedError("Mật khẩu không đúng");
    }

    // Tạo token JWT chỉ chứa userId
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return {
      status: "success",
      message: "Đăng nhập thành công",
      data: {
        token, // Token JWT
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    };
  };

  static updateUserHobbies = async ({ userId, hobbies, replace = true }) => {
    if (!Array.isArray(hobbies)) {
      throw new Error("Hobbies must be an array of strings");
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
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
      status: "success",
      message: "Hobbies updated successfully",
      data: {
        userId: user._id,
        hobbies: user.hobbies,
      },
    };
  };

  static updateUserGender = async ({ userId, gender }) => {
    if (!userId || !gender) {
      throw new Error("User ID and gender are required");
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { gender },
      { new: true } // Trả về document đã cập nhật
    );
    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }
    return {
      status: "success",
      message: "Update gender successfully",
      data: {
        userId: updatedUser._id,
        gender: gender,
      },
    };
  };
}

module.exports = AuthService;
