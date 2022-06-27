'use strict'

const express = require('express')
const { Types } = require('mongoose')
const Joi = require('joi')
const joiObjectId = require('joi-objectid')

const EventEvaluationController = require('../../controllers/events/evaluations')

Joi.objectId = joiObjectId(Joi)

const createValidator = Joi.object({
  eventId: Joi.objectId().required(),
  userId: Joi.objectId().required(),
  evaluation: Joi.object({
    rating: Joi.number().integer().min(1).max(5),
    comment: Joi.string().trim().max(1000),
    sdgAnswers: Joi.array().items(
      Joi.array().items(Joi.any())
    ),
    universalQuestionnaireAnswers: Joi.array().items(Joi.any()),
    questionnaireAnswers: Joi.array().items(Joi.any())
  }).required()
}).options({ 
  stripUnknown: true
})

const listValidator = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(1).default(25),
  'filters.eventId': Joi.objectId(),
  'filters.userId': Joi.objectId()
}).options({ 
  stripUnknown: true
})

function validateCreate(req, res, next) {
  const { value: validatedBody, error } = createValidator.validate(req.body)

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
    eventId,
    userId,
    evaluation
  } = req.body

  try {
    const results = await EventEvaluationController.create(eventId, userId, evaluation)

    return res.status(201).json(results)
  } catch (error) {
    next(error)
  }
}

function validateList(req, res, next) {
  const { value: validatedQuery, error } = listValidator.validate(req.query)

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
    'filters.eventId': filterEventId,
    'filters.userId': filterUserId
  } = req.query

  try {
    const { results, total } = await EventEvaluationController.list({
      offset,
      limit,
      filters: {
        eventId: filterEventId,
        userId: filterUserId,
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

function validateGet(req, res, next) {
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

async function get(req, res, next) {
  const { id } = req.params

  try {
    const results = await EventEvaluationController.get(id)

    return res.json(results)
  } catch (error) {
    next(error)
  }
}

const router = express.Router()

router.post('/', validateCreate, create)
router.get('/', validateList, list)
router.get('/:id', validateGet, get)

module.exports = router
