'use strict'

const express = require('express')
const debug = require('debug')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const jwtMiddleware = require('express-jwt')

const config = require('./config')
const { AppError } = require('./errors')

require('./google/oauth')

const mainRouter = require('./routes/main')
const adminRouter = require('./routes/admin')
const forgotPasswordRouter = require('./routes/forgot-password')
const googleOAuthRouter = require('./routes/google-oauth')
const sdgsRouter = require('./routes/sdgs')
const skillsRouter = require('./routes/skills')
const usersRouter = require('./routes/users')
const monetaryDonationsRouter = require('./routes/monetary-donations')
const cronRouter = require('./routes/cron')
const reportsRouter = require('./routes/reports')

const eventsRouter = require('./routes/events')
const eventDonationsRouter = require('./routes/events/donations')
const eventEvaluationsRouter = require('./routes/events/evaluations')
const eventExpensesRouter = require('./routes/events/expenses')
const eventVolunteersRouter = require('./routes/events/volunteers')
const eventTemplatesRouter = require('./routes/events/templates')
const eventDocumentationsRouter = require('./routes/events/documentations')
const eventQuestionsRouter = require('./routes/events/questions')
const eventTypesRouter = require('./routes/events/types')

const inkindDonationsRouter = require('./routes/inkind-donations')
const ikdCategoriesRouter = require('./routes/inkind-donations/categories')
const ikdDonorsRouter = require('./routes/inkind-donations/donors')
const ikdGroupsRouter = require('./routes/inkind-donations/groups')
const ikdOrganizationsRouter = require('./routes/inkind-donations/organizations')
const ikdTransactionsRouter = require('./routes/inkind-donations/transactions')
const ikdOutboundTransactionsRouter = require('./routes/inkind-donations/outbound-transactions')

const ledgerTransactionsRouter = require('./routes/ledger/transactions')

const notificationsRouter = require('./routes/notifications')

const formTemplatesStaticRouter = require('./routes/form-templates/static')

const seedSdgs = require('./db/seeders/sdg')
const seedEventQuestions = require('./db/seeders/event-questions')
const seedEventTypes = require('./db/seeders/event-types')

const setupCronJobs = require('./cron-jobs/index')

const logger = debug('api:server')

async function connectDatabase () {
  await mongoose.connect(config.mongodb.uri)

  logger('Connected to MongoDB Database')
}

const publicRoutes = [
  '/login', 
  '/google-sign-in',
  '/google-oauth/sign-in',
  '/register',
  '/forgot-password',
  /^\/forgot-password\/[a-zA-Z0-9-_]/,
  '/admin/login',
  {
    url: '/skills',
    methods: ['GET']
  },
  {
    url: '/events',
    methods: ['GET']
  },
  {
    url: /^\/events\/[0-9a-fA-F]{24}/,
    methods: ['GET']
  },
  {
    url: '/event-donations',
    methods: ['POST']
  },
  {
    url: /^\/event-donations\/[A-Z0-9-]{36}\/redirectUri/,
    methods: ['GET']
  },
  {
    url: '/monetary-donations',
    methods: ['POST']
  },
  {
    url: /^\/monetary-donations\/[A-Z0-9-]{36}\/redirectUri/,
    methods: ['GET']
  },
  {
    url: /^\/form-templates\/static\/*/,
    methods: ['GET']
  },
]

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  jwtMiddleware({ 
    secret: config.jwt.secret, 
    algorithms: ['HS256']
  }).unless({
    path: publicRoutes
  })
)

app.use('/', mainRouter)
app.use('/admin', adminRouter)
app.use('/users', usersRouter)
app.use('/skills', skillsRouter)
app.use('/forgot-password', forgotPasswordRouter)
app.use('/google-oauth', googleOAuthRouter)
app.use('/sdgs', sdgsRouter)
app.use('/monetary-donations', monetaryDonationsRouter)
app.use('/cron', cronRouter)
app.use('/reports', reportsRouter)

app.use('/events', eventsRouter)
app.use('/event-donations', eventDonationsRouter)
app.use('/event-evaluations', eventEvaluationsRouter)
app.use('/event-expenses', eventExpensesRouter)
app.use('/event-volunteers', eventVolunteersRouter)
app.use('/event-templates', eventTemplatesRouter)
app.use('/event-documentations', eventDocumentationsRouter)
app.use('/event-questions', eventQuestionsRouter)
app.use('/event-types', eventTypesRouter)

app.use('/inkind-donations', inkindDonationsRouter)
app.use('/inkind-donation-categories', ikdCategoriesRouter)
app.use('/inkind-donation-donors', ikdDonorsRouter)
app.use('/inkind-donation-groups', ikdGroupsRouter)
app.use('/inkind-donation-organizations', ikdOrganizationsRouter)
app.use('/inkind-donation-transactions', ikdTransactionsRouter)
app.use('/inkind-donation-outbound-transactions', ikdOutboundTransactionsRouter)

app.use('/ledger-transactions', ledgerTransactionsRouter)

app.use('/notifications', notificationsRouter)

app.use('/form-templates/static', formTemplatesStaticRouter)

app.use(function (req, res, next) {
  res.status(404).json({
    code: 'NotFound',
    status: 404,
    message: `The requested URL [${req.method} ${req.originalUrl}] was not found on this server.`
  })

  next()
})

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      code: 'Unauthorized',
      status: 401,
      message: err.message
    })
  }

  logger(err)

  if (err instanceof AppError) {
    return res.status(err.status).json(err.toJSON()) 
  }

  res.status(500).json({
    code: 'Internal Server Error',
    status: 500,
    message: 'The server encountered an internal error and was unable to complete your request.'
  })

  next()
})

async function onSetup() {
  await connectDatabase()
  await Promise.all([
    seedSdgs(),
    seedEventQuestions(),
    seedEventTypes()
  ])
  await setupCronJobs()

  app.emit('ready')
}

app.once('setup', onSetup)

module.exports = app
