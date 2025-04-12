const UserService = require("../services/user.service")

class UserController {
  update = async (req, res, next) => {
    console.log(`[P]::User_Update::`, req.body)
    const { userId, name, birthday, avaURL } = req.body
    const result = await UserService.update({ userId, name, birthday, avaURL })
    
    console.log(`[P]::User_Update::Result::`, result)

    return res.status(201).json(result)
  }
}

module.exports = new UserController();