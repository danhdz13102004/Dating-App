const UserService = require("../services/user.service");
const Notification = require("../models/Notification");

class UserController {
  update = async (req, res, next) => {
    console.log(`[P]::User_Update::`, req.body);
    const { userId, name, birthday, avatarURL } = req.body;
    const result = await UserService.update({ userId, name, birthday, avatarURL });

    console.log(`[P]::User_Update::Result::`, result);

    return res.status(201).json(result);
  };

  // Function to get notifications by id_user
  getNotifications = async (req, res, next) => {
    try {
      console.log(`[P]::Get_Notifications::Request::`, req.params);
      console.log('User ID:', req.params.userId);
      const  id_user  = req.params.userId;

      console.log(`[P]::Get_Notifications::UserId::`, id_user);

      // Fetch notifications for the user
      const notifications = await Notification.find({ id_user: id_user })
        .sort({ createdAt: -1 }) // Sort by most recent
        .exec();

      console.log(`[P]::Get_Notifications::Result::`, notifications);

      return res.status(200).json({ status: "success", data: notifications });
    } catch (error) {
      console.error(`[P]::Get_Notifications::Error::`, error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  };

  // Function to get messages by id_conversation
  getMessages = async (req, res, next) => {
    try {
      console.log(`[P]::Get_Messages::Request::`, req.params);
      const { conversationId } = req.params;

      console.log(`[P]::Get_Messages::ConversationId::`, conversationId);

      // Fetch messages for the conversation
      const messages = await UserService.getMessages(conversationId);

      console.log(`[P]::Get_Messages::Result::`, messages);

      return res.status(200).json({ status: "success", data: messages });
    } catch (error) {
      console.error(`[P]::Get_Messages::Error::`, error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  };

}

module.exports = new UserController();