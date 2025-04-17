const UserService = require("../services/user.service");

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
}

module.exports = new UserController();
