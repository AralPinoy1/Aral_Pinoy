'use strict'

const express = require('express')
const Joi = require('joi')
const joiObjectId = require('joi-objectid')

const MonetaryDonationController = require('../controllers/monetary-donations')

const config = require('../config')

Joi.objectId = joiObjectId(Joi)

const metadataSchema = Joi.object({
  contactDetails: Joi.object({
    firstName: Joi.string().trim().allow(''),
    middleName: Joi.string().trim().allow(''),
    lastName: Joi.string().trim().allow(''),
    email: Joi.string().trim().allow(''),
    phone: Joi.string().trim().allow(''),
    companyName: Joi.string().trim().allow(''),
  })
})

const referenceNumberSchema = Joi.string().trim().min(36)

const createValidator = Joi.object({
  userId: Joi.objectId(),
  amount: Joi.number().min(1).precision(2).required(),
  referenceNumber: referenceNumberSchema.required(),
  metadata: metadataSchema
}).options({
  stripUnknown: true
})

const redirectUriValidator = Joi.object({
  status: Joi.string().valid('SUCCESS', 'FAILED', 'CANCELED').required()
}).options({ 
  stripUnknown: true
})

const listValidator = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(1).max(500).default(25),
  expand: Joi.boolean().default(false),
  'filters.status': [
    Joi.string().valid('success', 'failed', 'pending', 'refunded', 'voided'),
    Joi.array().items(
      Joi.string().valid('success', 'failed', 'pending', 'refunded', 'voided')
    )
  ],
  'filters.userId': Joi.objectId(),
  'sort.field': Joi.string().valid('updatedAt', 'createdAt', 'amount'),
  'sort.order': Joi.string().valid('asc', 'desc')
}).options({ 
  stripUnknown: true
})

const reverseDonationValidator = Joi.object({
  reason: Joi.string().trim().min(1).max(100).required(),
  type: Joi.string().valid('void', 'refund').required()
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
  try {
    const results = await MonetaryDonationController.create(req.body)

    return res.status(201).json(results)
  } catch (error) {
    next(error)
  }
}

function validateReferenceNumberParam(req, res, next) {
  const { id } = req.params

  const { error } = referenceNumberSchema.validate(id)

  if (error !== undefined) {
    return res.status(400).json({
      code: 'BadRequest',
      status: 400,
      message: 'ID is invalid'
    })
  }

  next()
}

function validateRedirectUriQuery(req, res, next) {
  const { error } = redirectUriValidator.validate(req.query)

  if (error !== undefined) {
    return res.status(400).json({
      code: 'BadRequest',
      status: 400,
      message: error.message
    })
  }

  next()
}

async function redirectMonetaryDonation(req, res, next) {
  const { id } = req.params
  const { status } = req.query

  try {
    await MonetaryDonationController.handleRedirection(id)

    let url = `${config.volunteer.domainName}/#/events`

    const queryString = new URLSearchParams()

    queryString.set('scroll', 'about')

    if (status !== 'CANCELED') {
      queryString.set('donationSuccess', status === 'SUCCESS')
      queryString.set('referenceNumber', id)
    }

    return res.redirect(`${url}?${queryString.toString()}`)
  } catch (error) {
    next(error)
  }
}

function validateListBody(req, res, next) {
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
    expand,
    'filters.status': filterStatus,
    'filters.userId': filterUserId,
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
    const { results, total } = await MonetaryDonationController.list({
      offset,
      limit,
      expand,
      filters: {
        status: filterStatus,
        userId: filterUserId,
      },
      sort
    })

    return res.json({
      results,
      total
    })
  } catch (error) {
    next(error)
  }
}

function validateReverse(req, res, next) {
  const { value: validatedBody, error } = reverseDonationValidator.validate(req.body)

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

async function reverseMonetaryDonation(req, res, next) {
  const { id } = req.params
  const {
    reason,
    type,
  } = req.body

  try {
    await MonetaryDonationController.reverseDonation(id, {
      reason,
      type
    })

    return res.json({
      ok: true
    })
  } catch (error) {
    next(error)
  }
}

const router = express.Router()

router.post('/', validateCreate, create)
router.get('/', validateListBody, list)
router.get('/:id/redirectUri', validateReferenceNumberParam, validateRedirectUriQuery, redirectMonetaryDonation)
router.delete('/:id', validateReferenceNumberParam, validateReverse, reverseMonetaryDonation)

module.exports = router
