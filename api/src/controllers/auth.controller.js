const AuthService = require("../services/auth.service")

class AuthController {
  register = async (req, res, next) => {
    console.log(`[P]::Register::`, req.body)
    const { name, email, password } = req.body
    const result = await AuthService.register({ name, email, password })
    
    console.log(`[P]::Register::Result::`, result)

    return res.status(201).json(result)
  }
}

module.exports = new AuthController();