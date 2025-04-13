const AuthService = require("../services/auth.service")

class AuthController {
  register = async (req, res, next) => {
    console.log(`[P]::Register::`, req.body)
    const { name, email, password } = req.body
    const result = await AuthService.register({ name, email, password })
    
    console.log(`[P]::Register::Result::`, result)

    return res.status(201).json(result)
  }

  
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  updateUserHobbies = async (req, res, next) => {
    console.log(`[P]::UpdateUserHobbies::`, req.body);
    const { userId, hobbies, replace } = req.body;
    const result = await AuthService.updateUserHobbies({ userId, hobbies, replace });

    console.log(`[P]::UpdateUserHobbies::Result::`, result);

    return res.status(200).json(result);
  };
}

module.exports = new AuthController()