'use strict'

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const compression = require('compression')
const appConfig = require('./configs/app.config')
const app = express()

/**
 * Initialize Middlewares
 */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(compression())

/**
 * Initialize Routes
 */
// console.log(appConfig.API_PREFIX)
app.use(`${appConfig.API_PREFIX}`, require('./routes'))

/**
 * Error Handling
 */
app.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500
  
  res.status(statusCode).json({
    error: {
      status: err.errorType || (statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'),
      code: statusCode
    },
    message: err.message || 'Internal Server Error',
  })
})

module.exports = app;
