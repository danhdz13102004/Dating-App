"use strict";

const User = require("../models/User");
const Conversation = require("../models/Conversation");
const { NotFoundError, ConflictRequestError } = require("../core/error.response");

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
}

module.exports = MatchService;