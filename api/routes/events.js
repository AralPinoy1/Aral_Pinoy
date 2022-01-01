'use strict'

const express = require('express')
const { Types } = require('mongoose')
const Joi = require('joi')
const joiObjectId = require('joi-objectid')
const multer  = require('multer')

Joi.objectId = joiObjectId(Joi)

const EventsController = require('../controllers/events')
const upload = multer({
  limits: {
    fileSize: 5000000 // 5 MB
  }
})

const contactMethodSchema = Joi.object({
  type: Joi.string().valid('MOBILE', 'EMAIL').required(),
  value: Joi.string().trim().max(255).lowercase().required()
})

const contactsSchema = Joi.array().items(
  Joi.object({
    name: Joi.string().trim().max(255).required(),
    contactMethods: Joi.array().items(contactMethodSchema)
  })
)

const jobsSchema = Joi.array().items(
  Joi.object({
    name: Joi.string().trim().max(255).required(),
    description: Joi.string().trim().empty('').max(200),
    requirements: Joi.object({
      max: Joi.number().min(1).default(1)
    }).required(),
    skillIds: Joi.array().items(Joi.objectId()).unique()
  })
)

const questionsSchema = Joi.array().items(
  Joi.object({
    label: Joi.string().trim().max(255).required(),
    type: Joi.string().valid('matrix').required()
  })
)

const createEventValidator = Joi.object({
  name: Joi.string().trim().max(255).required(),
  description: Joi.string().trim().empty('').max(200),
  date: Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().greater(Joi.ref('start')).required(),
  }).required(),
  goals: Joi.object({
    monetaryDonation: Joi.number().default(0).min(0).precision(2)
  }).required(),
  location: Joi.object({
    name: Joi.string().trim().max(500).required()
  }).required(),
  contacts: contactsSchema,
  jobs: jobsSchema,
  sdgIds: Joi.array().items(Joi.objectId()).unique(),
  ikdItems: Joi.array().items(
    Joi.object({
      ikdId: Joi.objectId().required(),
      quantity: Joi.number().min(1).required()
    })
  ),
  questions: questionsSchema
})

const listEventsValidator = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(1).default(25),
  'filters.name': Joi.string().trim().max(100).allow('')
}).options({ 
  stripUnknown: true
})

function validateCreateEventBody(req, res, next) {
  const { value: validatedBody, error } = createEventValidator.validate(req.body)

  if (error !== undefined) {      
    return res.status(400).json({
      code: 'BadRequest',
      status: 400,
      message: error.message
    })
  }

  req.body = validatedBody

  next()
}

async function createEvent(req, res, next) {
  try {
    const results = await EventsController.create({
      ...req.body,
      logoFile: req.file
    })

    return res.status(201).json(results)
  } catch (error) {
    next(error)
  }
}

function validateListEventsBody(req, res, next) {
  const { value: validatedQuery, error } = listEventsValidator.validate(req.query)

  if (error !== undefined) {      
    return res.status(400).json({
      code: 'BadRequest',
      status: 400,
      message: error.message
    })
  }

  req.query = validatedQuery

  next()
}

async function listEvents(req, res, next) {
  const {
    limit,
    offset,
    'filters.name': filterName
  } = req.query

  try {
    const { results, total } = await EventsController.list({
      limit,
      offset,
      filters: {
        name: filterName
      }
    })

    return res.status(200).json({
      results,
      total
    })
  } catch (error) {
    next(error)
  }
}

function validateGetEventBody(req, res, next) {
  const { id } = req.params

  if (!Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      code: 'BadRequest',
      status: 400,
      message: 'ID is invalid'
    })
  }

  next()
}

async function getEvent(req, res, next) {
  const { id } = req.params

  try {
    const event = await EventsController.get(id)

    return res.status(200).json(event)
  } catch (error) {
    next(error)
  }
}

const router = express.Router()

router.post('/', upload.single('logo'), validateCreateEventBody, createEvent)
router.get('/', validateListEventsBody, listEvents)
router.get('/:id', validateGetEventBody, getEvent)

module.exports = router
