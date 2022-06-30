'use strict'

const express = require('express')
const { Types } = require('mongoose')

const EventFormController = require('../../controllers/events/forms')

const router = express.Router()

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

async function getVolunteerAttendanceFile(req, res, next) {
  const { id } = req.params

  try {
    const document = await EventFormController.getVolunteerAttendanceFile(id)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=volunteer_attendance_${id}.pdf`)
  
    document.pipe(res)
  
    document.end()
  } catch (error) {
    next(error)
  }
}

async function getInventoryListFile(req, res, next) {
  const { id } = req.params

  try {
    const document = await EventFormController.getInventoryListFile(id)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=inventory_list_${id}.pdf`)
  
    document.pipe(res)
  
    document.end()
  } catch (error) {
    next(error)
  }
}

async function getExpenseBreakdownFile(req, res, next) {
  const { id } = req.params

  try {
    const document = await EventFormController.getExpenseBreakdownFile(id)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=expense_breakdown_${id}.pdf`)
  
    document.pipe(res)
  
    document.end()
  } catch (error) {
    next(error)
  }
}

router.get('/volunteer-attendance-file/:id', validateIdParams, getVolunteerAttendanceFile)
router.get('/inventory-list-file/:id', validateIdParams, getInventoryListFile)
router.get('/expense-breakdown-file/:id', validateIdParams, getExpenseBreakdownFile)

module.exports = router
