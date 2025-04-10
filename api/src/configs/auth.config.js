const jwt = require('jsonwebtoken')

const generateToken = (payload, secretKey, options = {}) => {
  const tokenOptions = {
    expiresIn: '1h',
    algorithm: 'HS256',
    ...options,
  }
  return jwt.sign(payload, secretKey, options)
}

const generateAuthToken = (payload, accessSercretKey, refreshSecretKey) => {
  const accessToken = generateToken(payload, accessSercretKey, { expiresIn: '15m' })
  const refreshToken = generateToken(payload, refreshSecretKey, { expiresIn: '7d' })
  return { accessToken, refreshToken }
}

const verifyToken = (token, secretKey) => {
  try {
    return jwt.verify(token, secretKey)
  } catch (error) {
    return null
  }
}

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateAuthToken,
  verifyToken,
  decodeToken,
}
