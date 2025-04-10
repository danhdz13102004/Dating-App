'use strict'

const HttpStatus = require('../core/httpStatus')

class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = statusCode // Use numeric status code here
    this.errorType = `${statusCode}`.startsWith('4') ? 'fail' : 'error' // Save string indicator as a different property
    
    Error.captureStackTrace(this, this.constructor)
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, HttpStatus.BAD_REQUEST.code)
  }
}

class AuthFailureError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, HttpStatus.UNAUTHORIZED.code)
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND.code)
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN.code)
  }
}

class ConflictRequestError extends AppError {
  constructor(message = 'Conflict') {
    super(message, HttpStatus.CONFLICT.code)
  }
}

module.exports = {
  AppError,
  BadRequestError,
  AuthFailureError,
  NotFoundError,
  ForbiddenError,
  ConflictRequestError
}