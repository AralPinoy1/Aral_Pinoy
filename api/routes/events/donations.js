'use strict'

const express = require('express')
const Joi = require('joi')
const joiObjectId = require('joi-objectid')

const EventDonationController = require('../../controllers/events/donations')

const config = require('../../config')

Joi.objectId = joiObjectId(Joi)

const metadataSchema = Joi.object({
  contactDetails: Joi.object({
    firstName: Joi.string().trim().allow(''),
    middleName: Joi.string().trim().allow(''),
    lastName: Joi.string().trim().allow(''),
    email: Joi.string().trim().allow(''),
    phone: Joi.string().trim().allow(''),
  })
})

const referenceNumberSchema = Joi.string().trim().min(36)

const createEventDonationsValidator = Joi.object({
  eventId: Joi.objectId().required(),
  userId: Joi.objectId(),
  amount: Joi.number().min(1).precision(2).required(),
  referenceNumber: referenceNumberSchema.required(),
  metadata: metadataSchema
}).options({
  stripUnknown: true
})

const eventDonationRedirectUriValidator = Joi.object({
  eventId: Joi.objectId().required(),
  status: Joi.string().valid('SUCCESS', 'FAILED', 'CANCELED').required()
}).options({ 
  stripUnknown: true
})

const listValidator = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(1).max(500).default(25),
  expand: Joi.boolean().default(false),
  'filters.status': Joi.string().valid('success', 'failed'),
  'filters.userId': Joi.objectId(),
  'filters.eventId': Joi.objectId(),
  'sort.field': Joi.string().valid('updatedAt', 'createdAt', 'amount'),
  'sort.order': Joi.string().valid('asc', 'desc')
}).options({ 
  stripUnknown: true
})

const deleteEventDonationsValidator = Joi.object({
  reason: Joi.string().trim().min(1).max(100).required(),
  type: Joi.string().valid('void', 'refund').required()
}).options({
  stripUnknown: true
})


function validateCreateEventDonationBody(req, res, next) {
  const { value: validatedBody, error } = createEventDonationsValidator.validate(req.body)

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
    const results = await EventDonationController.create(req.body)

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

function validateEventDonationRedirectUriQuery(req, res, next) {
  const { error } = eventDonationRedirectUriValidator.validate(req.query)

  if (error !== undefined) {
    return res.status(400).json({
      code: 'BadRequest',
      status: 400,
      message: error.message
    })
  }

  next()
}

async function redirectEventDonation(req, res, next) {
  const { id } = req.params
  const { eventId, status } = req.query

  try {
    await EventDonationController.handleRedirection(id)

    let url = `${config.volunteer.domainName}/#/events/${eventId}`

    const queryString = new URLSearchParams()

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
    'filters.eventId': filterEventId,
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
    const { results, total } = await EventDonationController.list({
      offset,
      limit,
      expand,
      filters: {
        status: filterStatus,
        userId: filterUserId,
        eventId: filterEventId
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

function validateDeleteEventDonationBody(req, res, next) {
  const { value: validatedBody, error } = deleteEventDonationsValidator.validate(req.body)

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

async function reverseEventDonation(req, res, next) {
  const { id } = req.params
  const {
    reason,
    type,
  } = req.body

  try {
    await EventDonationController.reverseDonation(id, {
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

router.post('/', validateCreateEventDonationBody, create)
router.get('/', validateListBody, list)
router.get('/:id/redirectUri', validateReferenceNumberParam, validateEventDonationRedirectUriQuery, redirectEventDonation)
router.delete('/:id', validateReferenceNumberParam, validateDeleteEventDonationBody, reverseEventDonation)

module.exports = router
