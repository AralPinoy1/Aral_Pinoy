'use strict'

const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  event: {
    type: mongoose.Types.ObjectId,
    ref: 'Event',
    index: true
  },
  rating: Number,
  comment: String,
  sdgAnswers: {
    type: [{
      type: [mongoose.Schema.Types.Mixed],
      default: undefined
    }]
  },
  universalQuestionnaireAnswers: {
    type: [mongoose.Schema.Types.Mixed],
    default: undefined
  },
  questionnaireAnswers: {
    type: [mongoose.Schema.Types.Mixed],
    default: undefined
  }
}, {
  id: false,
  collection: 'eventEvaluations',
  validateBeforeSave: false,
})

schema.index({
  user: 1,
  event: 1
}, {
  unique: true
})

module.exports = mongoose.model('EventEvaluation', schema)
