'use strict'

const express = require('express')
const Joi = require('joi')

const ReportEventsController = require('../../controllers/reports/events')
const ReportVolunteersController = require('../../controllers/reports/volunteers')
const ReportMonetaryDonationController = require('../../controllers/reports/monetary-donations')
const ReportIncomeStatementController = require('../../controllers/reports/income-statement')

const router = express.Router()

const dateRangeQueryValidator = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
})

function validateDateRangeQuery(req, res, next) {
  const { value: validatedQuery, error } = dateRangeQueryValidator.validate(req.query, {
    allowUnknown: true
  })

  if (error !== undefined) {      
    return res.status(400).json({
      code: 'BadRequest',
      status: 400,
      message: error.message
    })
  }

  req.query = {
    ...validatedQuery
  }

  next()
}

async function exportEventsReport(req, res, next) {
  const {
    startDate,
    endDate
  } = req.query

  try {
    const zipFile = await ReportEventsController.export({
      start: startDate,
      end: endDate
    })

    const fileBuffer = zipFile.toBuffer()

    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename=events-report-${Date.now()}.zip`)
    res.setHeader('Content-Length', fileBuffer.length)
    
    res.send(fileBuffer)
  } catch (error) {
    next(error)
  }
}

async function exportVolunteersReport(req, res, next) {
  const {
    startDate,
    endDate
  } = req.query

  try {
    const zipFile = await ReportVolunteersController.export({
      start: startDate,
      end: endDate
    })

    const fileBuffer = zipFile.toBuffer()

    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename=volunteer-report-${Date.now()}.zip`)
    res.setHeader('Content-Length', fileBuffer.length)
    
    res.send(fileBuffer)
  } catch (error) {
    next(error)
  }
}

async function exportMonetaryDonationsReport(req, res, next) {
  const {
    startDate,
    endDate
  } = req.query

  try {
    const zipFile = await ReportMonetaryDonationController.export({
      start: startDate,
      end: endDate
    })

    const fileBuffer = zipFile.toBuffer()

    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename=monetary-donations-report-${Date.now()}.zip`)
    res.setHeader('Content-Length', fileBuffer.length)
    
    res.send(fileBuffer)
  } catch (error) {
    next(error)
  }
}

async function getIncomeStatementReport(req, res, next) {
  const {
    startDate,
    endDate
  } = req.query

  try {
    const zipFile = await ReportIncomeStatementController.export({
      start: startDate,
      end: endDate
    })

    const fileBuffer = zipFile.toBuffer()

    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename=income-and-expenses-report-${Date.now()}.zip`)
    res.setHeader('Content-Length', fileBuffer.length)
    
    res.send(fileBuffer)
  } catch (error) {
    next(error)
  }
}

router.get('/events', validateDateRangeQuery, exportEventsReport)
router.get('/volunteers', validateDateRangeQuery, exportVolunteersReport)
router.get('/monetary-donations', validateDateRangeQuery, exportMonetaryDonationsReport)
router.get('/income-statement', validateDateRangeQuery, getIncomeStatementReport)
// router.get('/inventory-items-by-group', validatePaginationQuery, validateInventoryItemsByGroupQuery, getInventoryItemsByGroupReport)
// router.get('/inventory-items-by-category', validatePaginationQuery, validateInventoryItemsByCategoryQuery, getInventoryItemsByCategoryReport)
// router.get('/deleted-inventory-items', validateDateRangeQuery, validatePaginationQuery, getDeletedInventoryItemsReport)
// router.get('/expiring-inventory-items', validatePaginationQuery, getExpiringInventoryItemsReport)
// router.get('/sdgs', validateDateRangeQuery, getSdgsReport)

module.exports = router
