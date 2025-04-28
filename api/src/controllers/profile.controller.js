'use strict'

const HttpStatus = require("../core/httpStatus")
const ProfileService = require("../services/profile.service")

class ProfileController {
  getProfile = async (req, res, next) => {
    console.log(`[Profile]::GetProfile::`, req.params)

    const userId = req.params.userId || req.params.userId
    
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required."
      })
    }

    const result = await ProfileService.getProfile(userId)

    console.log(`[Profile]::GetProfile::Result::`, result)

    return res.status(HttpStatus.OK.code).json(result)
  }

  updateAvatar = async (req, res, next) => {
    try {
      console.log(`[Profile]::UpdateAvatar::`, req.body)

      const { userId, avatarUrl } = req.body
      
      if (!userId || !avatarUrl) {
        return res.status(400).json({
          status: "error",
          message: "User ID and avatar URL are required."
        })
      }

      const result = await ProfileService.updateAvatar({ userId, avatarUrl })

      console.log(`[Profile]::UpdateAvatar::Result::`, result)

      return res.status(HttpStatus.OK.code).json(result)
    } catch (error) {
      console.error(`[Profile]::UpdateAvatar::Error::`, error)
      next(error)
    }
  }

  updateProfile = async (req, res, next) => {
    try {
      console.log(`[Profile]::UpdateProfile::`, req.body)

      const { userId } = req.body
      if (!userId) {
        return res.status(400).json({
          status: "error",
          message: "User ID is required."
        })
      }

      // Remove userId from the data to be updated
      const { userId: _, ...profileData } = req.body
      
      // Log birthday data specifically
      console.log(`[Profile]::UpdateProfile::Birthday::`, profileData.birthday)

      const result = await ProfileService.updateProfile({ 
        userId, 
        profileData 
      })

      console.log(`[Profile]::UpdateProfile::Result::`, result)

      return res.status(HttpStatus.OK.code).json(result)
    } catch (error) {
      console.error(`[Profile]::UpdateProfile::Error::`, error)
      next(error)
    }
  }
}

module.exports = new ProfileController()