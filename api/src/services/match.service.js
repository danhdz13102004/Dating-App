"use strict";

const { db } = require("../configs/firebase.config")
const { collection, serverTimestamp, addDoc } = require("firebase/firestore")

const User = require("../models/User");
const Conversation = require("../models/Conversation");
const { NotFoundError, ConflictRequestError } = require("../core/error.response");
const { calculateDistance } = require('../helpers/calculateDistance')
const mongoose = require('mongoose')

class MatchService {
  // Kiểm tra và xử lý match giữa hai người dùng
  static matchUser = async ({ currentUserId, targetUserId }) => {
    if (!currentUserId || !targetUserId) {
      throw new Error("Both currentUserId and targetUserId are required");
    }

    // Không thể tự match với chính mình
    if (currentUserId === targetUserId) {
      throw new ConflictRequestError("You cannot match with yourself.");
    }

    // Lấy thông tin người dùng hiện tại và người dùng mục tiêu
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      throw new NotFoundError("User not found.");
    }

    // Kiểm tra nếu currentUser đã like targetUser
    const hasLiked = currentUser.likedUsers.includes(targetUserId);

    // Kiểm tra nếu targetUser cũng đã like currentUser
    const isMatched = targetUser.likedUsers.includes(currentUserId);

    if (hasLiked && isMatched) {
      // Nếu cả hai đã like nhau, tạo một cuộc hội thoại (Conversation) nếu chưa tồn tại
      let conversation = await Conversation.findOne({
        $or: [
          { sender: currentUserId, receiver: targetUserId },
          { sender: targetUserId, receiver: currentUserId },
        ],
      });

      if (!conversation) {
        conversation = await Conversation.create({
          sender: currentUserId,
          receiver: targetUserId,
          status: "active",
        });
      }

      return {
        status: "success",
        message: "It's a match!",
        data: {
          conversation,
        },
      };
    } else {
      return {
        status: "success",
        message: "No match yet.",
        data: {
          isMatched: false,
        },
      };
    }
  };

  // Lấy danh sách những người dùng đã match với người dùng hiện tại
  static getMatchedUsers = async ({ currentUserId }) => {
    if (!currentUserId) {
      throw new Error("currentUserId is required");
    }

    // Lấy thông tin người dùng hiện tại
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundError("User not found.");
    }

    // Tìm những người đã like lại người dùng hiện tại
    const matchedUsers = await User.find({
      _id: { $in: currentUser.likedUsers }, // Những người dùng mà currentUser đã like
      likedUsers: currentUserId, // Và họ cũng đã like lại currentUser
    });

    return {
      status: "success",
      message: "Matched users retrieved successfully.",
      data: {
        matchedUsers,
      },
    };
  };

  // Thích một người dùng
  static likeUser = async ({ currentUserId, targetUserId }) => {
    if (!currentUserId || !targetUserId) {
      throw new Error("Both currentUserId and targetUserId are required");
    }

    // Không thể tự thích chính mình
    if (currentUserId === targetUserId) {
      throw new ConflictRequestError("You cannot like yourself.");
    }

    // Lấy thông tin người dùng hiện tại và người dùng mục tiêu từ cơ sở dữ liệu
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    // Kiểm tra nếu currentUser hoặc targetUser không tồn tại
    if (!currentUser) {
      throw new NotFoundError(`User with ID ${currentUserId} not found.`);
    }
    if (!targetUser) {
      throw new NotFoundError(`User with ID ${targetUserId} not found.`);
    }

    // Kiểm tra nếu Conversation đã tồn tại giữa hai người
    let conversation = await Conversation.findOne({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId },
      ],
    });

    if (!conversation) {
      // Tạo mới Conversation nếu chưa tồn tại
      conversation = await Conversation.create({
        sender: currentUserId,
        receiver: targetUserId,
        status: "pending",
        last_message: "",
      });
    }

    return {
      status: "success",
      message: "Conversation created successfully.",
      data: {
        conversation,
      },
    };
  };

  // Bỏ qua một người dùng
  static skipUser = async ({ currentUserId, targetUserId }) => {
    if (!currentUserId || !targetUserId) {
      throw new Error("Both currentUserId and targetUserId are required");
    }

    // Không thể tự bỏ qua chính mình
    if (currentUserId === targetUserId) {
      throw new ConflictRequestError("You cannot skip yourself.");
    }

    // Lấy thông tin người dùng hiện tại và người dùng mục tiêu từ cơ sở dữ liệu
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    // Kiểm tra nếu người dùng không tồn tại
    if (!currentUser) {
      throw new NotFoundError(`User with ID ${currentUserId} not found.`);
    }
    if (!targetUser) {
      throw new NotFoundError(`User with ID ${targetUserId} not found.`);
    }

    // Kiểm tra nếu skippedUsers không phải là mảng hợp lệ
    if (!Array.isArray(currentUser.skippedUsers)) {
      currentUser.skippedUsers = []; // Khởi tạo mảng nếu bị lỗi
    }

    // Thêm targetUser vào danh sách skippedUsers nếu chưa tồn tại
    if (!currentUser.skippedUsers.includes(targetUserId)) {
      currentUser.skippedUsers.push(targetUserId);
      await currentUser.save(); // Lưu lại thay đổi vào cơ sở dữ liệu
    }

    return {
      status: "success",
      message: "User skipped successfully.",
      data: {
        user: currentUser, // Trả về thông tin người dùng hiện tại
      },
    };
  };

  static getPotentialMatches = async (userId, page = 1, limit = 20, showSkipped = false) => {
    console.log(`[G]::getPotentialMatches::Request::`, { userId, page, limit, showSkipped })

    const currentUser = await User.findById(userId)

    if (!currentUser) {
      throw new NotFoundError("User not found.")
    }

    // Kiểm tra xem currentUser đã tạo conversation chưa
    const conversations = await Conversation.find({
      $or: [
        { sender: userId, status: { $in: ['active', 'pending'] } },
        { receiver: userId, status: { $in: ['active', 'pending'] } },
      ]
    })

    const excludeUserIds = conversations.map(conversation => {
      return conversation.sender.toString() === userId.toString() ? conversation.receiver : conversation.sender
    })

    const now = new Date()
    const minAge = currentUser.preference.minAge
    const maxAge = currentUser.preference.maxAge
    const currentYear = now.getFullYear()

    // Dựa vào ngày sinh để xem có nằm trong minAge, maxAge không
    const maxBirthday = new Date(currentYear - minAge, now.getMonth(), now.getDate())
    const minBirthday = new Date(currentYear - maxAge, now.getMonth(), now.getDate())

    const genderFilter = currentUser.preference.gender !== 'any'
      ? { gender: currentUser.preference.gender }
      : {}

    const hobbiesFilter = currentUser.hobbies.length > 0
      ? { hobbies: { $in: currentUser.hobbies } }
      : {}

    const offset = (page - 1) * limit

    let matchQuery;

    if (showSkipped === 'true' || showSkipped === true) {
      // Nếu showSkipped = true, chỉ lấy những user trong skippedUsers
      matchQuery = {
        _id: {
          $ne: currentUser._id,
          $in: currentUser.skippedUsers,  // Chỉ lấy người dùng đã skip
          $nin: [...excludeUserIds]       // Loại bỏ người đã có conversation
        },
        birthday: {
          $gte: minBirthday,
          $lte: maxBirthday
        },
        ...genderFilter,
        ...hobbiesFilter
      }
    } else {
      // Nếu showSkipped = false, loại bỏ những user đã skip
      matchQuery = {
        _id: {
          $ne: currentUser._id,
          $nin: [...currentUser.skippedUsers, ...excludeUserIds]
        },
        birthday: {
          $gte: minBirthday,
          $lte: maxBirthday
        },
        ...genderFilter,
        ...hobbiesFilter
      }
    }

    // Đếm tổng số potential matches trước
    // Lưu ý: Không thể dùng countDocuments với $geoNear nên phải chạy thêm aggregation
    const countPipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: currentUser.location.coordinates
          },
          distanceField: 'calculatedDistance',
          maxDistance: currentUser.preference.maxDistance * 1000, // km -> m
          query: matchQuery,
          spherical: true
        }
      },
      { $count: "total" }
    ]

    const countResult = await User.aggregate(countPipeline)
    const totalCount = countResult.length > 0 ? countResult[0].total : 0

    // Lấy potential matches với pagination
    const matchesPipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: currentUser.location.coordinates
          },
          distanceField: 'calculatedDistance',
          maxDistance: currentUser.preference.maxDistance * 1000, // km -> m
          query: matchQuery,
          spherical: true
        }
      },
      { $skip: offset },
      { $limit: limit },
      {
        $project: {
          password: 0,
          skippedUsers: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0
        }
      }
    ]

    const potentialMatches = await User.aggregate(matchesPipeline)

    // Format khoảng cách cho mỗi potential match
    const matchesWithDistance = potentialMatches.map(user => {
      // calculatedDistance là trường được tạo ra bởi $geoNear, đơn vị là m
      const distanceInKm = user.calculatedDistance / 1000

      return {
        ...user,
        distance: `${Math.round(distanceInKm)}`, // đơn vị: km
        calculatedDistance: undefined // loại bỏ trường calculatedDistance
      }
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      status: "success",
      data: matchesWithDistance,
      metadata: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      }
    }
  }

  static updatePreferences = async (userId, preferences) => {
    console.log(`[P]::updatePreferences::Request::`, { userId, preferences })

    const currentUser = await User.findById(userId)
    if (!currentUser) {
      throw new NotFoundError("User not found.")
    }

    // Xác định các thuộc tính preferences để cập nhật
    currentUser.preference.gender = preferences.gender || currentUser.preference.gender
    currentUser.preference.maxDistance = preferences.maxDistance || currentUser.preference.maxDistance
    currentUser.preference.minAge = preferences.minAge || currentUser.preference.minAge
    currentUser.preference.maxAge = preferences.maxAge || currentUser.preference.maxAge

    // Kiểm tra khoảng tuổi hợp lệ
    if (currentUser.preference.minAge > currentUser.preference.maxAge) {
      throw new ConflictRequestError("Minimum age cannot be greater than maximum age.")
    }

    await currentUser.save()

    return {
      status: "success",
      message: "User preferences updated successfully.",
      data: {
        preference: currentUser.preference
      }
    }
  }

  static getPreferences = async (userId) => {
    console.log(`[P]::getPreferences::Request::`, { userId })

    const currentUser = await User.findById(userId)
    if (!currentUser) {
      throw new NotFoundError("User not found.")
    }

    return {
      status: "success",
      message: "User preferences retrieved successfully.",
      data: {
        preference: currentUser.preference
      }
    }
  }

  static notifyMatchUser = async ({ currentUserId, targetUserId }) => {
    if (!currentUserId || !targetUserId) {
      throw new Error("Both currentUserId and targetUserId are required");
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);


    const requestedMatchesSubcollectionRef = collection(
      db,
      `acceptedMatches/${targetUser.id}/acceptedMatches`,
    );

    const newRequestedmatch = {
      content: `${currentUser.name} has sent a match to you`,
      id_user: targetUser.id,
      createdAt: serverTimestamp(),
      sender: {
        _id: currentUser.id,
        avatar: currentUser.avatar,
      }
    };

    await addDoc(requestedMatchesSubcollectionRef, newRequestedmatch);

    return {
      status: "success",
      message: "Match request added to firebase successfully.",
      data: {
        newRequestedmatch,
      },
    };

  };
}

module.exports = MatchService