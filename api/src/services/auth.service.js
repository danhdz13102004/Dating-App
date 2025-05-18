"use strict";

const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const crypto = require("crypto");
const HttpStatus = require("../core/httpStatus");
const jwt = require("jsonwebtoken");
const {
  ConflictRequestError,
  NotFoundError,
  UnauthorizedError,
  AppError,
  BadRequestError,
  ForbiddenError,
} = require("../core/error.response");
const { error } = require("console");

class AuthService {
  static register = async ({ name, email, password }) => {
    // Check email exists
    const emailExists = await User.findOne({ email }).lean();
    if (emailExists) {
      throw new ConflictRequestError("Email đã tồn tại!. Vui lòng thử lại.");
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
      throw new UnauthorizedError("Email không tồn tại. Vui lòng kiểm tra lại.");
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log("Mật khẩu không đúng");
      throw new UnauthorizedError("Sai mật khẩu. Vui lòng nhập lại.");
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

  static changePassword = async ({ userId, currentPassword, newPassword }) => {
    if (!userId || !currentPassword || !newPassword) {
      throw new Error(
        "User ID, current password and new password are required"
      );
    }

    // Tìm user theo ID
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await hashPassword(newPassword);

    // Cập nhật mật khẩu mới
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    return {
      status: "success",
      message: "Password changed successfully",
    };
  };

  static loginWithFacebook = async ({ code, redirectUri }) => {
    console.log('Received code:', code)
    console.log('Received redirectUri:', redirectUri)
    
    // Validate the code and redirectUri
    if (!code || !redirectUri) {
      throw new BadRequestError("Code and redirectUri are required")
    }    // Call Facebook API to exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: redirectUri,
        code,
      })
    console.log('tokenUrl: ', tokenUrl)

    const tokenResponse = await fetch(
      tokenUrl,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },      }
    )
    
    if (!tokenResponse.ok) {
      const errorResponse = await tokenResponse.json().catch(() => ({}));
      console.error('Facebook token error:', errorResponse);
      throw new AppError(
        `Failed to get access token from Facebook: ${errorResponse.error?.message || tokenResponse.statusText}`, 
        HttpStatus.BAD_GATEWAY.code
      );
    }

    const tokenData = await tokenResponse.json()
    const { access_token } = tokenData
    
    console.log('Successfully obtained Facebook access token');

    // Use the access token to get user info
    const userUrl = `https://graph.facebook.com/me?` +
      new URLSearchParams({
        fields: 'id,name,email,picture',
        access_token,
      })
    console.log('userUrl: ', userUrl)

    const userResponse = await fetch(
      userUrl, 
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }    )

    if (!userResponse.ok) {
      const errorInfo = await userResponse.json().catch(() => ({}));
      console.error('Facebook user info error:', errorInfo);
      throw new AppError(
        `Failed to get user info from Facebook: ${errorInfo.error?.message || userResponse.statusText}`, 
        HttpStatus.BAD_GATEWAY.code
      );
    }    const facebookUser = await userResponse.json()
    
    console.log('Facebook user info received:', {
      id: facebookUser.id,
      name: facebookUser.name,
      email: facebookUser.email,
      picture: facebookUser.picture?.data?.url ? 'Available' : 'Not available'
    });
    
    // Verify we have an email - this is required
    if (!facebookUser.email) {
      throw new BadRequestError('Facebook did not provide an email address. Please check your Facebook privacy settings.');
    }

    // Tìm hoặc tạo user trong database
    let user = await User.findOne({ email: facebookUser.email })
    if (!user) {
      user = await User.create({
        name: facebookUser.name,
        email: facebookUser.email,
        avatar: facebookUser.picture?.data?.url || 'https://sbcf.fr/wp-content/uploads/2018/03/sbcf-default-avatar.png',
        birthday: new Date('1990-01-01'),
        password: null,
      })
    } else {
      console.log('User already exists:', user.email)
    }

    // Tạo JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    })

    return {
      status: 'success',
      message: 'Đăng nhập bằng Facebook thành công',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    }
  }
}

module.exports = AuthService;
