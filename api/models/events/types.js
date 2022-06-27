'use strict'

const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  label: String,
  norm: {
    type: String,
    unique: true,
    select: false
  }
}, {
  collection: 'eventTypes',
  id: false,
  validateBeforeSave: false,
  toObject: {
    getters: true
  },
  toJSON: {
    getters: true
  }
})

module.exports = mongoose.model('EventType', schema)
