'use strict'

const express = require('express')
const Joi = require('joi')

const EventQuestionController = require('../../controllers/events/questions')

const createValidator = Joi.object({
  label: Joi.string().trim().min(1).max(500).required(),
  type: Joi.string().valid('matrix:satisfied', 'matrix:likely').required(),
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
    label,
    type
  } = req.body

  try {
    const results = await EventQuestionController.create({
      label,
      type
    })

    return res.status(201).json(results)
  } catch (error) {
    next(error)
  }
}

const listValidator = Joi.object({
  'sort.field': Joi.string().valid('label'),
  'sort.order': Joi.string().valid('asc', 'desc')
}).options({ 
  stripUnknown: true
})

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
    'sort.field': sortField,
    'sort.order': sortOrder
  } = req.query

  try {
    const { results } = await EventQuestionController.list({
      sort: {
        field: sortField,
        order: sortOrder
      }
    })

    return res.json(results)
  } catch (error) {
    next(error)
  }
}

const router = express.Router()

router.post('/', validateCreate, create)
router.get('/', validateList, list)

module.exports = router
