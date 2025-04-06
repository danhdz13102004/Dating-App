
const express = require('express');
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const compression = require('compression')
const bodyParser = require('body-parser')


const app = express()

/**
 * Initialize Middlewares
 */
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser)
app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(compression())

/**
 * Initialize Routes
 */
app.get('/', (req, res) => {
  res.send('Hello World!')
})

/**
 * Error Handling
 */

module.exports = app
