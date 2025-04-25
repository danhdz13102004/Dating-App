const UserService = require("../services/user.service");
const PostService = require("../services/post.service");
const Notification = require("../models/Notification");
const Conversation = require("../models/Conversation");

class UserController {
  update = async (req, res, next) => {
    console.log(`[P]::User_Update::`, req.body);
    const { userId, name, birthday, avatarURL } = req.body;
    const result = await UserService.update({
      userId,
      name,
      birthday,
      avatarURL,
    });

    console.log(`[P]::User_Update::Result::`, result);

    return res.status(201).json(result);
  };

  // Function to get conversations by userId
  getConversations = async (req, res, next) => {
    try {
      console.log(`[P]::Get_conversations::Request::`, req.params);
      console.log("User ID:", req.params.userId);
      const userId = req.params.userId;

      console.log(`[P]::Get_conversations::UserId::`, userId);

      // Fetch conversations for the user
      const conversations = await Conversation.find({
          $or: [{ sender: userId }, { receiver: userId }],
          status: 'active' // Add condition for status to be 'active'
        })
        .populate('sender', 'name avatar') // Populate sender's name and avatar
        .populate('receiver', 'name avatar')
        .sort({ updatedAt: -1 }) // Sort by most recent conversations
        .exec();

      // Enhance conversations with partner's newest image post
      const enhancedConversations = await Promise.all(conversations.map(async (conversation) => {
        // Determine who is the partner
        const partnerId = conversation.sender._id.toString() === userId 
          ? conversation.receiver._id.toString() 
          : conversation.sender._id.toString();
        
        // Get partner's newest image post (from last 24h only)
        const newestPost = await PostService.getNewestImagePostByUserId(partnerId);
        
        // Convert mongoose document to plain object
        const conversationObj = conversation.toObject();
        
        // Add newest post image to conversation object
        if (newestPost) {
          conversationObj.imagePost = newestPost.images;
          conversationObj.hasStory = true; // Flag to indicate this is a fresh image
        } else {
          conversationObj.hasStory = false;
        }
        
        return conversationObj;
      }));

      console.log(`[P]::Get_conversations::Result::`, enhancedConversations);

      return res.status(200).json({ status: "success", data: enhancedConversations });
    } catch (error) {
      console.error(`[P]::Get_conversations::Error::`, error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  };

  // Function to get notifications by id_user
  getNotifications = async (req, res, next) => {
    try {
      console.log(`[P]::Get_Notifications::Request::`, req.params);
      console.log("User ID:", req.params.userId);
      const id_user = req.params.userId;

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
  
      const messages = await UserService.getMessages(conversationId);
      // messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
      console.log(`[P]::Get_Messages::Result::`, messages);
  
      return res.status(200).json({ status: "success", data: messages });
    } catch (error) {
      console.error(`[P]::Get_Messages::Error::`, error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  };

  checkUserInfoCompletion = async (req, res, next) => {
    try {
      const { userId } = req.params;
      console.log("[P]::User_Check_User_Info_Completion::", userId);

      const user = await UserService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isCompleted =
        user.name && user.birthday && user.gender && user.hobbies;

      console.log("[P]::IsCompleted::", isCompleted);
      return res.status(200).json({
        status: "Success, Information is completed",
        data: { isCompleted },
      });
    } catch (e) {
      console.log(`[P]::User_Check_User_Info_Completion::Error::`, e);
      return res.status(500).json({ message: e.message });
    }
  };
  updateLocation = async (req, res, next) => {
    try {
      const { userId, location } = req.body;
      console.log(`[P]::Update_Location::`, { userId, location });

      // Gọi service để cập nhật vị trí
      const result = await UserService.updateLocation({ userId, location });

      console.log(`[P]::Update_Location::Result::`, result);

      return res.status(200).json({
        status: "success",
        message: "Location updated successfully",
        data: result,
      });
    } catch (error) {
      console.error(`[P]::Update_Location::Error::`, error);
      return res.status(500).json({
        error: { code: 500, status: "error" },
        message: error.message,
      });
    }
  };

  getProfile = async (req, res, next) => {
    try {
      const { userId } = req.params;
      console.log(`[P]::Get_Profile::`, userId);

      // Gọi service để lấy thông tin người dùng
      const user = await UserService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      console.log(`[P]::Get_Profile::Result::`, user);

      return res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      console.error(`[P]::Get_Profile::Error::`, error);
      return res.status(500).json({
        error: { code: 500, status: "error" },
        message: error.message,
      });
    }
  };
}

module.exports = new UserController();
