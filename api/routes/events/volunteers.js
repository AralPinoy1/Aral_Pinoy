'use strict'

const express = require('express')
const { Types } = require('mongoose')
const Joi = require('joi')
const joiObjectId = require('joi-objectid')

const EventVolunteerController = require('../../controllers/events/volunteers')

Joi.objectId = joiObjectId(Joi)

const createEventVolunteerValidator = Joi.object({
  userId: Joi.objectId().required(),
  eventId: Joi.objectId().required(),
  eventJobName: Joi.string().trim().required()
}).options({
  stripUnknown: true
})

const listEventVolunteersValidator = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(1).default(25),
  expand: Joi.boolean().default(false),
  'filters.userId': Joi.objectId(),
  'filters.eventId': Joi.objectId(),
  'sort.field': Joi.string().valid('event.date.start'),
  'sort.order': Joi.string().valid('asc', 'desc')
}).options({ 
  stripUnknown: true
})

const replaceEventVolunteerValidator = Joi.object({
  eventJobName: Joi.string().trim().required()
}).options({
  stripUnknown: true
})

function validateCreateEventVolunteerBody(req, res, next) {
  const { value: validatedBody, error } = createEventVolunteerValidator.validate(req.body)

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

async function create(req, res, next) {
  const {
    userId,
    eventId,
    eventJobName
  } = req.body

  try {
    const results = await EventVolunteerController.create(userId, eventId, eventJobName)

    return res.status(201).json(results)
  } catch (error) {
    next(error)
  }
}

function validateListEventVolunteersBody(req, res, next) {
  const { value: validatedQuery, error } = listEventVolunteersValidator.validate(req.query)

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

async function list(req, res, next) {
  const {
    offset,
    limit,
    expand,
    'filters.eventStatuses': filterEventStatuses,
    'filters.userId': filterUserId,
    'filters.eventId': filterEventId,
    'sort.field': sortField,
    'sort.order': sortOrder
  } = req.query

  try {
    const filters = {
      userId: filterUserId,
      eventId: filterEventId,
    }

    if (filterEventStatuses !== undefined) {
      filters.eventStatuses = filterEventStatuses
    }

    const { results, total } = await EventVolunteerController.list({
      offset,
      limit,
      expand,
      filters,
      sort: {
        field: sortField,
        order: sortOrder
      }
    })

    return res.json({
      results,
      total
    })
  } catch (error) {
    next(error)
  }
}

function validateParamsId(req, res, next) {
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

function validateReplaceRequest(req, res, next) {
  const { value: validatedBody, error } = replaceEventVolunteerValidator.validate(req.body)

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

async function replaceEventVolunteer(req, res, next) {
  const { id } = req.params
  const { eventJobName } = req.body

  try {
    await EventVolunteerController.replace(id, eventJobName)

    return res.json({
      ok: true
    })
  } catch (error) {
    next(error)
  }
}

async function deleteEventVolunteer(req, res, next) {
  const { id } = req.params

  try {
    await EventVolunteerController.delete(id)

    return res.json({
      ok: true
    })
  } catch (error) {
    next(error)
  }
}

const router = express.Router()

router.post('/', validateCreateEventVolunteerBody, create)
router.get('/', validateListEventVolunteersBody, list)
router.put('/:id', validateParamsId, validateReplaceRequest, replaceEventVolunteer)
router.delete('/:id', validateParamsId, deleteEventVolunteer)

module.exports = router
