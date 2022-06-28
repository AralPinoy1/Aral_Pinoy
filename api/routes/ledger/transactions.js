'use strict'

const express = require('express')
const Joi = require('joi')
const multer  = require('multer')
const joiObjectId = require('joi-objectid')

const LedgerTransactionController = require('../../controllers/ledger/transactions')

Joi.objectId = joiObjectId(Joi)

const { TRANSACTION_TYPES } = require('../../constants/ledger')

const upload = multer({
  limits: {
    fileSize: 50000000 // 50 MB
  }
})

const createValidator = Joi.object({
  type: Joi.string().valid(TRANSACTION_TYPES.WITHDRAWAL).required(),
  amount: Joi.number().min(0).precision(2).required(),
  date: Joi.date().iso().required(),
  metadata: Joi.object({
    eventId: Joi.objectId(),
  })
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
    type,
    amount,
    date,
    metadata = {}
  } = req.body

  try {
    const results = await LedgerTransactionController.create({
      type,
      amount,
      date: new Date(date),
      metadata: {
        eventId: metadata.eventId,
        receipt: req.file 
      }
    })

    return res.status(201).json(results)
  } catch (error) {
    next(error)
  }
}

const listValidator = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(1).default(25),
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
    'sort.field': sortField,
    'sort.order': sortOrder
  } = req.query

  try {
    const listResult = await LedgerTransactionController.list({
      offset,
      limit,
      sort: {
        field: sortField,
        order: sortOrder
      }
    })
  
    return res.json({
      results: listResult.results,
      total: listResult.total
    })
  } catch (error) {
    next(error)
  }
}

const router = express.Router()

router.post('/', upload.single('receipt'), validateCreate, create)
router.post('/', validateCreate, create)
router.get('/', validateList, list)

module.exports = router
