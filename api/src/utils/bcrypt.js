const bcrypt = require('bcryptjs')

const SALT_ROUNDS = 10

const hashPassword = async (password, saltRounds = SALT_ROUNDS) => {
  try {
    return await bcrypt.hash(password, saltRounds)
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Password hashing failed')
  }
}

const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Error comparing passwords:', error)
    throw new Error('Password comparison failed')
  }
};

module.exports = {
  hashPassword,
  comparePassword
};