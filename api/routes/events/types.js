'use strict'

const express = require('express')
const { Types } = require('mongoose')
const Joi = require('joi')

const EventTypeController = require('../../controllers/events/types')

function validateIdParam(req, res, next) {
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

const createValidator = Joi.object({
  label: Joi.string().trim().min(1).max(500).required(),
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
  } = req.body

  try {
    const results = await EventTypeController.create({
      label,
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
    const { results } = await EventTypeController.list({
      sort: {
        field: sortField,
        order: sortOrder
      }
    })

    return res.json({
      results
    })
  } catch (error) {
    next(error)
  }
}

async function deleteEventType(req, res, next) {
  const { id } = req.params

  try {
    await EventTypeController.deleteEventType(id)

    return res.status(200).json({
      ok: true
    })
  } catch (error) {
    next(error)
  }
}

const router = express.Router()

router.post('/', validateCreate, create)
router.get('/', validateList, list)
router.delete('/:id', validateIdParam, deleteEventType)

module.exports = router
