"use strict";

const ConversationService = require("../services/conversation.service");

class ConversationController {
    // Đổi trạng thái thành "success"
    static async markAsSuccess(req, res) {
        const { conversationId } = req.params;
        const result = await ConversationService.updateConversationStatus({
            conversationId,
            status: "active", // Đổi trạng thái thành "success"
        });
        res.status(200).json(result);
    }

    // Đổi trạng thái thành "deleted"
    static async deleteConversation(req, res) {
        const { conversationId } = req.params;
        const result = await ConversationService.updateConversationStatus({
            conversationId,
            status: "deleted", // Đổi trạng thái thành "success"
        });
        res.status(200).json(result);
    }
}

module.exports = ConversationController;