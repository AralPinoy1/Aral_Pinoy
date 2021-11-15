'use strict'

const mongoose = require('mongoose')

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String
})

module.exports = mongoose.model('Skill', skillSchema)
