"use strict";
const Notification = require("../models/Notification");


class NotificationService {
    // Kiểm tra và xử lý match giữa hai người dùng
    static addNotification = async ({ content, id_conversation, id_user }) => {
        const result = await Notification.insertOne({
            content: content,
            id_conversation: id_conversation,
            id_user: id_user,
          });
        
        return {
            status: "success",
            message: "Notification added successfully.",
            data: {
                result,
            },
        };
    };

}

module.exports = NotificationService