const UserService = require("../services/user.service");
const PostService = require("../services/post.service");
const Notification = require("../models/Notification");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

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

        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: partnerId, // chỉ tính tin từ đối phương
          status: { $ne: 'read' }
        });

        // Add newest post image to conversation object
        if (newestPost) {
          conversationObj.imagePost = newestPost.images;
          conversationObj.hasStory = true; // Flag to indicate this is a fresh image
        } else {
          conversationObj.hasStory = false;
        }

        conversationObj.unread = unreadCount;
        
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
      let isCompleted =
        user.name && user.birthday && user.gender && user.hobbies;
      
      isCompleted = !!isCompleted;

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
  markMessagesAsRead = async (req, res) => {
    const conversationId = req.params.conversationId;
    const userId = req.body.id;
    console.log(`[P]::Mark_Messages_As_Read::`, conversationId, userId);

    try {
      const result = await Message.updateMany(
        {
          conversation: conversationId,
          sender: { $ne: userId }, // không phải mình gửi
          status: { $in: ["sent", "delivered"] } // chưa đọc
        },
        { $set: { status: "read" } }
      );

      res.status(200).json({
        message: `${result.modifiedCount} tin nhắn đã được đánh dấu là đã đọc.`,
      });
    } catch (error) {
      console.error("Lỗi:", error);
      res.status(500).json({ message: "Lỗi khi cập nhật tin nhắn." });
    }
  };

  searchUser = async (req, res) => {
    try {
      const searchQuery = req.query.q;  // từ khóa tìm kiếm
      const userId = req.params.userId;  // ID của người dùng hiện tại

      console.log(`[P]::Search_Users::Query::`, searchQuery);
      console.log(`[P]::Search_Users::UserId::`, userId);

      if (!searchQuery) {
        return res.status(400).json({ status: "error", message: "Không có từ khóa tìm kiếm" });
      }

      // Fetch all conversations for the user
      const conversations = await Conversation.find({
        $or: [{ sender: userId }, { receiver: userId }],
        status: 'active'
      })
        .populate('sender', 'name avatar')
        .populate('receiver', 'name avatar')
        .sort({ updatedAt: -1 })
        .exec();

      // Filter conversations where the partner's name matches the search query
      const filteredConversations = conversations.filter(convo => {
        const partner = convo.sender._id.toString() === userId ?
          convo.receiver : convo.sender;
        return partner.name.toLowerCase().includes(searchQuery.toLowerCase());
      });

      // Get basic information for search results
      const searchResults = filteredConversations.map(convo => {
        const partner = convo.sender._id.toString() === userId ?
          convo.receiver : convo.sender;
        return {
          id: convo._id,
          partnerId: partner._id,
          name: partner.name,
          avatar: partner.avatar || 'https://via.placeholder.com/150',
          last_message: convo.last_message
        };
      });

      console.log(`[P]::Search_Users::Results::`, searchResults);

      if (searchResults.length === 0) {
        return res.status(404).json({ status: "error", message: "Không tìm thấy cuộc trò chuyện nào" });
      }

      return res.status(200).json({ status: "success", data: searchResults });
    } catch (error) {
      console.error(`[P]::Search_Users::Error::`, error);
      return res.status(500).json({ status: "error", message: error.message });
    }
  };



}

module.exports = new UserController();
