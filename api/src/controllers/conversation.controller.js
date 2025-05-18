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

    static getMatchRequests = async (req, res) => {
        const  userId  = req.params.id; // userId từ middleware xác thực (authentication)
        const result = await ConversationService.getMatchRequests({ userId });
        res.status(200).json(result);
    };
    
    // Block a user in conversation
    static blockUser = async (req, res) => {
        try {
            const { conversationId } = req.params;
            const { blocked_by } = req.body;
            
            if (!blocked_by) {
                return res.status(400).json({
                    status: "error",
                    message: "Missing required field: blocked_by",
                });
            }

            const result = await ConversationService.blockConversation({
                conversationId,
                blockedBy: blocked_by,
            });

            res.status(200).json(result);
        } catch (error) {
            console.error("Error blocking user:", error);
            res.status(500).json({
                status: "error",
                message: error.message || "Failed to block user",
            });
        }
    };
    
    // Unblock a user in conversation
    static unblockUser = async (req, res) => {
        try {
            const { conversationId } = req.params;
            
            const result = await ConversationService.unblockConversation({
                conversationId,
            });

            res.status(200).json(result);
        } catch (error) {
            console.error("Error unblocking user:", error);
            res.status(500).json({
                status: "error",
                message: error.message || "Failed to unblock user",
            });
        }
    };
    
    // Get conversation by ID
    static getConversationById = async (req, res) => {
        try {
            console.log("Getting conversation by ID");
            const { conversationId } = req.params;
            const result = await ConversationService.getConversationById({
                conversationId,
            });
            
            res.status(200).json(result);
        } catch (error) {
            console.error("Error getting conversation:", error);
            res.status(500).json({
                status: "error",
                message: error.message || "Failed to get conversation",
            });
        }
    };
}

module.exports = ConversationController;