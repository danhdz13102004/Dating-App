const User = require("../models/User")
const { NotFoundError } = require("../core/error.response")

class ProfileService {
  static getProfile = async (userId) => {
    const user = await User.findById(userId).select('-password -updatedAt')

    if (!user) {
      throw new NotFoundError("User not found")
    }

    return {
      status: 'success',
      message: 'Profile retrieved successfully',
      data: user
    }
  }

  static updateAvatar = async ({ userId, avatarUrl }) => {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password')

    if (!updatedUser) {
      throw new NotFoundError("User not found")
    }

    return {
      status: 'success',
      message: 'Avatar updated successfully',
      data: {
        userId: updatedUser._id,
        avatar: updatedUser.avatar
      }
    }
  }

  static updateProfile = async ({ userId, profileData }) => {
    const allowedFields = [
      'name', 'description', 'gender', 'hobbies', 'avatar', 'profileImgs',
      'preference', 'birthday'
    ]
    
    const updateData = Object.keys(profileData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = profileData[key]
        return obj
      }, {})

    console.log("Update data for profile:", updateData)
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password')

    if (!updatedUser) {
      throw new NotFoundError('User not found')
    }

    return {
      status: 'success',
      message: 'Profile updated successfully',
      data: updatedUser
    }
  }
}

module.exports = ProfileService