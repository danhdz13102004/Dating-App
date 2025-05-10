const AuthService = require("../services/auth.service");

class AuthController {
  register = async (req, res, next) => {
    console.log(`[P]::Register::`, req.body);
    const { name, email, password } = req.body;
    const result = await AuthService.register({ name, email, password });

    console.log(`[P]::Register::Result::`, result);

    return res.status(201).json(result);
  };

  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      return res.status(200).json(result);
    } catch (error) {
      console.error(`[P]::Login::Error::`, error);
    // Trả về thông báo lỗi thân thiện
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
    }
  };

  updateUserHobbies = async (req, res, next) => {
    console.log(`[P]::UpdateUserHobbies::`, req.body);
    const { userId, hobbies, replace } = req.body;
    const result = await AuthService.updateUserHobbies({
      userId,
      hobbies,
      replace,
    });

    console.log(`[P]::UpdateUserHobbies::Result::`, result);

    return res.status(200).json(result);
  };

  updateUserGender = async (req, res, next) => {
    try {
      console.log(`[P]::UpdateUserGender::`, req.body);

      const { userId, gender } = req.body;
      const result = await AuthService.updateUserGender({ userId, gender });

      console.log(`[P]::UpdateUserGender::Result::`, result);

      return res.status(200).json({
        status: "success",
        message: "Gender updated successfully",
        data: result,
      });
    } catch (error) {
      console.error(`[P]::UpdateUserGender::Error::`, error);
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      console.log(`[P]::ChangePassword::`, req.body);
      const { userId, currentPassword, newPassword } = req.body;

      if (!userId || !currentPassword || !newPassword) {
        return res
          .status(400)
          .json({
            message: "User ID, current password and new password are required",
          });
      }
      const result = await AuthService.changePassword({
        userId,
        currentPassword,
        newPassword,
      });
      console.log(`[P]::ChangePassword::Result::`, result);
      return res.status(200).json({
        status: "success",
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error(`[P]::ChangePassword::Error::`, error);
      return res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Internal server error",
      });
    }
  };
}

module.exports = new AuthController();
