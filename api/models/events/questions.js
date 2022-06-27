'use strict'

const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  label: String,
  norm: {
    type: String,
    unique: true,
    select: false
  },
  type: {
    type: String
  },
  eventTypes: {
    type: [String],
    default: []
  }
}, {
  collection: 'eventQuestions',
  id: false,
  validateBeforeSave: false,
  toObject: {
    getters: true
  },
  toJSON: {
    getters: true
  }
})

module.exports = mongoose.model('EventQuestion', schema)
