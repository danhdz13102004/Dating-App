const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

class MessageController {
  add = async (req, res, next) => {
    console.log(`[P]::Message_add::`, req.body);
    const { conversation, sender, content, createdAt, updatedAt } = req.body;
    const result = await Message.insertOne({
      conversation: conversation,
      sender: sender,
      content: content,
      status: "sent",
      createdAt: createdAt?createdAt: new Date().toISOString(),
      updatedAt: updatedAt?updatedAt: new Date().toISOString(),
    });

    const result_con = await Conversation.updateOne(
      {_id: conversation},
      {
        $set:{
          last_message:content
        }
      },
      {upsert: true}
    )

    console.log(`[P]::Message_add::Result::`, result);
    console.log(`[P]::Conversation_uppdate::Result::`, result_con);

    return res.status(201).json(result);
  };

  edit = async (req, res, next) => {
    try {
      console.log(`[P]::Message_edit::`, req.body);
      const { messageId, content, updatedAt, isLastMessage } = req.body;
      
      // Find and update the message
      const message = await Message.findByIdAndUpdate(
        {_id:messageId},
        { 
          content: content,
          updatedAt: updatedAt || new Date().toISOString(),
          isEdited: true,
        },
        { new: true }
      );
      
      if (!message) {
        return res.status(404).json({
          status: "error",
          message: "Message not found"
        });
      }
      
      // Update the conversation's last_message if this was the last message
      if (isLastMessage) {
        await Conversation.updateOne(
          { _id: message.conversation },
          { $set: { last_message: content } }
        );
      }
      
      console.log(`[P]::Message_edit::Result::`, message);
      
      return res.status(200).json({
        status: "success",
        data: message
      });
    } catch (error) {
      console.error(`[P]::Message_edit::Error::`, error);
      return res.status(500).json({
        status: "error",
        message: "Failed to edit message"
      });
    }
  };
  
  delete = async (req, res, next) => {
    try {
      console.log(`[P]::Message_delete::`, req.body);
      const { messageId, isLastMessage } = req.body;
      
      // Delete by update status to "deleted" the message
      const message = await Message.findByIdAndUpdate(
        {_id:messageId},
        { 
          isDeleted:true
        },
        { new: true }
      );
      
      if (!message) {
        return res.status(404).json({
          status: "error",
          message: "Message not found"
        });
      }
      
      const conversationId = message.conversation;
      // Check if this was the last message in the conversation
      if (isLastMessage) {
        await Conversation.updateOne(
          { _id: conversationId },
          { $set: { last_message: "Message was recalled" } }
        );
      }
      
      console.log(`[P]::Message_delete::Result:: Message deleted successfully`);
      
      return res.status(200).json({
        status: "success",
        message: "Message deleted successfully"
      });
    } catch (error) {
      console.error(`[P]::Message_delete::Error::`, error);
      return res.status(500).json({
        status: "error",
        message: "Failed to delete message"
      });
    }
  };
}

module.exports = new MessageController();
