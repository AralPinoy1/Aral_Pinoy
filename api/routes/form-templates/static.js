'use strict'

const fs = require('fs')
const path = require('path')

const express = require('express')

const incidentsFormFilePath = path.resolve(__dirname, '../../form-templates/static', './incidents_form.pdf')
const reviewFormFilePath = path.resolve(__dirname, '../../form-templates/static', './review_form.pdf')

async function showIncidentsForm(req, res) {
  const stat = fs.statSync(incidentsFormFilePath)

  res.setHeader('Content-Length', stat.size)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename=incidents_form.pdf')

  const file = fs.createReadStream(incidentsFormFilePath)

  file.pipe(res)
}

async function showReviewForm(req, res) {
  const stat = fs.statSync(reviewFormFilePath)

  res.setHeader('Content-Length', stat.size)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename=review_form.pdf')

  const file = fs.createReadStream(reviewFormFilePath)

  file.pipe(res)
}

const router = express.Router()

router.get('/incidents-form', showIncidentsForm)
router.get('/review-form', showReviewForm)

module.exports = router
