"use strict";

const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { NotFoundError, ConflictRequestError } = require("../core/error.response");

class ConversationService {
    // Tạo mới một cuộc hội thoại
    static createConversation = async ({ senderId, receiverId, initialMessage }) => {
        // Kiểm tra xem cả người gửi và người nhận có tồn tại không
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            throw new NotFoundError("Không tìm thấy người gửi hoặc người nhận");
        }

        // Kiểm tra xem cuộc hội thoại giữa hai người đã tồn tại chưa
        const existingConversation = await Conversation.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId },
            ],
        });

        if (existingConversation) {
            throw new ConflictRequestError("Cuộc hội thoại đã tồn tại");
        }

        // Tạo một cuộc hội thoại mới
        const newConversation = await Conversation.create({
            sender: senderId,
            receiver: receiverId,
            last_message: initialMessage || "", // Tin nhắn đầu tiên (nếu có)
            status: "pending", // Trạng thái mặc định là "pending"
        });

        return {
            status: "success",
            message: "Tạo cuộc hội thoại thành công",
            data: newConversation,
        };
    };

    // Lấy danh sách các cuộc hội thoại của một người dùng
    static getUserConversations = async ({ userId }) => {
        const conversations = await Conversation.find({
            $or: [{ sender: userId }, { receiver: userId }],
            status: { $ne: "deleted" }, // Loại trừ các cuộc hội thoại đã bị xóa
        })
            .populate("sender", "name email") // Hiển thị thông tin của người gửi
            .populate("receiver", "name email") // Hiển thị thông tin của người nhận
            .sort({ updatedAt: -1 }); // Sắp xếp theo thời gian cập nhật mới nhất

        return {
            status: "success",
            message: "Lấy danh sách cuộc hội thoại thành công",
            data: conversations,
        };
    };

    // Cập nhật trạng thái của cuộc hội thoại
    static updateConversationStatus = async ({ conversationId, status }) => {
        if (!["active", "pending", "deleted"].includes(status)) {
            throw new Error("Trạng thái không hợp lệ");
        }

        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { status }, // Trạng thái mới (active, pending, deleted)
            { new: true } // Trả về dữ liệu sau khi cập nhật
        );

        if (!updatedConversation) {
            throw new NotFoundError("Không tìm thấy cuộc hội thoại");
        }

        return {
            status: "success",
            message: "Cập nhật trạng thái cuộc hội thoại thành công",
            data: updatedConversation,
        };
    };

    // Cập nhật tin nhắn cuối trong cuộc hội thoại
    static updateLastMessage = async ({ conversationId, lastMessage }) => {
        const updatedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { last_message: lastMessage }, // Tin nhắn cuối cùng
            { new: true } // Trả về dữ liệu sau khi cập nhật
        );

        if (!updatedConversation) {
            throw new NotFoundError("Không tìm thấy cuộc hội thoại");
        }

        return {
            status: "success",
            message: "Cập nhật tin nhắn cuối thành công",
            data: updatedConversation,
        };
    };

    // Xóa một cuộc hội thoại
    static deleteConversation = async ({ conversationId }) => {
        const deletedConversation = await Conversation.findByIdAndUpdate(
            conversationId,
            { status: "deleted" }, // Thay đổi trạng thái thành "deleted"
            { new: true } // Trả về dữ liệu sau khi cập nhật
        );

        if (!deletedConversation) {
            throw new NotFoundError("Không tìm thấy cuộc hội thoại");
        }

        return {
            status: "success",
            message: "Xóa cuộc hội thoại thành công",
            data: deletedConversation,
        };
    };

    static getMatchRequests = async ({ userId }) => {
        const matchRequests = await Conversation.find({
            receiver: userId,
            status: "pending",
        })
            .populate("sender", "name email birthday avatar ")
            .populate("receiver", "name email")
            .sort({ updatedAt: -1 });
    
        if (!matchRequests || matchRequests.length === 0) {
            throw new NotFoundError("Không có lời mời match nào");
        }
    
        // Hàm tính tuổi
        const calculateAge = (birthday) => {
            const today = new Date();
            const birthDate = new Date(birthday);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };
    
        // Chuyển đổi kết quả và thêm trường age vào sender
        const formattedMatchRequests = matchRequests.map((match) => {
            const sender = match.sender?.toObject?.() || match.sender;
            const receiver = match.receiver?.toObject?.() || match.receiver;
    
            const age = sender?.birthday ? calculateAge(sender.birthday) : null;
    
            return {
                ...match.toObject(),
                sender: {
                    ...sender,
                    age,
                },
                receiver,
            };
        });
    
        return {
            status: "success",
            message: "Lấy danh sách lời mời match thành công",
            data: formattedMatchRequests,
        };
    };
    

}

module.exports = ConversationService;