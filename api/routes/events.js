'use strict'

const express = require('express')
const { Types } = require('mongoose')
const Joi = require('joi')
const joiObjectId = require('joi-objectid')
const multer  = require('multer')

Joi.objectId = joiObjectId(Joi)

const { STATUSES } = require('../constants/events')
const EventsController = require('../controllers/events')

const { provinces, cities } = require('../constants/philippines')

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
    name: Joi.string().trim().max(50).required(),
    description: Joi.string().trim().empty('').max(100),
    requirements: Joi.object({
      max: Joi.number().min(1).default(1)
    }).required(),
    skillIds: Joi.array().items(Joi.objectId(), Joi.string().trim().max(50).empty('')).unique()
  })
)

const questionsSchema = Joi.array().items(
  Joi.object({
    label: Joi.string().trim().max(255).required(),
    type: Joi.string().valid('polar', 'matrix:satisfied', 'matrix:likely').required()
  })
)

const budgetBreakdownSchema = Joi.object({
  type: Joi.string().required(),
  amount: Joi.number().positive().precision(2).required(),
})

const budgetSchema = Joi.object({
  breakdown: Joi.array().items(budgetBreakdownSchema).default([])
})

const createEventValidator = Joi.object({
  name: Joi.string().trim().max(100).required(),
  type: Joi.string().trim().required(),
  description: Joi.string().trim().empty('').max(5000),
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
  questions: questionsSchema,
  budget: budgetSchema,
  saveAsTemplate: Joi.boolean().default(false),
  templateName: Joi.string().trim().max(100),
  templateDescription: Joi.string().trim().empty('').max(5000),
})

const inviteVolunteersSchema = Joi.object({
  userIds : Joi.array().items(Joi.objectId()).unique()
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

const paginationValidator = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(1).default(25),
})

function validatePaginationQuery(req, res, next) {
  const { value: validatedQuery, error } = paginationValidator.validate(req.query, {
    allowUnknown: true
  })

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

const listEventsValidator = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(1).default(25),
  'filters.name': Joi.string().trim().max(100).allow(''),
  'filters.status': [
    Joi.string().valid('UPCOMING', 'ENDED', 'CANCELED'),
    Joi.array().items(
      Joi.string().valid('UPCOMING', 'ENDED', 'CANCELED')
    )
  ],
  'filters.hasMonetaryGoal': Joi.boolean(),
  'sort.field': Joi.string().valid('date.start', 'name'),
  'sort.order': Joi.string().valid('asc', 'desc')
}).options({ 
  stripUnknown: true
})

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
    'filters.name': filterName,
    'filters.status': filterStatus,
    'filters.hasMonetaryGoal': filterHasMonetaryGoal,
    'sort.field': sortField,
    'sort.order': sortOrder
  } = req.query

  let sort

  if (sortField !== undefined && sortOrder !== undefined) {
    sort = {
      field: sortField,
      order: sortOrder
    }
  }

  try {
    const { results, total } = await EventsController.list({
      limit,
      offset,
      filters: {
        name: filterName,
        status: filterStatus,
        hasMonetaryGoal: filterHasMonetaryGoal
      },
      sort
    })

    return res.status(200).json({
      results,
      total
    })
  } catch (error) {
    next(error)
  }
}

function validateIdParams(req, res, next) {
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

const patchEventValidator = Joi.object({
  name: Joi.string().trim().max(100),
  description: Joi.string().allow(null).trim().max(5000),
  location: Joi.object({
    name: Joi.string().trim().max(500).required()
  }),
  date: Joi.object({
    start: Joi.date().iso().required(),
    end: Joi.date().iso().greater(Joi.ref('start')).required(),
  }),
  ikdItems: Joi.array().items(
    Joi.object({
      sku: Joi.string().trim().max(100).uppercase().required(),
      quantity: Joi.number().min(1).required()
    })
  ),
  jobs: jobsSchema,
})

function validatePatchEvent(req, res, next) {
  const { value: validatedBody, error } = patchEventValidator.validate(req.body)

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

async function patchEvent(req, res, next) {
  const { id } = req.params
  const { 
    name,
    description,
    location,
    date,
    ikdItems,
    jobs
  } = req.body

  try {
    await EventsController.update(id, {
      name,
      description,
      location,
      date,
      ikdItems,
      jobs
    })

    return res.status(200).json({
      ok: true
    })
  } catch (error) {
    next(error)
  }
}

const patchEventStatusValidator = Joi.object({
  status: Joi.string().valid(STATUSES.ENDED, STATUSES.CANCELED).required(),
  incidents: Joi.array().items(Joi.string().trim().empty('')),
  itemsUnused: Joi.array().items(Joi.object({
    sku: Joi.string().required(),
    quantity: Joi.number().min(0).integer().required()
  })),
  expenses: Joi.array().items(
    Joi.object({
      amount: Joi.number().positive().precision(2).required(),
      type: Joi.string().required(),
      remarks: Joi.string().trim().max(300).empty('')
    })
  ),
  absentUsers: Joi.array().items({
    userId: Joi.objectId().required(),
    shouldPenalize: Joi.boolean().default(false)
  }),
  review: Joi.string().trim().empty('').max(5000),
})

function validatePatchEventStatusBody(req, res, next) {
  const { value: validatedBody, error } = patchEventStatusValidator.validate(req.body)

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

async function patchEventStatus(req, res, next) {
  const { id } = req.params
  const { 
    status,
    incidents,
    itemsUnused,
    expenses,
    absentUsers,
    review
  } = req.body

  try {
    await EventsController.updateStatus(id, {
      status,
      incidents,
      itemsUnused,
      expenses,
      absentUsers,
      review
    })

    return res.status(200).json({
      ok: true
    })
  } catch (error) {
    next(error)
  }
}

const getRecommendedVolunteersValidator = Joi.object({
  'filters.skillIds': Joi.array().items(Joi.objectId()).unique(),
  'filters.location.provinces': Joi.array().items(
    Joi.string().valid(...provinces)
  ).unique(),
  'filters.location.cities': Joi.array().items(
    Joi.string().valid(...cities)
  ).unique(),
})

function validateGetRecommendedVolunteersQuery(req, res, next) {
  const { value: validatedQuery, error } = getRecommendedVolunteersValidator.validate(req.query, {
    allowUnknown: true
  })

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

async function getRecommendedVolunteers(req, res, next) {
  const { id } = req.params
  const { 
    offset,
    limit,
    'filters.skillIds': filterSkillIds,
    'filters.location.provinces': filterLocationProvinces,
    'filters.location.cities': filterLocationCities,
  } = req.query

  try {
    const { results, total } = await EventsController.getRecommendedVolunteers(id, {
      offset,
      limit,
      filters: {
        skillIds: filterSkillIds,
        location: {
          provinces: filterLocationProvinces,
          cities: filterLocationCities
        }
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

function validateInviteVolunteersBody(req, res, next) {
  const { value: validatedBody, error } = inviteVolunteersSchema.validate(req.body)

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

async function inviteUsers(req, res, next) {
  const { id } = req.params
  const { userIds } = req.body

  try {
    await EventsController.inviteVolunteers(id, userIds)

    return res.status(200).json({
      ok: true
    })
  } catch (error) {
    next(error)
  }
}

const router = express.Router()

router.post('/', upload.single('logo'), validateCreateEventBody, createEvent)

router.get('/', validateListEventsBody, listEvents)

router.get('/:id', validateIdParams, getEvent)

router.patch('/:id', validatePatchEvent, patchEvent)

router.patch('/:id/status', validateIdParams, validatePatchEventStatusBody, patchEventStatus)

router.get('/:id/recommended-volunteers', validateIdParams, validatePaginationQuery, validateGetRecommendedVolunteersQuery, getRecommendedVolunteers)

router.post('/:id/invite-volunteers', validateIdParams, validateInviteVolunteersBody, inviteUsers)

module.exports = router
