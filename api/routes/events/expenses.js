'use strict'

const express = require('express')
const { Types } = require('mongoose')
const Joi = require('joi')
const joiObjectId = require('joi-objectid')

const EventExpenseController = require('../../controllers/events/expenses')

Joi.objectId = joiObjectId(Joi)

const listValidator = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(1).default(25),
  grouped: Joi.boolean().default(false),
  'filters.eventId': Joi.objectId(),
  'sort.field': Joi.string().valid('createdAt', 'amount'),
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
    offset,
    limit,
    grouped,
    'filters.eventId': filterEventId,
    'sort.field': sortField,
    'sort.order': sortOrder
  } = req.query

  let results
  let total

  try {
    if (grouped) {
      const groupListResult = await EventExpenseController.groupList({
        offset,
        limit,
        sort: {
          field: sortField,
          order: sortOrder
        }
      })
  
      results = groupListResult.results
      total = groupListResult.total
    } else {
      const listResult = await EventExpenseController.list({
        offset,
        limit,
        grouped,
        filters: {
          eventId: filterEventId,
        },
        sort: {
          field: sortField,
          order: sortOrder
        }
      })

      results = listResult.results
      total = listResult.total
    }
  
    return res.json({
      results,
      total
    })
  } catch (error) {
    next(error)
  }
}

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

async function get(req, res, next) {
  const { id } = req.params

  try {
    const results = await EventExpenseController.get(id)

    return res.json(results)
  } catch (error) {
    next(error)
  }
}

const router = express.Router()

router.get('/', validateList, list)
router.get('/:id', validateIdParam, get)

module.exports = router
